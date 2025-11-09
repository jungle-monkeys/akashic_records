# Akashic Records — A Learning Assistant Powered by Academic Textbooks

[![이미지 텍스트](http://i.ytimg.com/vi/L0N4DB0GH3g/maxresdefault.jpg)](https://www.youtube.com/watch?v=L0N4DB0GH3g)

When students ask a question through chat, they can instantly explore how multiple textbooks explain the same concept — comparing styles and choosing the learning materials that best fit their own understanding.


## 🗣️ Interactive Learning Through Chat
Students can ask questions in natural language — even with vague keywords — and instantly access relevant textbook pages that explain the concept clearly and reliably.
 → Learn structured, trustworthy knowledge from verified academic sources.

## 📚 Compare and Choose from Multiple Textbooks
The system categorizes textbooks by writing style and topic depth, allowing students to compare explanations across different books.
 → Find the learning style and expression that best fits each individual.

## 💰 Affordable Subscription Model
Instead of expensive purchases, students can access textbooks through a low-cost, subscription-based rental system.
 → Reduced financial burden and scalable B2B partnerships with universities.
 
---
## Tech Stack

### Backend
- Framework: FastAPI (Python)
- AI/LLM: OpenAI GPT-4, LangChain (RAG pipeline)
- Database: PostgreSQL with pgvector extension, HNSW indexing for vector similarity search
- Vector Embeddings: OpenAI text-embedding-3-small
- PDF Processing: PyMuPDF (text extraction and coordinate mapping), RecursiveCharacterTextSplitter (chunk dividing)
- Server: Uvicorn (ASGI)

### Frontend
- Framework: Next.js 15 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui (Radix UI based)
- State Management: Zustand
- Data Fetching: TanStack Query (React Query)
- PDF Viewer: react-pdf-highlight
- Icons: Lucide React

### Infrastructure & DevOps
- Process Management: PM2 (Frontend), nohup (Backend)
- Reverse Proxy: Nginx
- SSL/TLS: Let's Encrypt (Certbot)
- DDNS: DuckDNS
- Firewall: UFW

### Development Tools
- Version Control: Git
- Package Managers: npm (Frontend), pip (Backend)
- Environment: Python venv, Node.js (v22)
