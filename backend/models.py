from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    platform = Column(String, nullable=False, index=True)
    fare = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False, index=True)
    flagged = Column(Boolean, default=False, nullable=False)
    expected_fare = Column(Float, nullable=True)
    underpayment_pct = Column(Float, nullable=True)
