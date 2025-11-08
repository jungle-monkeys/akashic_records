# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Akashic Records is an AI-powered personalized eTextbook platform with two main components:
- **Backend**: FastAPI server with LangChain, OpenAI, and pgvector for semantic search and Q&A
- **Frontend**: Next.js 15 application with shadcn/ui components for textbook reader and search interface

The system processes PDF textbooks, creates vector embeddings with coordinate extraction, stores them in PostgreSQL with pgvector, and provides intelligent question-answering with document references including exact page coordinates.

---

## Development Commands

### Backend (FastAPI + LangChain)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# First-time setup: Initialize vector store with PDFs
python main.py --rebuild -q "test"

# Run FastAPI server (development)
python api.py

# Or with uvicorn directly
uvicorn api:app --host 0.0.0.0 --port 8000 --reload

# CLI testing: Ask a question directly
python main.py -q "what is cpu" --k 5

# Rebuild vector store from scratch
python main.py --rebuild -q "test query"

# Add new documents to existing store
python main.py --ingest -q "test query"
```

**Server endpoints:**
- API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

### Frontend (Next.js 15)

```bash
cd frontend

# Install dependencies
npm install

# Run development server (runs on port 8001)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

**Frontend URL:** http://localhost:8001

### Environment Setup

**Root `.env`:**
```env
OPENAI_API_KEY=sk-proj-...
POSTGRES_CONNECTION=postgresql://user:password@localhost:5432/textbook_db
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Setup (PostgreSQL)

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (first time only)
CREATE DATABASE textbook_db;

# Exit psql
\q
```

The backend automatically creates tables and HNSW indexes on startup.

---

## Architecture & Key Components

### Backend Architecture

**Main Pipeline Flow:**
1. `document_processor.py` - Extracts text and coordinates from PDFs using PyMuPDF
2. `vector_store_manager.py` - Creates embeddings and stores in pgvector with HNSW indexing
3. `qa_system.py` - Retrieves similar documents and generates answers using GPT-4
4. `api.py` - FastAPI server exposing `/api/analyze` endpoint
5. `main.py` - CLI interface and `StudyAssistant` orchestration class

**Key Backend Classes:**
- `StudyAssistant` (main.py): Main orchestrator for PDF → VectorStore → QA pipeline
- `DocumentProcessor` (document_processor.py): PDF processing with coordinate extraction using PyMuPDF
- `VectorStoreManager` (vector_store_manager.py): Manages pgvector store with HNSW indexing
- `QASystem` (qa_system.py): Similarity search with adaptive thresholds and GPT-4 answer generation

**Vector Search Configuration:**
- Similarity threshold: 0.6 (configurable via `SIMILARITY_THRESHOLD` env var)
- Fallback threshold: 0.65 (configurable via `SIMILARITY_FALLBACK_THRESHOLD`)
- Uses cosine distance (lower scores = higher similarity)
- HNSW indexing for fast approximate nearest neighbor search

**Document Metadata Structure:**
Each chunk includes:
- `book_name`, `page`, `chunk_index`, `source`
- `bbox`: Bounding box coordinates (`x1`, `y1`, `x2`, `y2`)
- `page_width`, `page_height`: Page dimensions for coordinate normalization

### Frontend Architecture

**Directory Structure:**
- `src/app/` - Next.js 15 App Router pages
- `src/components/` - Global UI components (shared across routes)
- `src/lib/` - Utility functions and API services
- `src/store/` - Zustand state management
- `src/types/` - TypeScript type definitions

**State Management:**
- **Client State**: Zustand (`chatStore.ts` for chat history)
- **Server State**: TanStack Query (for API data caching)

**Design System:**
- Primary: shadcn/ui components (Radix UI primitives)
- Styling: Tailwind CSS with custom utilities
- Icons: lucide-react

**API Integration:**
- `llmService.ts` calls backend `/api/analyze` endpoint
- Automatic fallback to mock data if backend is unavailable
- Response includes keywords, recommended books with highlights, and AI explanation

---

## Critical Implementation Details

### PDF Coordinate Extraction

