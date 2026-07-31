"""
GigShield AI Service Package.
Provides tools and analytical services for gig workers including chatbots,
contract explainers, complaint generators, scam detectors, burnout detectors,
and financial advice.
"""

from .chatbot import chat
from .contract_explainer import explain_contract
from .complaint_generator import generate_complaint
from .weekly_summary import generate_weekly_summary
from .scam_detector import detect_scam
from .burnout_detector import burnout_analysis
from .financial_advisor import financial_advice

__all__ = [
    "chat",
    "explain_contract",
    "generate_complaint",
    "generate_weekly_summary",
    "detect_scam",
    "burnout_analysis",
    "financial_advice",
]
