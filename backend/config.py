# config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    POSTGRES_CONNECTION = os.getenv(
        "POSTGRES_CONNECTION",
        "postgresql://postgres:postgres@localhost:5432/textbook_db"
    )
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    # EMBEDDING_MODEL = "text-embedding-3-small"
    # LLM_MODEL = "gpt-4"
    OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    EMBEDDING_MODEL = "bge-m3"  # 또는 "nomic-embed-text"
    LLM_MODEL = "llama3.2:3b"  # 한국어 지원: "EEVE-Korean-10.8B:latest"
    COLLECTION_NAME = "textbook_chunks"