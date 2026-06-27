from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Patient(Base):
    __tablename__ = "patients"

    name = Column(String(100), index=True, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)
    phone = Column(String(20), index=True, nullable=True)
    address = Column(String(255), nullable=True)

    # Relationships
    consultations = relationship(
        "Consultation", 
        back_populates="patient", 
        cascade="all, delete-orphan"
    )
    vaccinations = relationship(
        "Vaccination", 
        back_populates="patient", 
        cascade="all, delete-orphan"
    )
