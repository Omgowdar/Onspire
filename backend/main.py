import json
import random
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Job
from schemas import (
    DashboardSummaryResponse,
    JobCreate,
    JobResponse,
    WeeklyInsightResponse,
    UnderpaymentTimeBreakdown,
    AIChatRequest,
    AIContractExplainRequest,
    AIComplaintGenerateRequest,
    AIWeeklySummaryRequest,
    AIScamDetectRequest,
    AIBurnoutAnalysisRequest,
    AIFinancialAdviceRequest,
    SendOTPRequest,
    VerifyOTPRequest,
)
from fairness import check_fairness
from ai import (
    chat,
    explain_contract,
    generate_complaint,
    generate_weekly_summary,
    detect_scam,
    burnout_analysis,
    financial_advice,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="GigShield API",
    description="Backend API for GigShield - An AI companion app for gig workers",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration to allow local React dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_naive_utc(dt: datetime) -> datetime:
    """Helper to convert timezone-aware datetime to naive UTC datetime for DB consistency."""
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check() -> dict:
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "gigshield-backend"}

@app.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job: JobCreate, db: Session = Depends(get_db)) -> Job:
    """Create a new job entry. Runs the fairness-check logic and auto-populates outcomes."""
    fairness_info = check_fairness(job.fare, job.distance_km, job.duration_minutes)
    
    db_job = Job(
        platform=job.platform,
        fare=job.fare,
        distance_km=job.distance_km,
        duration_minutes=job.duration_minutes,
        timestamp=to_naive_utc(job.timestamp),
        flagged=fairness_info["flagged"],
        expected_fare=fairness_info["expected_fare"],
        underpayment_pct=fairness_info["underpayment_pct"],
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.post("/jobs/bulk", response_model=List[JobResponse], status_code=status.HTTP_201_CREATED)
def create_jobs_bulk(jobs: List[JobCreate], db: Session = Depends(get_db)) -> List[Job]:
    """Create multiple job entries. Useful for OCR pipeline imports."""
    db_jobs = []
    for job in jobs:
        fairness_info = check_fairness(job.fare, job.distance_km, job.duration_minutes)
        db_job = Job(
            platform=job.platform,
            fare=job.fare,
            distance_km=job.distance_km,
            duration_minutes=job.duration_minutes,
            timestamp=to_naive_utc(job.timestamp),
            flagged=fairness_info["flagged"],
            expected_fare=fairness_info["expected_fare"],
            underpayment_pct=fairness_info["underpayment_pct"],
        )
        db.add(db_job)
        db_jobs.append(db_job)
    
    db.commit()
    for db_job in db_jobs:
        db.refresh(db_job)
    return db_jobs

@app.get("/jobs", response_model=List[JobResponse])
def get_jobs(
    platform: Optional[str] = Query(None, description="Filter by platform"),
    start_date: Optional[datetime] = Query(None, description="Filter by start timestamp"),
    end_date: Optional[datetime] = Query(None, description="Filter by end timestamp"),
    flagged_only: Optional[bool] = Query(None, description="Filter only flagged/underpaid jobs"),
    db: Session = Depends(get_db),
) -> List[Job]:
    """Retrieve list of jobs with optional filters."""
    query = db.query(Job)
    
    if platform:
        query = query.filter(Job.platform.ilike(f"%{platform}%"))
    if start_date:
        query = query.filter(Job.timestamp >= to_naive_utc(start_date))
    if end_date:
        query = query.filter(Job.timestamp <= to_naive_utc(end_date))
    if flagged_only is not None:
        query = query.filter(Job.flagged == flagged_only)
        
    return query.order_by(Job.timestamp.desc()).all()

@app.get("/jobs/{id}", response_model=JobResponse)
def get_job(id: int, db: Session = Depends(get_db)) -> Job:
    """Get details of a single job."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with id {id} not found")
    return job

@app.delete("/jobs/{id}", status_code=status.HTTP_200_OK)
def delete_job(id: int, db: Session = Depends(get_db)) -> dict:
    """Delete a job."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with id {id} not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted successfully", "id": id}

@app.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)) -> dict:
    """Return aggregated stats for the dashboard."""
    jobs = db.query(Job).all()
    
    total_earnings = round(sum(job.fare for job in jobs), 2)
    total_hours = round(sum(job.duration_minutes for job in jobs) / 60.0, 2)
    
    flagged_jobs = [job for job in jobs if job.flagged]
    flagged_count = len(flagged_jobs)
    
    # Loss = expected_fare - fare
    flagged_total_loss = round(sum(job.expected_fare - job.fare for job in flagged_jobs), 2)
    
    # Aggregation by platform
    earnings_by_platform = {}
    for job in jobs:
        earnings_by_platform[job.platform] = round(
            earnings_by_platform.get(job.platform, 0.0) + job.fare, 2
        )
        
    # Aggregation by day (local date represented as string YYYY-MM-DD)
    # Using timestamp directly (since it is stored as naive utc, we format it)
    earnings_by_day = {}
    for job in jobs:
        day_str = job.timestamp.strftime("%Y-%m-%d")
        earnings_by_day[day_str] = round(
            earnings_by_day.get(day_str, 0.0) + job.fare, 2
        )
        
    return {
        "total_earnings": total_earnings,
        "total_hours": total_hours,
        "flagged_count": flagged_count,
        "flagged_total_loss": flagged_total_loss,
        "earnings_by_platform": earnings_by_platform,
        "earnings_by_day": earnings_by_day,
    }

