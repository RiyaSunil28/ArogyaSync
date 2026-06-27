from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import settings


def _normalize_cloud_database_url(url: str) -> str:
    """
    Prefer the psycopg driver when psycopg2 is unavailable.
    This keeps the app functional without changing the database URL format expected by users.
    """
    if url.startswith("postgresql://") and not url.startswith("postgresql+"):
        try:
            import psycopg2  # noqa: F401
        except ImportError:
            try:
                import psycopg  # noqa: F401
                return url.replace("postgresql://", "postgresql+psycopg://", 1)
            except ImportError:
                return url
    return url


# 1. Local SQLite Database Configuration
# connect_args={"check_same_thread": False} is required for SQLite to support multi-threaded FastAPI contexts
local_engine = create_engine(
    settings.LOCAL_DATABASE_URL,
    connect_args={"check_same_thread": False} if settings.LOCAL_DATABASE_URL.startswith("sqlite") else {}
)
LocalSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

# 2. Central Cloud PostgreSQL Database Configuration
# This engine might be None or raise exceptions if PostgreSQL is unreachable or the driver is missing.
cloud_engine = None
CloudSessionLocal = None

if settings.CLOUD_DATABASE_URL:
    cloud_database_url = _normalize_cloud_database_url(settings.CLOUD_DATABASE_URL)
    try:
        cloud_engine = create_engine(
            cloud_database_url,
            pool_pre_ping=True,  # Test connection health before using
            pool_size=10,
            max_overflow=20
        )
        CloudSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=cloud_engine)
    except ImportError:
        import sys
        print(
            "WARNING: PostgreSQL driver is not installed. Cloud sync will be offline/disabled.",
            file=sys.stderr
        )
    except Exception as e:
        import sys
        print(
            f"WARNING: Failed to configure cloud database engine: {e}",
            file=sys.stderr
        )
