# GigShield Backend

An AI companion companion app backend for gig workers (delivery/cab drivers) to track earnings, detect underpayment, and view a fairness dashboard. Built with FastAPI, SQLite (via SQLAlchemy ORM), and Pydantic.

## Project Structure

```
/backend
  main.py            # FastAPI app, routing, aggregation logic
  models.py          # SQLAlchemy model definitions
  schemas.py         # Pydantic input validation & serialization schemas
  fairness.py        # Fairness check pure function logic
  database.py        # SQLite Engine and SQLAlchemy Session setup
  seed.py            # Script to clear and seed local database
  requirements.txt   # Python dependencies
```

## Running the Backend

### Prerequisites
- Python 3.12+

### 1. Setup Virtual Environment
From the root workspace directory, create and activate a virtual environment:

```bash
# Create venv
python3 -m venv .venv

# Activate venv (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
```

### 2. Seed Database
Seed the database with realistic sample jobs representing fair/underpaid trips across platforms over the last 14 days:

```bash
cd backend
python seed.py
```
*This will create the SQLite database file `gigshield.db` in the `/backend` folder.*

### 3. Run Server
Start the Uvicorn FastAPI dev server:

```bash
uvicorn main:app --reload
```

- **Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

## API Contract Summary

### Endpoints
- `POST /jobs` — create a new job entry. Auto-populates expected fare, flagged status, and underpayment percentage using the fairness check logic.
- `POST /jobs/bulk` — bulk import multiple jobs (useful for OCR parsing output integration).
- `GET /jobs` — retrieve list of jobs. Supports query params: `platform`, `start_date`, `end_date`, `flagged_only`.
- `GET /jobs/{id}` — fetch a single job details.
- `DELETE /jobs/{id}` — remove a job from records.
- `GET /dashboard/summary` — aggregated stats including total earnings, total hours, loss from underpaid rides, platform-specific earnings, and earnings grouped by day.
- `GET /dashboard/weekly-insight-data` — structured weekly JSON summaries for Gemini insights.

### Fairness Logic Formula
```
expected_fare = BASE_FARE + (PER_KM_RATE * distance_km) + (PER_MIN_RATE * duration_minutes)
```
- A ride is flagged as underpaid if `fare < expected_fare * 0.85`
- Configurable defaults (stored in `backend/fairness.py`):
  - `BASE_FARE`: 20.0
  - `PER_KM_RATE`: 8.0
  - `PER_MIN_RATE`: 1.0
