"""
FastAPI 서버 - Frontend와 Backend 연동
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import uvicorn

from main import StudyAssistant

app = FastAPI(title="Akashic Records API")

# CORS 설정 - Frontend와 통신 허용
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (개발 환경)
    allow_credentials=False,  # credentials 비활성화 (allow_origins=["*"]와 함께 사용)
    allow_methods=["*"],
    allow_headers=["*"],
)

# 전역 assistant 인스턴스 (앱 시작 시 초기화)
assistant: Optional[StudyAssistant] = None


class QueryRequest(BaseModel):
    """질문 요청 모델"""
    query: str
    k: int = 5  # 검색할 문서 개수


class AnalysisResponse(BaseModel):
    """분석 결과 응답 모델"""
    query: str
    answer: str
    keywords: List[str]
    recommendedBooks: List[Dict[str, Any]]
    references: List[Dict[str, Any]]
    metadata: Dict[str, Any]


@app.on_event("startup")
async def startup_event():
    """앱 시작 시 StudyAssistant 초기화"""
    global assistant
    print("🚀 FastAPI 서버 시작 중...")
    print("📚 StudyAssistant 초기화 중...")

    assistant = StudyAssistant(batch_size=100)
    # rebuild=False로 기존 벡터 스토어 사용
    assistant.prepare(rebuild=False, ingest=False)

    print("✅ FastAPI 서버 준비 완료!")


@app.get("/")
async def root():
    """Health check"""
    return {"status": "ok", "message": "Akashic Records API is running"}


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_query(request: QueryRequest):
    """
    질문 분석 및 답변 생성 엔드포인트

    Frontend의 analyzeLearningQuery()가 호출하는 API
    """
    if not assistant:
        raise HTTPException(status_code=503, detail="Assistant not initialized")

    try:
        # Backend의 answer() 함수 호출
        result = assistant.answer(request.query, k=request.k)

        # Frontend가 기대하는 형식으로 변환
        response = {
            "query": result["question"],
            "answer": result["answer"],
            "keywords": _extract_keywords_from_query(request.query),
            "recommendedBooks": _format_books_from_references(result["references"]),
            "references": result["references"],
            "metadata": result["metadata"]
        }

        return response

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _extract_keywords_from_query(query: str) -> List[str]:
    """질문에서 키워드 추출 (간단한 버전)"""
    # 나중에 더 정교한 키워드 추출 알고리즘으로 대체 가능
    words = query.replace("?", "").replace(".", "").split()
    # 불용어 제거 (간단한 버전)
    stopwords = {"은", "는", "이", "가", "을", "를", "의", "에", "에서", "과", "와", "what", "is", "the", "a", "an"}
    keywords = [w for w in words if w.lower() not in stopwords and len(w) > 1]
    return keywords[:5]  # 최대 5개


def _format_books_from_references(references: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    references에서 교재 정보 추출 및 Frontend 형식으로 변환
    Frontend의 Textbook 타입에 맞는 모든 필수 필드 포함
    bbox 데이터를 Highlight 형식으로 변환
    """
    books = {}

    for ref in references:
        source = ref.get("source", "Unknown")

        # 같은 책이면 하나로 합치기
        if source not in books:
            book_id = source.replace(".pdf", "").replace("_", "-")
            books[source] = {
                # 필수 필드
                "id": book_id,
                "title": source.replace("_", " ").replace(".pdf", ""),
                "pdfUrl": f"/{source}",
                "author": "Unknown",  # PDF 메타데이터에서 가져올 수 있으면 추가
                "language": "en",  # 기본값
                "level": "undergraduate",  # 기본값
                "subject": "Computer Science",
                "tags": ["computer-science", "textbook"],
                "initialPage": 1,
                "highlights": [],

                # 추가 필드
                "publisherId": None,
                "description": f"Reference material from {source}",
                "coverImage": f"/covers/{source.replace('.pdf', '.jpg')}",
                "rating": None,
                "reviewCount": None,

                # 내부 사용 필드
                "pages": [],
                "relevanceScore": ref.get("similarity_score", 0.0)
            }

        # 페이지 정보 추가
        page = ref.get("page", 0)
        if page and page not in books[source]["pages"]:
            books[source]["pages"].append(page)

        # initialPage를 첫 번째 참조 페이지로 설정
        if page and books[source]["initialPage"] == 1:
            books[source]["initialPage"] = page

        # bbox 데이터를 Highlight 형식으로 변환
        x1 = ref.get("x1")
        y1 = ref.get("y1")
        x2 = ref.get("x2")
        y2 = ref.get("y2")

        if page and x1 is not None and y1 is not None and x2 is not None and y2 is not None:
            highlight = {
                "page": page,
                "x": x1,
                "y": y1,
                "width": x2 - x1,
                "height": y2 - y1
            }
            books[source]["highlights"].append(highlight)

    # 리스트로 변환 및 관련도 순 정렬
    result = list(books.values())
    result.sort(key=lambda x: x["relevanceScore"], reverse=True)

    return result


@app.get("/api/health")
async def health_check():
    """서버 상태 확인"""
    return {
        "status": "healthy",
        "assistant_ready": assistant is not None
    }


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Akashic Records API Server")
    print("=" * 60)
    print("📡 서버 주소: http://localhost:8000")
    print("📖 API 문서: http://localhost:8000/docs")
    print("=" * 60)

    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # 개발 중 자동 리로드
        log_level="info"
    )
