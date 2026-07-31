"""
Gemini API client wrapper for GigShield.
Handles configuration, dotenv loading, API calls, and error handling.
"""

import os
import json
import google.generativeai as genai
from google.api_core.exceptions import GoogleAPICallError
from dotenv import load_dotenv

# Load environment variables from .env in multiple candidate locations
# 1. Default (Current Working Directory)
load_dotenv()

# 2. Parent directory of this file (Project Root)
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
parent_dotenv = os.path.join(parent_dir, ".env")
if os.path.exists(parent_dotenv):
    load_dotenv(dotenv_path=parent_dotenv)

# 3. Same directory as this file (ai/ folder)
local_dotenv = os.path.join(current_dir, ".env")
if os.path.exists(local_dotenv):
    load_dotenv(dotenv_path=local_dotenv)

_client_configured = False

def _ensure_configured():
    """
    Ensures that the Gemini API client is initialized.
    Checks for GEMINI_API_KEY first, then falls back to GOOGLE_API_KEY.
    Raises ValueError if neither key is found in the environment.
    """
    global _client_configured
    if _client_configured:
        return
    
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError(
            "Neither GEMINI_API_KEY nor GOOGLE_API_KEY environment variable is set. "
            "Please create a .env file with GEMINI_API_KEY=your_api_key_here."
        )
    
    genai.configure(api_key=api_key)
    _client_configured = True


def get_model_name() -> str:
    """
    Retrieves the model name from environment variables, defaulting to gemini-1.5-flash.
    """
    return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

def generate_text(prompt: str, system_instruction: str = None) -> str:
    """
    Generates plain text response using the Gemini API.
    
    Args:
        prompt: The main user prompt.
        system_instruction: Optional developer system instructions.
        
    Returns:
        The generated text response.
    """
    _ensure_configured()
    model_name = get_model_name()
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )
        response = model.generate_content(prompt)
        if not response.text:
            raise RuntimeError("Gemini API returned an empty response.")
        return response.text
    except GoogleAPICallError as e:
        raise RuntimeError(f"Gemini API Call failed: {e.message}") from e
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during Gemini API call: {str(e)}") from e

def repair_json(json_str: str) -> str:
    """
    Attempts to repair basic structural truncation in JSON strings by appending
    missing closing brackets or braces.
    """
    json_str = json_str.strip()
    if not json_str:
        return json_str
        
    stack = []
    in_string = False
    escape = False
    
    for char in json_str:
        if escape:
            escape = False
            continue
        if char == '\\':
            escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if not in_string:
            if char in ('{', '['):
                stack.append(char)
            elif char in ('}', ']'):
                if stack:
                    opp = '{' if char == '}' else '['
                    if stack[-1] == opp:
                        stack.pop()
                        
    # If ended inside a string, close the string first
    if in_string:
        json_str += '"'
        
    # Close any open structures in reverse order
    while stack:
        open_char = stack.pop()
        if open_char == '{':
            json_str += '\n}'
        elif open_char == '[':
            json_str += '\n]'
            
    return json_str


def generate_json(prompt: str, system_instruction: str = None) -> dict:
    """
    Generates structured JSON response using the Gemini API by requesting
    application/json response MIME type.
    
    Args:
        prompt: The main user prompt, which should ask for a JSON response.
        system_instruction: Optional developer system instructions.
        
    Returns:
        The parsed dictionary from the Gemini JSON response.
    """
    _ensure_configured()
    model_name = get_model_name()
    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        text_out = response.text.strip() if response.text else ""
        if not text_out:
            raise RuntimeError("Gemini API returned an empty response.")
            
        # Clean markdown code blocks if the model wrapped them anyway
        if text_out.startswith("```json"):
            text_out = text_out[7:]
        if text_out.endswith("```"):
            text_out = text_out[:-3]
        text_out = text_out.strip()
        
        try:
            return json.loads(text_out)
        except json.JSONDecodeError:
            # Clean up potential stray quotes or double-quotes before closing brace (added by teammates)
            cleaned = text_out.replace('"\n"\n}', '"\n}').replace('"\n\n}', '"\n}').strip()
            try:
                return json.loads(cleaned)
            except json.JSONDecodeError:
                # Attempt to auto-repair using our robust repair_json function if it still fails
                repaired = repair_json(cleaned)
                return json.loads(repaired)
    except GoogleAPICallError as e:
        raise RuntimeError(f"Gemini API Call failed: {e.message}") from e
    except json.JSONDecodeError as e:
        raise RuntimeError(f"Failed to parse Gemini response as JSON. Content: {text_out}") from e
    except Exception as e:
        raise RuntimeError(f"An unexpected error occurred during Gemini API call: {str(e)}") from e

if __name__ == "__main__":
    # Example usage for testing
    print("Testing Gemini Client configuration...")
    try:
        _ensure_configured()
        print(f"Client configured successfully. Using model: {get_model_name()}")
        # Test connection with a simple prompt
        test_text = generate_text("Say hello in one word.")
        print(f"API Connection Test Result: {test_text.strip()}")
    except Exception as err:
        print(f"Configuration or test call failed: {err}")
        print("Note: If GEMINI_API_KEY is not set, this is expected.")
