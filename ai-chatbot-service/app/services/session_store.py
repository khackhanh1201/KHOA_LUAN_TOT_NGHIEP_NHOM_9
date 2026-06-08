"""In-memory conversation session store with automatic expiration.

Stores chat history per session_id and cleans up expired sessions lazily.
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import TypedDict

from app.config import MAX_HISTORY_TURNS, SESSION_TTL_MINUTES

logger = logging.getLogger(__name__)


class ChatTurn(TypedDict):
    """A single question-answer turn in the conversation."""

    question: str
    answer: str


class _SessionData(TypedDict):
    """Internal session storage format."""

    history: list[ChatTurn]
    last_access: datetime


class SessionStore:
    """Thread-safe in-memory store for conversation sessions.

    Sessions expire after SESSION_TTL_MINUTES of inactivity.
    History is capped at MAX_HISTORY_TURNS most recent turns.
    """

    def __init__(self) -> None:
        self._sessions: dict[str, _SessionData] = {}

    def create_session(self) -> str:
        """Create a new session and return its ID."""
        session_id = uuid.uuid4().hex
        self._sessions[session_id] = {
            "history": [],
            "last_access": datetime.now(),
        }
        logger.info("Created session: %s", session_id)
        return session_id

    def get_or_create(self, session_id: str | None) -> str:
        """Return an existing session_id or create a new one.

        If session_id is provided but expired/invalid, a new session is created.
        """
        self._cleanup_expired()

        if session_id and session_id in self._sessions:
            self._sessions[session_id]["last_access"] = datetime.now()
            return session_id

        return self.create_session()

    def get_history(self, session_id: str) -> list[ChatTurn]:
        """Return the conversation history for a session."""
        session = self._sessions.get(session_id)
        if session is None:
            return []
        return list(session["history"])

    def add_turn(self, session_id: str, question: str, answer: str) -> None:
        """Append a Q&A turn to the session history.

        Automatically trims history to MAX_HISTORY_TURNS most recent turns.
        """
        session = self._sessions.get(session_id)
        if session is None:
            return

        session["history"].append({"question": question, "answer": answer})
        session["last_access"] = datetime.now()

        # Keep only the most recent turns
        if len(session["history"]) > MAX_HISTORY_TURNS:
            session["history"] = session["history"][-MAX_HISTORY_TURNS:]

    def _cleanup_expired(self) -> None:
        """Remove sessions that have been inactive beyond the TTL."""
        cutoff = datetime.now() - timedelta(minutes=SESSION_TTL_MINUTES)
        expired = [
            sid for sid, data in self._sessions.items()
            if data["last_access"] < cutoff
        ]
        for sid in expired:
            del self._sessions[sid]
            logger.debug("Expired session: %s", sid)


# Singleton instance
session_store = SessionStore()
