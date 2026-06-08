"""RAG (Retrieval-Augmented Generation) service for tax and land regulation chatbot.

Handles document ingestion, vector database management, and query processing
using Google Generative AI models with FAISS for vector storage.
"""

import hashlib
import json
import logging
import os
import re
import textwrap
from pathlib import Path
from typing import Optional

from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import CSVLoader, PyPDFLoader, TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
    before_sleep_log,
)

from app.config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    DATA_DIR,
    EMBEDDING_MODEL,
    INGESTION_MANIFEST_PATH,
    LLM_MODEL,
    LLM_TEMPERATURE,
    SIMILARITY_SEARCH_K,
    VECTOR_DB_DIR,
    VIETNAMESE_SEPARATORS,
)

logger = logging.getLogger(__name__)

_FILE_LOADERS = {
    ".pdf": (PyPDFLoader, {}),
    ".txt": (TextLoader, {"encoding": "utf-8"}),
    ".md": (TextLoader, {"encoding": "utf-8"}),
    ".csv": (CSVLoader, {"encoding": "utf-8"}),
}

_NO_CHUNK_EXTENSIONS = {".csv"}

_RETRYABLE_EXCEPTIONS = (Exception,)


def _is_retryable(exc: BaseException) -> bool:
    msg = str(exc).lower()
    return any(keyword in msg for keyword in (
        "429", "too many requests", "resource exhausted",
        "timeout", "deadline exceeded", "503", "unavailable",
        "500", "internal",
    ))


