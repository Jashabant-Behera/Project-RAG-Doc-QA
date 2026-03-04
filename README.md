# Project-RAG-Doc-QA

A Retrieval-Augmented Generation (RAG) system for document question-answering. This system allows users to upload documents (PDF, DOCX, TXT), which are processed, chunked, and embedded into a FAISS vector database. Users can then ask natural language questions about the documents, and an Ollama-powered LLM (Mistral) generates context-aware answers.

## Architecture

```text
User
 ↓
React Frontend (Vite)
 ↓
FastAPI Backend
 ↓
RAG Pipeline (Sentence-Transformers)
 ↓
FAISS Vector DB
 ↓
Ollama (Mistral:7b)
```

## Features Complete To Date

### Phase 1: Project Setup & Environment
- Initialized Git repository and defined `.gitignore`.
- Set up Docker environment with `docker-compose.yml` for backend and frontend services.
- Created base backend (FastAPI) and frontend (React/Vite) directory structures.
- Configured environment variables mapping (`.env`).

### Phase 2: Backend Core - Ingestion Pipeline
- **File Utilities**: Implemented dynamic validations catching inappropriate file types (`pdf`, `docx`, `txt`) and sizes (up to 50MB).
- **Ingestion**: Extract text accurately from different file formats using PyMuPDF and python-docx. Handles character cleaning and encoding normalization.
- **Chunking**: Splits text using a sliding window context (500 limit, 50 overlap) keeping structural metadata intact.
- **Embeddings**: Utilizes `Sentence-Transformers` (`all-MiniLM-L6-v2`) lazy-loaded into memory to generate 384-dimensional dense vectors.
- **Vector DB**: Employs FAISS `IndexFlatIP` (inner-product) mapping text metadata perfectly with exact vectors stored locally.

### Phase 3: QA Pipeline & Final Backend Implementation
- **LLM Client**: Configured an async local HTTPX client resolving inference directly against a Dockerized Ollama Mistral node. Handles distinct connection and timeout boundaries securely.
- **RAG Pipeline**: Encapsulates retrieved FAISS context into an LLM grounded template constraint trimming bounds to an exact 4000-character max limitation preventing local memory overflows.
- **Endpoints**: Implemented fully operational POST integrations for `/upload` and `/ask`.
- **Testing Integration**: Fully wrapped pipeline testing (`test_ingestion.py` and `test_pipeline.py`) incorporating mocked Python interfaces for seamless validations.
- **Security & Setup**: Resolved CORS bridging over Docker and Vite interfaces, dynamically asserting Ollama boot states via the native `/health` check.

### Phase 4: Frontend Application (In Progress)
- Initialized React/Vite UI architecture.
- Modularized Axios API fetch boundaries (`api/client.js`, `api/upload.js`, `api/qa.js`).
- Created foundational react components awaiting active logic structures (`FileUpload.jsx`, `ChatView.jsx`, `Sidebar.jsx`).

## Running the Application

### 1. Start Ollama Locally
```bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama run mistral:7b
```

### 2. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation available at: `http://localhost:8000/docs`

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Compose
To build and run the entire stack:
```bash
docker compose up --build
```
