"""Pydantic models for API request and response schemas."""

from typing import Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request body for the chat endpoint."""

    question: str = Field(..., min_length=1, description="Câu hỏi của người dùng")
    session_id: Optional[str] = Field(
        default=None,
        description="ID phiên hội thoại (để tiếp tục cuộc trò chuyện trước đó)",
    )


class ChatResponse(BaseModel):
    """Response body for the chat endpoint."""

    question: str
    answer: str
    session_id: str = Field(description="ID phiên hội thoại để sử dụng cho lượt tiếp theo")


class StatusResponse(BaseModel):
    """Response body for the health-check endpoint."""

    status: str


class IngestResponse(BaseModel):
    """Response body for the document ingestion endpoint."""

    message: str
    files_processed: int = Field(description="Số file đã được nạp mới/cập nhật")
