# Fairness check configuration constants
FAIRNESS_CONFIG = {
    "BASE_FARE": 20.0,
    "PER_KM_RATE": 8.0,
    "PER_MIN_RATE": 1.0,
    "UNDERPAYMENT_THRESHOLD": 0.85  # Flag if actual fare is less than 85% of expected fare
}

def check_fairness(fare: float, distance_km: float, duration_minutes: float) -> dict:
    """
    Pure function to run the fairness check on a job.
    
    expected_fare = BASE_FARE + (PER_KM_RATE * distance_km) + (PER_MIN_RATE * duration_minutes)
    A job is flagged if fare < expected_fare * 0.85 (UNDERPAYMENT_THRESHOLD).
    underpayment_pct = ((expected_fare - fare) / expected_fare) * 100 (only when flagged).
    """
    base = FAIRNESS_CONFIG["BASE_FARE"]
    per_km = FAIRNESS_CONFIG["PER_KM_RATE"]
    per_min = FAIRNESS_CONFIG["PER_MIN_RATE"]
    threshold = FAIRNESS_CONFIG["UNDERPAYMENT_THRESHOLD"]
    
    expected_fare = base + (per_km * distance_km) + (per_min * duration_minutes)
    
    # Rounded to 2 decimal places for clean calculations
    expected_fare = round(expected_fare, 2)
    
    flagged = fare < (expected_fare * threshold)
    
    if flagged:
        underpayment_pct = ((expected_fare - fare) / expected_fare) * 100
        underpayment_pct = round(underpayment_pct, 2)
    else:
        underpayment_pct = None
        
    return {
        "expected_fare": expected_fare,
        "flagged": flagged,
        "underpayment_pct": underpayment_pct
    }
