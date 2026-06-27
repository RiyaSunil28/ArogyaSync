from sqlalchemy import Column, String, Date, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Vaccination(Base):
    __tablename__ = "vaccinations"

    patient_id = Column(
        Uuid, 
        ForeignKey("patients.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    vaccine_name = Column(String(100), index=True, nullable=False)
    vaccination_date = Column(Date, nullable=False)
    status = Column(String(50), index=True, nullable=False)  # PENDING, COMPLETED, OVERDUE

    # Relationships
    patient = relationship("Patient", back_populates="vaccinations")
