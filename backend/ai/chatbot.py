"""
Chatbot module for GigShield.
Provides conversational support for gig workers regarding rights, issues, and guidance.
"""

import json
import google.generativeai as genai
from .gemini_client import get_model_name, _ensure_configured, get_friendly_error_message
from .prompts import CHATBOT_SYSTEM

# Bounded conversational history list to maintain chat context
_chat_history = []

def chat(user_message: str) -> str:
    """
    Engage with the GigShield AI Chatbot, maintaining conversation memory.
    
    Args:
        user_message (str): The query or message from the user.
        
    Returns:
        str: A JSON string containing the status and the response or error details.
    """
    global _chat_history
    
    # 1. Validation
    if not isinstance(user_message, str) or not user_message.strip():
        return json.dumps({
            "status": "error",
            "message": "Input validation failed: user_message must be a non-empty string."
        }, indent=2)
        
    # 2. Call API & Handle Errors
    try:
        _ensure_configured()
        model_name = get_model_name()
        
        # Build model with custom general-purpose/specialist prompt
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=CHATBOT_SYSTEM
        )
        
        # Start a chat session using current in-memory history
        session = model.start_chat(history=_chat_history)
        
        # Send query to Gemini
        response = session.send_message(user_message.strip())
        
        if not response.text:
            raise RuntimeError("Gemini API returned an empty response.")
            
        # Update rolling conversation history
        _chat_history = session.history
        
        # Bound history to last 20 messages (10 rounds) to optimize tokens and response speed
        if len(_chat_history) > 20:
            _chat_history = _chat_history[-20:]
            
        return json.dumps({
            "status": "success",
            "response": response.text.strip()
        }, indent=2)
        
    except Exception as e:
        friendly_msg = get_friendly_error_message(e)
        return json.dumps({
            "status": "error",
            "message": friendly_msg
        }, indent=2)

if __name__ == "__main__":
    # Example usage for testing
    print("Running chatbot.py test...")
    sample_query = "What should I do if a platform refuses to pay me for a completed delivery?"
    print(f"Query: {sample_query}")
    
    # Execute
    res = chat(sample_query)
    print(f"Result:\n{res}")
