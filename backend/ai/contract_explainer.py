"""
Contract Explainer module for GigShield.
Analyzes and translates complex legal agreements into plain English,
flagging potential risks, notice periods, payment terms, and penalties.
"""

import json
from .gemini_client import generate_json
from .prompts import CONTRACT_SYSTEM, CONTRACT_PROMPT_TEMPLATE

def explain_contract(contract_text: str) -> str:
    """
    Analyzes and translates a gig worker contract to simplify terms and highlight risks.
    
    Args:
        contract_text (str): The raw text of the contract.
        
    Returns:
        str: A JSON string containing the status and the analyzed contract fields or error details.
    """
    # 1. Validation
    if not isinstance(contract_text, str) or not contract_text.strip():
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: contract_text must be a non-empty string."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        # Build prompt
        prompt = CONTRACT_PROMPT_TEMPLATE.format(contract_text=contract_text.strip())
        
        # Request JSON generation
        analysis_data = generate_json(
            prompt=prompt,
            system_instruction=CONTRACT_SYSTEM
        )
        
        # Build standard output format
        response_dict = {
            "status": "success",
            "summary": analysis_data.get("summary", ""),
            "legal_terms_explained": analysis_data.get("legal_terms_explained", []),
            "risky_clauses": analysis_data.get("risky_clauses", []),
            "payment_terms": analysis_data.get("payment_terms", ""),
            "penalties": analysis_data.get("penalties", []),
            "notice_periods": analysis_data.get("notice_periods", ""),
            "plain_english_translation": analysis_data.get("plain_english_translation", "")
        }
        
        return json.dumps(response_dict, indent=2)
        
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running contract_explainer.py test...")
    sample_contract = (
        "Independent Contractor Agreement.\n"
        "1. Compensation: The Contractor shall be paid $15 per completed delivery task. "
        "The Company reserves the right to withhold payment if the delivery receives any user complaint.\n"
        "2. Termination: Either party may terminate this agreement at any time, but if the Contractor terminates "
        "without a 30-day written notice, a penalty fee of $500 will be charged. "
        "The contractor indemnifies the Company for any liability, negligence or client loss."
    )
    print("Sample Contract:")
    print("-" * 40)
    print(sample_contract)
    print("-" * 40)
    
    # Execute
    res = explain_contract(sample_contract)
    print(f"Result:\n{res}")
    
    # Test validation error
    print("\nTesting validation with invalid input (none)...")
    res_val = explain_contract("")
    print(f"Result:\n{res_val}")
