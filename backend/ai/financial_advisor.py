"""
Financial Advisor module for GigShield.
Helps gig workers budget irregular incomes, set up savings plans,
and cultivate healthy financial habits.
"""

import json
from .gemini_client import generate_json
from .prompts import FINANCIAL_SYSTEM, FINANCIAL_PROMPT_TEMPLATE

def financial_advice(income, savings_goal) -> str:
    """
    Generates a financial advice plan based on income and savings goals.
    
    Args:
        income (float or int): Monthly income (must be positive).
        savings_goal (float or int): Monthly savings goal (must be non-negative and <= income).
        
    Returns:
        str: A JSON string containing status, savings plan achievability, budget tips, and habits.
    """
    # 1. Validation
    # Validate income
    try:
        if isinstance(income, bool):
            raise TypeError
        income_val = float(income)
    except (ValueError, TypeError):
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: income must be a number."
        }, indent=2)
        
    if income_val <= 0:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: income ({income}) must be greater than 0."
        }, indent=2)
        
    # Validate savings_goal
    try:
        if isinstance(savings_goal, bool):
            raise TypeError
        savings_goal_val = float(savings_goal)
    except (ValueError, TypeError):
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: savings_goal must be a number."
        }, indent=2)
        
    if savings_goal_val < 0:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: savings_goal ({savings_goal}) cannot be negative."
        }, indent=2)
        
    if savings_goal_val > income_val:
        return json.dumps({
            "status": "error",
            "message": f"Input validation failed: savings_goal ({savings_goal}) cannot exceed monthly income ({income})."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        # Build prompt
        prompt = FINANCIAL_PROMPT_TEMPLATE.format(
            income=income_val,
            savings_goal=savings_goal_val
        )
        
        analysis_data = generate_json(
            prompt=prompt,
            system_instruction=FINANCIAL_SYSTEM
        )
        
        # Structure the outcome
        response_dict = {
            "status": "success",
            "savings_plan": {
                "achievability": analysis_data.get("savings_plan", {}).get("achievability", "Realistic"),
                "target_savings_percentage": analysis_data.get("savings_plan", {}).get("target_savings_percentage", (savings_goal_val / income_val) * 100),
                "recommended_monthly_savings": analysis_data.get("savings_plan", {}).get("recommended_monthly_savings", savings_goal_val),
                "time_to_goal": analysis_data.get("savings_plan", {}).get("time_to_goal", "")
            },
            "budgeting_tips": analysis_data.get("budgeting_tips", []),
            "financial_habits": analysis_data.get("financial_habits", [])
        }
        
        return json.dumps(response_dict, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running financial_advisor.py test with reasonable goal...")
    res_easy = financial_advice(income=3000, savings_goal=450)
    print(f"Result:\n{res_easy}")
    
    print("\nRunning financial_advisor.py test with aggressive goal...")
    res_hard = financial_advice(income=2500, savings_goal=1800)
    print(f"Result:\n{res_hard}")
    
    # Test validation error
    print("\nTesting validation with negative income...")
    res_val = financial_advice(income=-1000, savings_goal=100)
    print(f"Result:\n{res_val}")
