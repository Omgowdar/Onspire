"""
Chatbot module for GigShield.
Provides conversational support for gig workers regarding rights, issues, and guidance.
"""

import json
from .gemini_client import generate_text
from .prompts import CHATBOT_SYSTEM

def chat(user_message: str) -> str:
    """
    Engage with the GigShield AI Chatbot.
    
    Args:
        user_message (str): The query or message from the gig worker.
        
    Returns:
        str: A JSON string containing the status and the response or error details.
             Keys: 'status' ('success' or 'error'), and 'response' or 'message'.
    """
    # 1. Validation
    if not isinstance(user_message, str) or not user_message.strip():
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: user_message must be a non-empty string."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        response_text = generate_text(
            prompt=user_message.strip(),
            system_instruction=CHATBOT_SYSTEM
        )
        return json.dumps({
            "status": "success",
            "response": response_text.strip()
        }, indent=2)
    except Exception as e:
        return json.dumps({
            "status": "error",
            "message": f"Gemini API execution error: {str(e)}"
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running chatbot.py test...")
    sample_query = "What should I do if a platform refuses to pay me for a completed delivery?"
    print(f"Query: {sample_query}")
    
    # Execute
    res = chat(sample_query)
    print(f"Result:\n{res}")
    
    # Test validation error
    print("\nTesting validation with invalid input (empty string)...")
    res_val = chat("   ")
    print(f"Result:\n{res_val}")
