# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.models.auth import User  # noqa
from app.models.patient import Patient  # noqa
from app.models.consultation import Consultation  # noqa
from app.models.prescription import Prescription  # noqa
from app.models.vaccination import Vaccination  # noqa
from app.models.sync import SyncQueue  # noqa
