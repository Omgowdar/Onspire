from datetime import datetime
from typing import Optional, Dict, List, Union
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

# AI Endpoint Request Schemas
class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Message to the chatbot")

class AIContractExplainRequest(BaseModel):
    contract_text: str = Field(..., min_length=1, description="Raw contract text to explain")

class AIComplaintGenerateRequest(BaseModel):
    issue_details: Union[str, Dict[str, str]] = Field(..., description="Details of the issue (string or key-value dictionary)")

class AIWeeklySummaryLog(BaseModel):
    day: str = Field(..., description="Day of the week, e.g. Monday")
    hours: float = Field(..., ge=0, description="Hours worked")
    earnings: float = Field(..., ge=0, description="Earnings in currency units")

class AIWeeklySummaryRequest(BaseModel):
    worker_data: List[AIWeeklySummaryLog] = Field(..., description="Logs of daily activities")

class AIScamDetectRequest(BaseModel):
    job_post: str = Field(..., min_length=1, description="Job advertisement text")

class AIBurnoutAnalysisRequest(BaseModel):
    hours_worked: float = Field(..., ge=0, le=168, description="Weekly hours worked")
    sleep_hours: float = Field(..., ge=0, le=24, description="Average daily sleep hours")
    stress_level: int = Field(..., ge=1, le=10, description="Self-reported stress level (1 to 10)")

class AIFinancialAdviceRequest(BaseModel):
    income: float = Field(..., gt=0.0, description="Monthly income")
    savings_goal: float = Field(..., ge=0.0, description="Monthly savings goal")

