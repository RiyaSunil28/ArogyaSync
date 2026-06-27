from sqlalchemy import Column, Text, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Consultation(Base):
    __tablename__ = "consultations"

    patient_id = Column(
        Uuid, 
        ForeignKey("patients.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    doctor_notes = Column(Text, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="consultations")
    prescriptions = relationship(
        "Prescription", 
        back_populates="consultation", 
        cascade="all, delete-orphan"
    )
