"""AI Chatbot Service — FastAPI application factory."""

import logging
import os
from logging.handlers import RotatingFileHandler

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_TITLE, CORS_ORIGINS
from app.routers.chat import router as chat_router

# ---------------------------------------------------------------------------
# Logging Configuration — console + file (logs/chatbot.log)
# ---------------------------------------------------------------------------
_LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "logs")
os.makedirs(_LOG_DIR, exist_ok=True)

_LOG_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
)
_LOG_FILE = os.path.join(_LOG_DIR, "chatbot.log")

# Root logger
_root_logger = logging.getLogger()
_root_logger.setLevel(logging.INFO)

# Console handler
_console_handler = logging.StreamHandler()
_console_handler.setLevel(logging.INFO)
_console_handler.setFormatter(logging.Formatter(_LOG_FORMAT))
_root_logger.addHandler(_console_handler)

# File handler — rotates at 5 MB, keeps 3 backups
_file_handler = RotatingFileHandler(
    _LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
)
_file_handler.setLevel(logging.INFO)
_file_handler.setFormatter(logging.Formatter(_LOG_FORMAT))
_root_logger.addHandler(_file_handler)

logging.getLogger(__name__).info(
    "Logging initialized — file output: %s", _LOG_FILE
)

app = FastAPI(title=APP_TITLE)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Register routers
app.include_router(chat_router)
