"""Entry point for the AI Chatbot Service.

Usage:
    uvicorn main:app --reload --reload-dir app
"""

from app import app  # noqa: F401