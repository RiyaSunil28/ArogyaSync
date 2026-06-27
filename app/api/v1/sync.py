from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.api import deps
from app.models.auth import User
from app.schemas.sync import SyncQueue
from app.services.sync_engine import sync_engine
from app.models.sync import SyncQueue as SyncQueueModel

router = APIRouter()

@router.post("/trigger", status_code=status.HTTP_200_OK)
def trigger_sync(
    current_user: User = Depends(deps.get_current_user)
):
    """
    Manually trigger the sync engine to process pending sync queue items.
    """
    stats = sync_engine.sync_local_to_cloud()
    return stats

@router.get("/status", status_code=status.HTTP_200_OK)
def check_sync_status(
    current_user: User = Depends(deps.get_current_user)
):
    """
    Check connectivity status between the local client and central cloud PostgreSQL database.
    """
    is_connected = sync_engine.check_cloud_connectivity()
    return {"cloud_connected": is_connected}

@router.post("/retry-failed", status_code=status.HTTP_200_OK)
def retry_failed_sync(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """
    Reset all failed sync queue entries so they can be retried.
    """
    failed_records = (
        db.query(SyncQueueModel)
        .filter(SyncQueueModel.sync_status == "FAILED")
        .all()
    )

    if not failed_records:
        return {"message": "No failed records to retry."}

    for record in failed_records:
        record.sync_status = "PENDING"
        record.error_message = None

    db.commit()
    stats = sync_engine.sync_local_to_cloud()

    return {
        "reset_records": len(failed_records),
        "sync_stats": stats,
    }

@router.get("/queue", response_model=List[SyncQueue])
def get_sync_queue(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user)
):
    """
    View the local synchronization queue entries (including pending, synced, and failed operations).
    """
    items = (
        db.query(SyncQueueModel)
        .order_by(SyncQueueModel.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return items
