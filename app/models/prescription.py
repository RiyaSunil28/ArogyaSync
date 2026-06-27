from sqlalchemy import Column, String, ForeignKey, Uuid
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    consultation_id = Column(
        Uuid, 
        ForeignKey("consultations.id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    medicine_name = Column(String(100), index=True, nullable=False)
    dosage = Column(String(50), nullable=False)
    duration = Column(String(50), nullable=False)

    # Relationships
    consultation = relationship("Consultation", back_populates="prescriptions")
