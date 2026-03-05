# RAG Doc Q&A

An AI-powered document Question & Answer system built with FastAPI, FAISS,
Sentence-Transformers, Groq LLM, and React.

Upload a PDF, DOCX, or TXT file — then ask questions grounded entirely
in its content.

---

## Architecture

```
   FastAPI :8000
        ↓           ↓
   FAISS Index   Groq API
   (local disk)  (LLM cloud)
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Python 3.11 |
| Embeddings | all-MiniLM-L6-v2 (Sentence-Transformers) |
| Vector Store | FAISS IndexFlatIP |
| LLM | Groq API — llama-3.3-70b-versatile |
| Frontend | React 18 + Vite |
| UI | Retro design system — 5 color themes |
| UI | Retro design system — 5 color themes |

---

## Prerequisites

- Python 3.11+
- Node.js 18+ (for frontend)
- Groq API key — free at https://console.groq.com

---

## Quick Start

```bash
# 1. Clone
git clone <your-repo-url>
cd Project-RAG-Doc-QA

# 2. Configure
cp backend/.env.example backend/.env
# Edit backend/.env — set GROQ_API_KEY=your_key_here

# 3. Backend (Terminal 1)
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate | On Mac/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 4. Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## Configuration

| Key | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | required | Groq cloud API key |
| `GROQ_MODEL_FAST` | llama-3.1-8b-instant | Fast model |
| `GROQ_MODEL_SMART` | llama-3.3-70b-versatile | RAG answer model |
| `EMBEDDING_MODEL` | all-MiniLM-L6-v2 | Embedding model |
| `CHUNK_SIZE` | 500 | Characters per chunk |
| `CHUNK_OVERLAP` | 50 | Overlap between chunks |
| `TOP_K` | 5 | Chunks retrieved per query |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service status |
| POST | `/upload` | Upload + index document |
| POST | `/ask` | Ask question about document |

**POST /upload** — multipart/form-data
```json
{
  "doc_id": "a3f8c2d1...",
  "filename": "report.pdf",
  "chunk_count": 42
}
```

**POST /ask** — JSON body
```json
// Request
{ "question": "What are the key findings?", "doc_id": "a3f8c2d1..." }

// Response
{
  "answer": "The key findings include...",
  "sources": [
    { "filename": "report.pdf", "chunk_index": 3, "score": 0.92, "text": "..." }
  ]
}
```

---

## Running Tests

```bash
cd backend
python -m tests.test_ingestion   # Full ingestion pipeline
python -m tests.test_pipeline    # QA pipeline with mocked LLM
```

---

## Known Limitations

- FAISS index is stored on disk — persists relative to backend storage folder
- No authentication — open API
- Large documents may hit Groq context window limits
- Multi-document search not yet supported — each query scoped to one doc_id