def clean_vietnamese_legal_text(raw_text: str) -> str:
    text = raw_text
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace(" ", " ").replace("​", "")
    text = re.sub(r"Đi\s*\n\s*ều", "Điều", text)
    text = re.sub(r"Kho\s*\n\s*ản", "Khoản", text)
    text = re.sub(r"Đi\s+ều", "Điều", text)
    text = re.sub(r"Kho\s+ản", "Khoản", text)
    text = re.sub(r"(?<!\n)\n?(?=Điều\s+\d)", "\n\n", text)
    text = re.sub(r"(?<!\n)\n?(?=Khoản\s+\d)", "\n\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = "\n".join(line.rstrip() for line in text.split("\n"))
    return text.strip()


class RAGEngine:
    """RAG engine using FAISS for local vector storage."""

    def __init__(self) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model=LLM_MODEL,
            temperature=LLM_TEMPERATURE,
        )
        self.embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
        self._db: Optional[FAISS] = None

        self._text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            separators=VIETNAMESE_SEPARATORS,
        )

        logger.info("RAGEngine initialized (FAISS backend)")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def ingest_all_data(self) -> int:
        if not os.path.isdir(DATA_DIR):
            logger.warning("Data folder not found: %s", DATA_DIR)
            return 0

        logger.info("Scanning data folder: %s", DATA_DIR)

        manifest = self._load_manifest()
        new_manifest: dict[str, str] = {}
        files_to_process: list[tuple[str, str]] = []

        for filename in os.listdir(DATA_DIR):
            file_path = os.path.join(DATA_DIR, filename)
            if not os.path.isfile(file_path):
                continue

            ext = Path(filename).suffix.lower()
            if ext not in _FILE_LOADERS:
                logger.debug("Skipping unsupported file: %s", filename)
                continue

            file_hash = self._compute_file_hash(file_path)
            new_manifest[filename] = file_hash

            if manifest.get(filename) == file_hash:
                logger.info("Skipping unchanged file: %s", filename)
            else:
                files_to_process.append((file_path, ext))
                action = "new" if filename not in manifest else "modified"
                logger.info("Queued %s file: %s", action, filename)

        if not files_to_process:
            logger.info("No new or modified files to ingest")
            self._save_manifest(new_manifest)
            return 0

        all_chunks = self._load_files(files_to_process)

        if not all_chunks:
            logger.warning("No valid data extracted from queued files")
            return 0

        logger.info("Embedding and saving %d chunks to FAISS…", len(all_chunks))

        faiss_index_path = os.path.join(VECTOR_DB_DIR, "index")

        if self._db is not None:
            self._db.add_documents(all_chunks)
            self._db.save_local(faiss_index_path)
        elif os.path.exists(faiss_index_path):
            existing = FAISS.load_local(
                faiss_index_path,
                self.embeddings,
                allow_dangerous_deserialization=True,
            )
            existing.add_documents(all_chunks)
            existing.save_local(faiss_index_path)
            self._db = existing
        else:
            os.makedirs(VECTOR_DB_DIR, exist_ok=True)
            new_db = FAISS.from_documents(all_chunks, self.embeddings)
            new_db.save_local(faiss_index_path)
            self._db = new_db

        logger.info("Ingestion completed: %d files → FAISS", len(files_to_process))
        self._save_manifest(new_manifest)
        return len(files_to_process)

    def ask(
        self,
        user_question: str,
        history: list[dict] | None = None,
    ) -> str:
        try:
            db = self._get_db()
            if db is None:
                return "Hệ thống chưa có dữ liệu. Vui lòng nạp tài liệu qua /api/ingest trước."

            docs = db.similarity_search(user_question, k=SIMILARITY_SEARCH_K)

            if not docs:
                return "Hệ thống hiện chưa có quy định cho trường hợp này."

            context = self._build_context(docs)
            prompt = self._build_prompt(context, user_question, history)

            response = self._invoke_llm_with_retry(prompt)
            return response.content

        except Exception:
            logger.exception("Error querying AI")
            return "Đã xảy ra lỗi trong quá trình xử lý. Vui lòng thử lại sau!"

    # ------------------------------------------------------------------
    # LLM invocation with retry
    # ------------------------------------------------------------------

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        retry=retry_if_exception_type(_RETRYABLE_EXCEPTIONS),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    def _invoke_llm_with_retry(self, prompt: str):
        try:
            return self.llm.invoke(prompt)
        except Exception as exc:
            if _is_retryable(exc):
                logger.warning("Retryable LLM error: %s", exc)
                raise
            logger.error("Non-retryable LLM error: %s", exc)
            raise

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _get_db(self) -> Optional[FAISS]:
        if self._db is None:
            faiss_index_path = os.path.join(VECTOR_DB_DIR, "index")
            if os.path.exists(faiss_index_path):
                self._db = FAISS.load_local(
                    faiss_index_path,
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
                logger.info("FAISS index loaded from %s", faiss_index_path)
        return self._db

    def _load_files(self, files: list[tuple[str, str]]) -> list:
        all_chunks: list = []
        for file_path, ext in files:
            filename = os.path.basename(file_path)
            try:
                docs = self._load_file(file_path, ext)
                if ext not in _NO_CHUNK_EXTENSIONS:
                    for doc in docs:
                        doc.page_content = clean_vietnamese_legal_text(doc.page_content)
                    all_chunks.extend(self._text_splitter.split_documents(docs))
                else:
                    all_chunks.extend(docs)
                logger.info("Processed %s (%d docs)", filename, len(docs))
            except Exception:
                logger.exception("Error processing file %s", filename)
        return all_chunks

    @staticmethod
    def _load_file(file_path: str, ext: str) -> list:
        loader_cls, loader_kwargs = _FILE_LOADERS[ext]
        loader = loader_cls(file_path, **loader_kwargs)
        return loader.load()

    @staticmethod
    def _compute_file_hash(file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(8192), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    @staticmethod
    def _load_manifest() -> dict[str, str]:
        if not os.path.isfile(INGESTION_MANIFEST_PATH):
            return {}
        try:
            with open(INGESTION_MANIFEST_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, OSError):
            logger.warning("Corrupt manifest file, starting fresh")
            return {}

    @staticmethod
    def _save_manifest(manifest: dict[str, str]) -> None:
        os.makedirs(os.path.dirname(INGESTION_MANIFEST_PATH), exist_ok=True)
        with open(INGESTION_MANIFEST_PATH, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        logger.debug("Manifest saved: %d entries", len(manifest))

    @staticmethod
    def _build_context(documents: list) -> str:
        parts: list[str] = []
        for doc in documents:
            source = os.path.basename(
                doc.metadata.get("source", "Tài liệu hệ thống")
            )
            page: Optional[int] = doc.metadata.get("page")
            if page is not None:
                ref = f"[Nguồn: {source}, Trang: {page + 1}]"
            else:
                ref = f"[Nguồn: {source}]"
            parts.append(f"{ref}\n{doc.page_content}")
        return "\n\n---\n\n".join(parts)

    @staticmethod
    def _build_prompt(
        context: str,
        user_question: str,
        history: list[dict] | None = None,
    ) -> str:
        history_block = ""
        if history:
            turns = []
            for turn in history:
                turns.append(
                    f"- Người dân: {turn['question']}\n"
                    f"  Tư vấn viên: {turn['answer']}"
                )
            history_block = (
                "\nLỊCH SỬ HỘI THOẠI (để hiểu ngữ cảnh, KHÔNG trả lời lại):\n"
                + "\n".join(turns)
                + "\n"
            )

        return textwrap.dedent("""\
            Bạn là chuyên viên tư vấn của Cổng Dịch vụ công.
            Tuyệt đối chỉ sử dụng phần THÔNG TIN QUY ĐỊNH dưới đây để trả lời.

            YÊU CẦU QUAN TRỌNG:
            - Trả lời rõ ràng, dễ hiểu cho người dân.
            - BẮT BUỘC phải trích dẫn tên tài liệu (và số trang nếu có) ở cuối câu trả lời dựa vào phần [Nguồn: ...] được cung cấp.
            - Nếu thông tin không có trong quy định, hãy nói: "Hệ thống hiện chưa có quy định cho trường hợp này."
            - Nếu có lịch sử hội thoại, hãy sử dụng để hiểu ngữ cảnh câu hỏi hiện tại.

            THÔNG TIN QUY ĐỊNH:
            {context}
            {history}
            CÂU HỎI CỦA NGƯỜI DÂN: {question}
        """).format(
            context=context,
            history=history_block,
            question=user_question,
        )


# Singleton instance used across the application
chatbot = RAGEngine()
