"""API routes for document ingestion and chat."""

import logging

from fastapi import APIRouter, Depends, HTTPException

from app.dependencies import verify_api_key
from app.models import ChatRequest, ChatResponse, IngestResponse, StatusResponse
from app.services.rag_engine import chatbot
from app.services.session_store import session_store

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=StatusResponse)
def health_check() -> dict:
    """Health-check endpoint to verify server status (public)."""
    return {"status": "AI Server is running!"}


@router.post(
    "/api/ingest",
    response_model=IngestResponse,
    dependencies=[Depends(verify_api_key)],
)
async def ingest_documents() -> dict:
    """Ingest new/changed documents from the data folder into the vector database.

    Requires API Key authentication via X-API-Key header.

    Raises:
        HTTPException: If document ingestion fails.
    """
    try:
        files_processed = chatbot.ingest_all_data()

        if files_processed == 0:
            message = "Không có file mới hoặc thay đổi. Dữ liệu đã được cập nhật."
        else:
            message = f"Đã nạp thành công {files_processed} file mới/cập nhật vào hệ thống."

        return {"message": message, "files_processed": files_processed}

    except Exception as e:
        logger.exception("Ingest failed")
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.post(
    "/api/chat",
    response_model=ChatResponse,
    dependencies=[Depends(verify_api_key)],
)
def chat_with_bot(request: ChatRequest) -> dict:
    """Answer a user question about tax and land regulations.

    Supports multi-turn conversation via optional session_id.
    Requires API Key authentication via X-API-Key header.

    Raises:
        HTTPException: If chat processing fails.
    """
    try:
        # Get or create conversation session
        session_id = session_store.get_or_create(request.session_id)

        # Retrieve conversation history for context
        history = session_store.get_history(session_id)

        logger.info(
            "session_id=%s | question=%s | history_turns=%d",
            session_id, request.question[:80], len(history),
        )

        # Ask the chatbot with history context
        answer = chatbot.ask(request.question, history=history)

        # Save this turn to session history
        session_store.add_turn(session_id, request.question, answer)

        logger.info("session_id=%s | answer_length=%d", session_id, len(answer))

        return {
            "question": request.question,
            "answer": answer,
            "session_id": session_id,
        }

    except Exception as e:
        logger.exception("Chat failed | session_id=%s", request.session_id)
        raise HTTPException(status_code=500, detail=str(e)) from e

