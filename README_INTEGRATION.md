# Frontend ↔ Backend 연동 가이드

## 🎯 완료된 작업

### 1. Backend API 서버 생성 (`backend/api.py`)
- FastAPI 기반 REST API 서버
- `/api/analyze` 엔드포인트: 질문 분석 및 답변 생성
- CORS 설정: Frontend와 통신 가능
- Startup 시 StudyAssistant 자동 초기화

### 2. Frontend API 연동 (`frontend/src/lib/llmService.ts`)
- 실제 Backend API 호출로 변경
- Fallback: API 실패 시 Mock 데이터 사용
- 환경 변수 지원: `NEXT_PUBLIC_API_URL`

---

## 🚀 실행 방법

### 1️⃣ Backend 서버 시작

#### PostgreSQL 준비
```bash
# PostgreSQL 실행 확인
psql -U postgres

# 데이터베이스 생성 (처음 1회만)
CREATE DATABASE textbook_db;
```

#### 환경 변수 설정 (`.env`)
```env
OPENAI_API_KEY=your_openai_api_key
POSTGRES_CONNECTION=postgresql://postgres:1234@localhost:5432/textbook_db
```

#### 벡터 스토어 초기 구축 (처음 1회만)
```bash
cd backend
python main.py --rebuild -q "test"
```

#### FastAPI 서버 실행
```bash
cd backend
python api.py

# 또는 uvicorn 직접 실행
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

**서버 확인:**
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

---

### 2️⃣ Frontend 서버 시작

#### 환경 변수 설정 (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Next.js 개발 서버 실행
```bash
cd frontend
npm run dev
```

**Frontend 확인:**
- App: http://localhost:3000

---

## 🔄 데이터 흐름

```
1. 사용자 질문 입력 (ChatPanel.tsx)
   ↓
2. analyzeLearningQuery() 호출 (llmService.ts)
   ↓
3. POST /api/analyze (FastAPI)
   ↓
4. StudyAssistant.answer() (main.py)
   ↓
5. QASystem.answer_question() (qa_system.py)
   ├─ pgvector similarity_search_with_score()
   ├─ LLM (GPT-4) 답변 생성
   └─ references + metadata 반환
   ↓
6. Frontend 응답 수신 (AnalysisResult)
   ├─ keywords: 추출된 키워드
   ├─ recommendedBooks: 관련 교재 목록
   ├─ explanation: AI 답변
   └─ references: 참고 문서 (페이지, 좌표)
   ↓
7. ResultsPanel 업데이트 (추천 교재 표시)
```

---

## 📡 API 명세

### POST `/api/analyze`

**요청:**
```json
{
  "query": "what is cpu",
  "k": 5
}
```

**응답:**
```json
{
  "query": "what is cpu",
  "answer": "CPU (Central Processing Unit)는...",
  "keywords": ["cpu", "processor", "architecture"],
  "recommendedBooks": [
    {
      "id": "csapp-2016",
      "title": "CSAPP 2016",
      "author": "Unknown",
      "subject": "Computer Science",
      "year": 2024,
      "pdfUrl": "/pdfs/CSAPP_2016.pdf",
      "coverUrl": "/covers/CSAPP_2016.jpg",
      "pages": [42, 56, 78],
      "relevanceScore": 0.85
    }
  ],
  "references": [
    {
      "page": 42,
      "source": "CSAPP_2016.pdf",
      "content": "...",
      "similarity_score": 0.85
    }
  ],
  "metadata": {
    "primary_threshold": 0.6,
    "fallback_threshold": 0.65,
    "used_fallback": false,
    "sources_summary": {...}
  }
}
```

---

## 🛠️ 트러블슈팅

### 1. Backend 연결 실패
**증상:** Frontend에서 "Mock 데이터로 대체합니다" 경고 표시

**해결:**
```bash
# Backend 서버 실행 확인
curl http://localhost:8000/api/health

# 응답이 없으면 Backend 서버 시작
cd backend
python api.py
```

### 2. PostgreSQL 연결 오류
**증상:** `UnicodeDecodeError` 또는 `connection refused`

**해결:**
```bash
# PostgreSQL 실행 확인
psql -U postgres

# 연결 문자열 확인 (.env)
POSTGRES_CONNECTION=postgresql://postgres:YOUR_PASSWORD@localhost:5432/textbook_db

# 비밀번호에 특수문자가 있으면 URL 인코딩
# 예: password! → password%21
```

### 3. CORS 오류
**증상:** Browser console에 CORS 오류 표시

**해결:** `backend/api.py`의 CORS 설정에 Frontend URL 추가
```python
allow_origins=["http://localhost:3000", "http://localhost:3001"]
```

### 4. OpenAI API Key 오류
**증상:** `Invalid API key`

**해결:** `.env` 파일에 유효한 OpenAI API Key 설정
```env
OPENAI_API_KEY=sk-proj-...
```

---

## 📦 의존성 설치

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

---

## ✅ 테스트 체크리스트

- [ ] PostgreSQL 실행 중
- [ ] Backend 서버 실행 (http://localhost:8000)
- [ ] Frontend 서버 실행 (http://localhost:3000)
- [ ] `.env` 파일 설정 완료
- [ ] 벡터 스토어 초기화 완료 (`--rebuild`)
- [ ] OpenAI API Key 유효
- [ ] 질문 입력 시 실제 Backend 응답 수신 (Console 확인)
- [ ] 추천 교재 목록 표시
- [ ] PDF 뷰어 동작

---

## 🎉 완료!

이제 Frontend에서 질문을 입력하면 실제 Backend AI가 답변을 생성합니다!

**주요 기능:**
- pgvector 기반 유사도 검색
- GPT-4 기반 답변 생성
- 교재 페이지 및 좌표 참조
- 신뢰도 기반 필터링
- Fallback Mock 데이터 지원
