from typing import List
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase
from app.models.sync import SyncQueue
from app.schemas.sync import SyncQueueCreate, SyncQueueUpdate

class CRUDSyncQueue(CRUDBase[SyncQueue, SyncQueueCreate, SyncQueueUpdate]):
    def get_pending(self, db: Session, *, limit: int = 100) -> List[SyncQueue]:
        """
        Fetch pending sync records ordered by their chronological insertion timestamp.
        """
        return (
            db.query(self.model)
            .filter(self.model.sync_status == "PENDING")
            .order_by(self.model.timestamp.asc())
            .limit(limit)
            .all()
        )

sync_queue_repo = CRUDSyncQueue(SyncQueue)