@app.get("/dashboard/weekly-insight-data", response_model=WeeklyInsightResponse)
def get_weekly_insight_data(db: Session = Depends(get_db)) -> dict:
    """
    Return a structured JSON summary of the last 7 days vs prior week.
    Useful for Gemini prompt to build weekly summaries.
    """
    # Use UTC now as the baseline for our 7-day query
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)
    current_week_start = now_utc - timedelta(days=7)
    prior_week_start = now_utc - timedelta(days=14)
    
    current_week_jobs = db.query(Job).filter(
        Job.timestamp >= current_week_start,
        Job.timestamp <= now_utc
    ).all()
    
    prior_week_jobs = db.query(Job).filter(
        Job.timestamp >= prior_week_start,
        Job.timestamp < current_week_start
    ).all()
    
    total_earned_current = sum(job.fare for job in current_week_jobs)
    total_earned_prior = sum(job.fare for job in prior_week_jobs)
    
    # Calculate % change vs prior week
    if total_earned_prior > 0:
        pct_change = ((total_earned_current - total_earned_prior) / total_earned_prior) * 100
    else:
        # Default or fallback when prior week has no earnings
        pct_change = 0.0
        
    # Underpayment breakdown by Day (06:00 to 18:00) vs Night (18:00 to 06:00)
    day_underpaid_count = 0
    day_total_underpayment = 0.0
    night_underpaid_count = 0
    night_total_underpayment = 0.0
    
    for job in current_week_jobs:
        if job.flagged:
            hour = job.timestamp.hour
            loss = job.expected_fare - job.fare
            if 6 <= hour < 18:
                day_underpaid_count += 1
                day_total_underpayment += loss
            else:
                night_underpaid_count += 1
                night_total_underpayment += loss
                
    return {
        "total_earned_current_week": round(total_earned_current, 2),
        "pct_change_vs_prior_week": round(pct_change, 2),
        "underpayment_breakdown": {
            "day_underpaid_count": day_underpaid_count,
            "day_total_underpayment": round(day_total_underpayment, 2),
            "night_underpaid_count": night_underpaid_count,
            "night_total_underpayment": round(night_total_underpayment, 2),
        }
    }


# In-memory OTP store (phone -> otp)
otp_store = {}

@app.post("/auth/send-otp", status_code=status.HTTP_200_OK)
def send_otp(payload: SendOTPRequest) -> dict:
    """Generate and send 6-digit OTP code to the requested phone number."""
    otp = f"{random.randint(100000, 999999)}"
    otp_store[payload.phone] = otp
    
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
    
    twilio_configured = bool(account_sid and auth_token and twilio_number)
    sent_real = False
    
    if twilio_configured:
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            client.messages.create(
                body=f"GigShield: Your verification code is {otp}.",
                from_=twilio_number,
                to=payload.phone
            )
            sent_real = True
        except Exception as e:
            print(f"Twilio Send Exception: {str(e)}")
            
    if not sent_real:
        print(f"\n📢 [MOCK SMS] Sent OTP {otp} to {payload.phone}\n")
        
    return {
        "status": "success",
        "message": "OTP sent successfully via Twilio" if sent_real else "OTP logged to server (mock fallback)",
        "mock_otp": otp if not sent_real else None
    }

@app.post("/auth/verify-otp", status_code=status.HTTP_200_OK)
def verify_otp(payload: VerifyOTPRequest) -> dict:
    """Verify that the provided OTP matches the one sent to the phone number."""
    stored_otp = otp_store.get(payload.phone)
    if not stored_otp or stored_otp != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please request a new one."
        )
    return {
        "status": "success",
        "message": "OTP verified successfully"
    }


# AI Module Endpoints
@app.post("/ai/chat")
def ai_chat(payload: AIChatRequest):
    result_str = chat(payload.message)
    return json.loads(result_str)

@app.post("/ai/explain-contract")
def ai_explain_contract(payload: AIContractExplainRequest):
    result_str = explain_contract(payload.contract_text)
    return json.loads(result_str)

@app.post("/ai/generate-complaint")
def ai_generate_complaint(payload: AIComplaintGenerateRequest):
    result_str = generate_complaint(payload.issue_details)
    return json.loads(result_str)

@app.post("/ai/weekly-summary")
def ai_weekly_summary(payload: AIWeeklySummaryRequest):
    logs_list = [log.model_dump() for log in payload.worker_data]
    result_str = generate_weekly_summary(logs_list)
    return json.loads(result_str)

@app.post("/ai/detect-scam")
def ai_detect_scam(payload: AIScamDetectRequest):
    result_str = detect_scam(payload.job_post)
    return json.loads(result_str)

@app.post("/ai/burnout-analysis")
def ai_burnout_analysis(payload: AIBurnoutAnalysisRequest):
    result_str = burnout_analysis(
        hours_worked=payload.hours_worked,
        sleep_hours=payload.sleep_hours,
        stress_level=payload.stress_level
    )
    return json.loads(result_str)

@app.post("/ai/financial-advice")
def ai_financial_advice(payload: AIFinancialAdviceRequest):
    result_str = financial_advice(
        income=payload.income,
        savings_goal=payload.savings_goal
    )
    return json.loads(result_str)


from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Serve SPA Frontend if compiled dist exists
dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{catchall:path}")
    def serve_frontend(catchall: str):
        path_segments = catchall.split("/")
        if path_segments and path_segments[0] in ["health", "jobs", "dashboard", "auth", "ai", "docs", "openapi.json"]:
            raise HTTPException(status_code=404, detail="API route not found")
        
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend build missing. Run 'npm run build' first.")


