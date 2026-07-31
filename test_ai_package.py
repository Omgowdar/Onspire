"""
Integration test suite for the GigShield AI Package.
Tests both local input validation (without requiring an API key)
and live Gemini API services (if GEMINI_API_KEY is defined).
"""

import os
from dotenv import load_dotenv

# Load env variables from .env
load_dotenv()

try:
    from ai import (
        chat,
        explain_contract,
        generate_complaint,
        generate_weekly_summary,
        detect_scam,
        burnout_analysis,
        financial_advice
    )
except ImportError as e:
    print(f"Error importing ai package. Make sure you run this script from the 'Onspire' root directory.")
    print(f"Error details: {e}")
    import sys
    sys.exit(1)

def run_validation_tests():
    """Runs tests that do not need an API key because they trigger validation errors."""
    print("\n" + "=" * 55)
    print("1. RUNNING LOCAL INPUT VALIDATION TESTS (No API Key Required)")
    print("=" * 55)
    
    # 1. Chatbot empty message
    print("\n[*] Testing Chatbot with empty input:")
    print(chat("   "))
    
    # 2. Explain contract empty message
    print("\n[*] Testing Contract Explainer with empty text:")
    print(explain_contract(""))
    
    # 3. Complaint generator invalid type
    print("\n[*] Testing Complaint Generator with invalid type (integer):")
    print(generate_complaint(99999))
    
    # 4. Weekly summary negative hours
    print("\n[*] Testing Weekly Summary with negative hours:")
    print(generate_weekly_summary([{"day": "Monday", "hours": -1, "earnings": 100}]))
    
    # 5. Scam detector empty message
    print("\n[*] Testing Scam Detector with empty string:")
    print(detect_scam(""))
    
    # 6. Burnout analysis invalid stress level
    print("\n[*] Testing Burnout Analysis with invalid stress level (12):")
    print(burnout_analysis(hours_worked=40, sleep_hours=7, stress_level=12))
    
    # 7. Financial advice savings goal exceeding income
    print("\n[*] Testing Financial Advice with savings goal exceeding income:")
    print(financial_advice(income=1000, savings_goal=1200))

def run_live_tests():
    """Runs live tests against Gemini API if key is present."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("\n" + "=" * 55)
        print("WARNING: GEMINI_API_KEY not found in environment.")
        print("Skipping live API tests. Please add it to your .env file to enable live tests.")
        print("=" * 55)
        return
        
    print("\n" + "=" * 55)
    print("2. RUNNING LIVE GEMINI API TESTS")
    print("=" * 55)
    
    # 1. Chatbot
    print("\n[*] Testing chat(user_message):")
    print(chat("Hi, can you explain what a gig worker is in 10 words?"))
    
    # 2. Explain contract
    print("\n[*] Testing explain_contract(contract_text):")
    print(explain_contract(
        "This is an Independent Rider Agreement. The Rider shall receive $12 per completed delivery. "
        "Either party may terminate this agreement at any time, but termination by the Rider without a 15-day notice "
        "will result in a forfeiture of any unpaid rider fees. Rider accepts all risk of delivery accidents."
    ))
    
    # 3. Complaint generator
    print("\n[*] Testing generate_complaint(issue_details):")
    print(generate_complaint({
        "platform_name": "QuickDelivery",
        "incident_date": "July 29, 2026",
        "issue": "App glitch logged me off during a active delivery, and support refuses to pay the $15 delivery fee.",
        "requested_outcome": "Credit the $15 delivery fee to my app balance."
    }))
    
    # 4. Weekly summary
    print("\n[*] Testing generate_weekly_summary(worker_data):")
    print(generate_weekly_summary([
        {"day": "Mon", "hours": 6.5, "earnings": 110.0},
        {"day": "Tue", "hours": 8.0, "earnings": 155.0},
        {"day": "Wed", "hours": 7.0, "earnings": 125.0}
    ]))
    
    # 5. Scam detector
    print("\n[*] Testing detect_scam(job_post):")
    print(detect_scam(
        "Make money from home processing payments. No training needed. Earn $800 weekly. "
        "Must buy a $40 card terminal up front before work assignments. Fast setup!"
    ))
    
    # 6. Burnout analysis
    print("\n[*] Testing burnout_analysis(hours_worked, sleep_hours, stress_level):")
    print(burnout_analysis(hours_worked=55, sleep_hours=5.0, stress_level=8))
    
    # 7. Financial advice
    print("\n[*] Testing financial_advice(income, savings_goal):")
    print(financial_advice(income=3000, savings_goal=400))

if __name__ == "__main__":
    print("Starting GigShield AI Module Package Integration Tests...")
    run_validation_tests()
    run_live_tests()
