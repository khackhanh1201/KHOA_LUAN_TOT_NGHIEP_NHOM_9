"""Centralized configuration for the AI Chatbot Service."""

import os
from pathlib import Path

from dotenv import load_dotenv

# Ưu tiên: .env gốc monorepo → .env trong ai-chatbot-service
_service_root = Path(__file__).resolve().parents[1]
_monorepo_root = _service_root.parent
load_dotenv(_monorepo_root / ".env", override=False)
load_dotenv(_service_root / ".env", override=True)

# --- App Settings ---
APP_TITLE = "AI Chatbot Microservice - Đất đai & Thuế"
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8080",
]

# --- Authentication ---
API_SECRET_KEY = os.getenv("API_SECRET_KEY", "")

# --- LLM Settings ---
LLM_MODEL = "models/gemini-2.5-flash"
EMBEDDING_MODEL = "models/gemini-embedding-2"
LLM_TEMPERATURE = 0.0

# --- Vector DB Settings ---
VECTOR_DB_DIR = "./chroma_db"
DATA_DIR = "./data"
INGESTION_MANIFEST_PATH = os.path.join(VECTOR_DB_DIR, "ingestion_manifest.json")

# --- Text Splitting ---
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
SIMILARITY_SEARCH_K = 4

# Custom separators optimized for Vietnamese legal text
VIETNAMESE_SEPARATORS = ["\n\n", "\n", "Điều ", "Khoản ", " ", ""]

# --- Session Settings ---
MAX_HISTORY_TURNS = 10
SESSION_TTL_MINUTES = 30
