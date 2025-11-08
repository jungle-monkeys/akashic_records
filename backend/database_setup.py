import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text

def setup_database(connection_string: str):
    """PostgreSQL 데이터베이스 및 pgvector 확장 설정"""
    try:
        conn = psycopg2.connect(connection_string)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # pgvector 확장 활성화
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        
        print("✅ 데이터베이스 및 pgvector 설정 완료")
        cursor.close()
        conn.close()
    except Exception as e:
        print(f"❌ 데이터베이스 설정 오류: {e}")

def create_hnsw_index(connection_string: str, collection_name: str):
    """HNSW 인덱스 생성으로 검색 성능 최적화"""
    engine = create_engine(connection_string)
    
    try:
        with engine.connect() as conn:
            # HNSW 인덱스 생성 (cosine 거리 기준)
            index_query = text(f"""
                CREATE INDEX IF NOT EXISTS {collection_name}_hnsw_idx 
                ON langchain_pg_embedding 
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64);
            """)
            
            conn.execute(index_query)
            conn.commit()
            print(f"✅ HNSW 인덱스 생성 완료: {collection_name}_hnsw_idx")
            
    except Exception as e:
        print(f"⚠️ 인덱스 생성 중 오류 (이미 존재할 수 있음): {e}")