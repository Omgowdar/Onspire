# GigShield AI Module

An independent, reusable Python package containing the AI-powered assistant features for **GigShield**—a tool designed to help, protect, and guide gig workers (delivery partners, drivers, freelancers, daily wage workers).

Designed for a hackathon submission, this package is easily integrable into any Python backend (Flask, Django, FastAPI, etc.).

---

## Folder Structure

```text
ai/
├── __init__.py                # Package entrypoint exposing public APIs
├── chatbot.py                 # Chatbot for gig worker support
├── prompts.py                 # Centralized prompt configurations
├── gemini_client.py           # Gemini API client initialization & safety wrappers
├── complaint_generator.py     # Professional complaint letter creator
├── contract_explainer.py      # Contract parsing & warning identification
├── weekly_summary.py          # Earnings/work hours breakdown & productivity suggestions
├── burnout_detector.py        # Workload & health metrics analysis
├── scam_detector.py           # Job post threat detector & warnings
├── financial_advisor.py       # Savings planner & budgeting advice
├── requirements.txt           # Package dependencies
└── README.md                  # This file
```

---

## Installation & Setup

1. **Install Dependencies**:
   Install the required libraries listed in `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

2. **API Configuration**:
   Create a `.env` file in the root directory where your backend application is run:
   ```env
   GEMINI_API_KEY=your_actual_google_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash  # Optional. Defaults to gemini-1.5-flash
   ```

---

## API Reference & Examples

All inputs are validated. If invalid inputs are passed or if the Gemini API fails, the functions return a structured JSON response with `status: "error"` and a detailed error message.

### 1. Chatbot Support
Provides conversational aid.
```python
from ai import chat

response = chat("What are my rights if a customer cancels a delivery after I arrive?")
print(response)
```

### 2. Contract Explainer
Extracts key terms, risky clauses, penalties, and payment rules.
```python
from ai import explain_contract

contract_text = "Independent Contractor Agreement. Termination requires 30-day notice or $500 penalty."
response = explain_contract(contract_text)
print(response)
```

### 3. Complaint Generator
Drafts a formal letter of complaint based on provided details.
```python
from ai import generate_complaint

issue = {
    "platform_name": "QuickDash",
    "issue": "Withheld $24.50 payment for a delivery despite photo proof of completion.",
    "requested_outcome": "Release payment immediately."
}
response = generate_complaint(issue)
print(response)
```

### 4. Weekly Summary Analysis
Summarizes daily log lists and adds tips.
```python
from ai import generate_weekly_summary

logs = [
    {"day": "Monday", "hours": 8, "earnings": 150},
    {"day": "Tuesday", "hours": 9, "earnings": 180}
]
response = generate_weekly_summary(logs)
print(response)
```

### 5. Scam Detector
Checks suspicious job descriptions.
```python
from ai import detect_scam

post = "Data entry role. Pay $45 upfront registration fee. High weekly payouts."
response = detect_scam(post)
print(response)
```

### 6. Burnout Analysis
Analyses weekly hours, sleep hours, and stress rating.
```python
from ai import burnout_analysis

response = burnout_analysis(hours_worked=60, sleep_hours=5.5, stress_level=8)
print(response)
```

### 7. Financial Advisor
Assesses savings plans and recommends budgeting patterns.
```python
from ai import financial_advice

response = financial_advice(income=3500, savings_goal=500)
print(response)
```
