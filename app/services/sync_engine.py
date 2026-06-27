import logging
import threading
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from sqlalchemy import text, case
from datetime import datetime, timezone, timedelta

from app.db.session import LocalSessionLocal, CloudSessionLocal, cloud_engine
from app.models.sync import SyncQueue
from app.models.patient import Patient
from app.models.consultation import Consultation
from app.models.prescription import Prescription
from app.models.vaccination import Vaccination

# Setup logger for the synchronisation processes
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Thread-safe lock to prevent concurrent synchronization checks from overlapping
_sync_lock = threading.Lock()

# Map entity strings to their corresponding SQLAlchemy model classes
MODEL_MAP = {
    "patient": Patient,
    "consultation": Consultation,
    "prescription": Prescription,
    "vaccination": Vaccination
}

# Dependency hierarchy mapping to determine processing order (Parents before Children)
PRIORITY_ORDER = case(
    (SyncQueue.entity_type == "patient", 1),
    (SyncQueue.entity_type == "consultation", 2),
    (SyncQueue.entity_type == "prescription", 3),
    (SyncQueue.entity_type == "vaccination", 4),
    else_=5
)

class SyncEngine:
    def check_cloud_connectivity(self) -> bool:
        """
        Verifies if the central PostgreSQL database is accessible.
        Executes a simple 'SELECT 1' statement. Returns False on failure.
        """
        if not cloud_engine:
            logger.warning("Cloud PostgreSQL database engine is not configured.")
            return False
        try:
            with cloud_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return True
        except (OperationalError, Exception) as e:
            logger.warning(f"Cloud PostgreSQL is currently unreachable: {e}")
            return False

    def sync_local_to_cloud(self) -> dict:
        """
        Scans the local SQLite SyncQueue for pending operations. Pushes them
        to the central PostgreSQL database and resolves conflicts using Last Write Wins.
        Uses a lock to prevent concurrent overlaps.
        """
        stats = {
            "processed": 0,
            "success": 0,
            "failed": 0,
            "ignored_conflict": 0,
            "converged": 0,
            "pruned": 0
        }

        # Acquire lock or exit if already running
        if not _sync_lock.acquire(blocking=False):
            logger.warning("Synchronization sweep is already running. Skipping execution.")
            return {"status": "skipped", "message": "Another sync is currently in progress."}

        try:
            # Exit early if the central cloud server is offline
            if not self.check_cloud_connectivity():
                logger.info("Sync engine paused: Cloud PostgreSQL server is offline.")
                return stats

            local_db = LocalSessionLocal()
            cloud_db = CloudSessionLocal()

            try:
                # Query pending sync records ordered by:
                # 1. Dependency priority (Patients first, then Consultations, then Prescriptions/Vaccinations)
                # 2. Chronological timestamp (to keep edit timelines correct)
                pending_items = (
                    local_db.query(SyncQueue)
                    .filter(SyncQueue.sync_status == "PENDING")
                    .order_by(PRIORITY_ORDER, SyncQueue.timestamp.asc())
                    .all()
                )

                if not pending_items:
                    logger.info("Sync queue is empty. System is fully synchronised.")
                    # Run cleanup pruning even if there are no pending items
                    stats["pruned"] = self.prune_synced_records(local_db)
                    return stats

                logger.info(f"Beginning priority-ordered sync for {len(pending_items)} queue records...")

                for item in pending_items:
                    stats["processed"] += 1
                    try:
                        # Sync the individual entity
                        success = self._sync_item(local_db, cloud_db, item, stats)
                        
                        if success:
                            item.sync_status = "SYNCED"
                            item.error_message = None
                            stats["success"] += 1
                        else:
                            item.sync_status = "FAILED"
                            stats["failed"] += 1
                    except Exception as e:
                        local_db.rollback()
                        cloud_db.rollback()
                        logger.error(f"Failed to sync queue record {item.id} (Entity: {item.entity_type}, ID: {item.entity_id}): {e}")
                        item.sync_status = "FAILED"
                        item.error_message = str(e)
                        stats["failed"] += 1
                    
                    # Commit status update locally for this specific queue item to preserve progress
                    local_db.commit()

                # Clean up local SyncQueue logs that were synced successfully more than 24 hours ago
                stats["pruned"] = self.prune_synced_records(local_db)

            finally:
                local_db.close()
                cloud_db.close()

        finally:
            _sync_lock.release()

        logger.info(f"Sync complete. Stats: {stats}")
        return stats

    def prune_synced_records(self, local_db: Session) -> int:
        """
        Delete SYNCED logs older than 24 hours to prevent SQLite database bloat.
        """
        try:
            # Generate a timezone-naive UTC datetime cutoff for SQLite compatibility
            cutoff = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=24)
            deleted = (
                local_db.query(SyncQueue)
                .filter(SyncQueue.sync_status == "SYNCED")
                .filter(SyncQueue.updated_at < cutoff)
                .delete()
            )
            local_db.commit()
            if deleted > 0:
                logger.info(f"Pruned {deleted} synced records older than 24 hours from SyncQueue.")
            return deleted
        except Exception as e:
            local_db.rollback()
            logger.error(f"Failed to prune synced queue logs: {e}")
            return 0

    def _sync_item(self, local_db: Session, cloud_db: Session, item: SyncQueue, stats: dict) -> bool:
        entity_model = MODEL_MAP.get(item.entity_type)
        if not entity_model:
            raise ValueError(f"Unsupported sync entity type: {item.entity_type}")

        # Case 1: DELETE operation
        if item.operation_type == "DELETE":
            cloud_obj = cloud_db.get(entity_model, item.entity_id)
            if cloud_obj:
                cloud_db.delete(cloud_obj)
                cloud_db.commit()
                logger.info(f"DELETE SYNCED: Removed {item.entity_type} {item.entity_id} in cloud.")
            return True

        # Case 2: CREATE or UPDATE operation
        local_obj = local_db.get(entity_model, item.entity_id)
        if not local_obj:
            # If the record doesn't exist locally, it was deleted before we could run sync.
            # Return True to skip and resolve it.
            logger.warning(f"Local entity {item.entity_type} ({item.entity_id}) not found. Skipping sync.")
            return True

        cloud_obj = cloud_db.get(entity_model, item.entity_id)

        # 2a. Insert if not present in the cloud database
        if not cloud_obj:
            data = {c.name: getattr(local_obj, c.name) for c in local_obj.__table__.columns}
            new_cloud_obj = entity_model(**data)
            cloud_db.add(new_cloud_obj)
            cloud_db.commit()
            logger.info(f"CREATE SYNCED: Transferred {item.entity_type} {item.entity_id} to cloud.")
            return True

        # 2b. Conflict Resolution using Last Write Wins (LWW)
        local_updated = local_obj.updated_at
        cloud_updated = cloud_obj.updated_at

        # Force timezone comparison to be timezone-aware UTC
        if local_updated.tzinfo is None:
            local_updated = local_updated.replace(tzinfo=timezone.utc)
        if cloud_updated.tzinfo is None:
            cloud_updated = cloud_updated.replace(tzinfo=timezone.utc)

        if local_updated > cloud_updated:
            # Local update is newer. Overwrite the cloud record.
            for c in local_obj.__table__.columns:
                if c.name not in ["id", "created_at"]:
                    setattr(cloud_obj, c.name, getattr(local_obj, c.name))
            cloud_db.add(cloud_obj)
            cloud_db.commit()
            logger.info(f"UPDATE SYNCED: Local overwrote cloud for {item.entity_type} {item.entity_id} (Local update is newer).")
            return True

        elif local_updated < cloud_updated:
            # Cloud record is newer. Converge local SQLite by pulling cloud's values down.
            for c in cloud_obj.__table__.columns:
                if c.name not in ["id", "created_at"]:
                    setattr(local_obj, c.name, getattr(cloud_obj, c.name))
            # Keep updated_at synchronized
            local_obj.updated_at = cloud_obj.updated_at
            local_db.add(local_obj)
            local_db.commit()
            stats["converged"] += 1
            logger.info(f"CONVERGENCE: Local {item.entity_type} {item.entity_id} was updated from newer cloud values.")
            return True

        else:
            # Timestamps match exactly. Already in sync.
            logger.info(f"NO-OP: {item.entity_type} {item.entity_id} is already in sync.")
            stats["ignored_conflict"] += 1
            return True

sync_engine = SyncEngine()
