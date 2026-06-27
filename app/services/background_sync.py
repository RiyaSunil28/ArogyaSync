import logging
import threading
import time

from app.db.session import LocalSessionLocal
from app.models.sync import SyncQueue
from app.services.sync_engine import sync_engine

logger = logging.getLogger(__name__)

_background_thread = None
_background_thread_lock = threading.Lock()


def start_background_sync() -> bool:
    """
    Start the background sync thread once if it is not already running.
    """
    global _background_thread

    with _background_thread_lock:
        if _background_thread is not None and _background_thread.is_alive():
            return False

        logger.info("Background sync started.")

        def run():
            while True:
                try:
                    if sync_engine.check_cloud_connectivity():
                        local_db = LocalSessionLocal()
                        try:
                            failed_records = (
                                local_db.query(SyncQueue)
                                .filter(SyncQueue.sync_status == "FAILED")
                                .all()
                            )

                            if failed_records:
                                for record in failed_records:
                                    record.sync_status = "PENDING"
                                    record.error_message = None
                                local_db.commit()
                                logger.info(
                                    f"Background sync reset {len(failed_records)} failed records."
                                )

                            logger.info("Background sync cycle executed.")
                            sync_engine.sync_local_to_cloud()
                        finally:
                            local_db.close()
                    else:
                        logger.info("Background sync: connectivity unavailable.")
                except Exception as e:
                    logger.error(f"Background sync cycle encountered an error: {e}")
                time.sleep(30)

        _background_thread = threading.Thread(
            target=run,
            daemon=True,
            name="background-sync-thread"
        )
        _background_thread.start()
        return True
