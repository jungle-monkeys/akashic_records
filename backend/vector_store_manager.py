# vector_store_manager.py
from typing import List, Optional
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from langchain_postgres import PGVector
from sqlalchemy import create_engine
from config import Config
from database_setup import create_hnsw_index

class VectorStoreManager:
    """pgvector 벡터 스토어 관리 (HNSW 인덱스 최적화)"""
    
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=Config.EMBEDDING_MODEL,
            openai_api_key=Config.OPENAI_API_KEY
        )
        # self.embeddings = OllamaEmbeddings(
        #     model=Config.EMBEDDING_MODEL,
        #     base_url=Config.OLLAMA_BASE_URL
        # )
        self.vector_store: Optional[PGVector] = None
    
    def create_vector_store(self, documents: List[Document]) -> PGVector:
        """PostgreSQL pgvector 스토어 생성 및 HNSW 인덱스 최적화"""
        print("\n🔵 PGVector 스토어 생성 중...")
        
        # PGVector 스토어 생성
        self.vector_store = PGVector.from_documents(
            documents=documents,
            embedding=self.embeddings,
            collection_name=Config.COLLECTION_NAME,
            connection=Config.POSTGRES_CONNECTION,
            use_jsonb=True,
            pre_delete_collection=False  # 기존 데이터 유지
        )
        
        print("✅ PGVector 스토어 생성 완료")
        
        # HNSW 인덱스 생성으로 성능 최적화
        print("\n⚡ HNSW 인덱스 생성 중...")
        create_hnsw_index(Config.POSTGRES_CONNECTION, Config.COLLECTION_NAME)
        
        return self.vector_store
    
    def load_existing_store(self) -> PGVector:
        """기존 벡터 스토어 로드"""
        print("\n📂 기존 PGVector 스토어 로드 중...")
        
        self.vector_store = PGVector(
            embeddings=self.embeddings,
            collection_name=Config.COLLECTION_NAME,
            connection=Config.POSTGRES_CONNECTION,
            use_jsonb=True
        )
        
        print("✅ 기존 스토어 로드 완료")
        return self.vector_store
    
    def add_documents(self, documents: List[Document]) -> None:
        """기존 스토어에 문서 추가"""
        if self.vector_store is None:
            raise ValueError("벡터 스토어가 초기화되지 않았습니다.")
        
        print(f"\n📥 {len(documents)}개 문서 추가 중...")
        self.vector_store.add_documents(documents)
        print("✅ 문서 추가 완료")
    
    def get_store(self) -> PGVector:
        """벡터 스토어 반환"""
        if self.vector_store is None:
            raise ValueError("벡터 스토어가 초기화되지 않았습니다.")
        return self.vector_store