The system extracts bounding box coordinates for each text chunk:
- Uses `fitz.Page.get_text("words")` to get word-level coordinates
- Matches chunk text to word positions using first/last words
- Calculates aggregate bounding box covering the chunk
- Stored in metadata as `bbox: {x1, y1, x2, y2, width, height}`

### Backend Response Format

`/api/analyze` endpoint returns:
```typescript
{
  query: string
  answer: string  // GPT-4 generated answer
  keywords: string[]
  recommendedBooks: Array<{
    id: string
    title: string
    pdfUrl: string
    initialPage: number  // First reference page
    highlights: Array<{page, x, y, width, height}>  // Bounding boxes
    relevanceScore: number
    // ... other Textbook fields
  }>
  references: Array<{
    book_name, page, chunk_index, source,
    x1, y1, x2, y2, score,
    content_preview, document
  }>
  metadata: {
    confidence: "high" | "low"
    threshold: number
    fallback_threshold: number
  }
}
```

### Similarity Search Logic

1. Retrieve top-k similar documents with scores
2. Filter by primary threshold (0.6)
3. If no results, use fallback threshold (0.65) with "low" confidence
4. If still no results, return friendly error message
5. Generate GPT-4 answer using filtered documents as context

### Chunk Processing

- Default chunk size: 1000 characters
- Chunk overlap: 200 characters
- Separators: `\n\n`, `\n`, space
- Each chunk maintains page number and coordinates for precise reference

---

## Common Development Workflows

### Adding New PDF Textbooks

1. Place PDF in backend directory (or update `DEFAULT_PDF_FILES` in main.py)
2. Run vector store rebuild:
   ```bash
   cd backend
   python main.py --rebuild -q "test"
   ```
3. Restart FastAPI server to reload assistant

### Testing Backend Changes

```bash
# Test CLI directly
python main.py -q "your test question" --k 5

# Test API endpoint
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"query": "what is cpu", "k": 5}'
```

### Frontend Development

- Custom components go in route-specific `_components/` folders (e.g., `src/app/reader/_components/`)
- Shared components go in `src/components/`
- Always check shadcn/ui before creating custom components
- Use Zustand for UI state, TanStack Query for server data

### Modifying Similarity Thresholds

Adjust in `.env`:
```env
SIMILARITY_THRESHOLD=0.6  # Primary threshold
SIMILARITY_FALLBACK_THRESHOLD=0.65  # Fallback threshold
# Set to "off" to disable filtering
```

---

## Important Notes

### Database Connection

- Default connection uses `junglemonkeys:junglemonkeys1!` credentials
- Password special characters must be URL-encoded in connection string
- HNSW index is automatically created/recreated during setup

### Frontend Port Configuration

- Frontend runs on port **8001** (not 3000) - see `package.json` scripts
- Update CORS settings in `backend/api.py` if changing ports

### Vector Store Behavior

- `--rebuild`: Deletes and recreates vector store from scratch
- `--ingest`: Adds new documents to existing store
- Default: Loads existing store if available, creates new if not

### Coordinate System

- PDF coordinates are in points (1/72 inch)
- Origin (0,0) is at top-left corner
- Frontend highlights use these coordinates with react-pdf

### Frontend File Naming

- Components: PascalCase (`ChatPanel.tsx`)
- Folders: kebab-case (`chat-panel/`)
- Route exclusions: underscore prefix (`_components/`, `_lib/`)
- Utilities: camelCase (`llmService.ts`)

---

## Troubleshooting

**Backend won't start:**
- Check PostgreSQL is running: `psql -U postgres`
- Verify `.env` has valid `OPENAI_API_KEY` and `POSTGRES_CONNECTION`
- Ensure database exists: `CREATE DATABASE textbook_db;`

**Frontend shows mock data:**
- Verify backend is running: `curl http://localhost:8000/api/health`
- Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Check browser console for CORS errors

**No search results:**
- Check similarity thresholds (may be too strict)
- Verify vector store was built: Run `--rebuild` if needed
- Check if PDFs were processed correctly in backend logs

**Unicode/encoding errors:**
- URL-encode special characters in `POSTGRES_CONNECTION`
- Example: `password!` → `password%21`
