from datetime import datetime
from typing import Optional, Dict, List
from pydantic import BaseModel, Field, ConfigDict

class JobBase(BaseModel):
    platform: str = Field(..., min_length=1, description="Platform name, e.g. Uber, Zomato")
    fare: float = Field(..., ge=0.0, description="Actual fare paid in currency units")
    distance_km: float = Field(..., ge=0.0, description="Distance in kilometers")
    duration_minutes: int = Field(..., ge=0, description="Duration of the trip in minutes")
    timestamp: datetime = Field(..., description="Timestamp of when the job occurred")

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: int
    flagged: bool
    expected_fare: Optional[float] = None
    underpayment_pct: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)

class DashboardSummaryResponse(BaseModel):
    total_earnings: float
    total_hours: float
    flagged_count: int
    flagged_total_loss: float
    earnings_by_platform: Dict[str, float]
    earnings_by_day: Dict[str, float]

class UnderpaymentTimeBreakdown(BaseModel):
    day_underpaid_count: int
    day_total_underpayment: float
    night_underpaid_count: int
    night_total_underpayment: float

class WeeklyInsightResponse(BaseModel):
    total_earned_current_week: float
    pct_change_vs_prior_week: float
    underpayment_breakdown: UnderpaymentTimeBreakdown
