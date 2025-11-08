# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    POSTGRES_CONNECTION = os.getenv(
        "POSTGRES_CONNECTION",
        "postgresql://postgres:postgres@localhost:5432/textbook_db"
    )
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    EMBEDDING_MODEL = "text-embedding-3-small"
    LLM_MODEL = "gpt-4"
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    COLLECTION_NAME = "textbook_chunks"
    # 유사도 임계값(코사인 거리). 값이 작을수록 더 유사하며, 기본값은 0.35.
    _similarity_threshold = os.getenv("SIMILARITY_THRESHOLD")
    if _similarity_threshold is None or not _similarity_threshold.strip():
        SIMILARITY_THRESHOLD = 0.6
    elif _similarity_threshold.strip().lower() in {"off", "none", "disable"}:
        SIMILARITY_THRESHOLD = None
    else:
        SIMILARITY_THRESHOLD = float(_similarity_threshold)

    # 임계값 미통과 시 완화해 줄 보조 임계값 (기본 0.65). off/none/disable 로 비활성화.
    _fallback_threshold = os.getenv("SIMILARITY_FALLBACK_THRESHOLD")
    if _fallback_threshold is None or not _fallback_threshold.strip():
        SIMILARITY_FALLBACK_THRESHOLD = 0.65
    elif _fallback_threshold.strip().lower() in {"off", "none", "disable"}:
        SIMILARITY_FALLBACK_THRESHOLD = None
    else:
        SIMILARITY_FALLBACK_THRESHOLD = float(_fallback_threshold)
