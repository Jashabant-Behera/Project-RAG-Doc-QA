# Project RAG Doc Q&A: AI-Powered Document Assistant

A full-stack, production-ready Retrieval-Augmented Generation (RAG) system. This application allows users to upload unstructured documents (PDF, DOCX, TXT) and ask natural language questions about them. The system extracts relevant context using semantic search and leverages a Large Language Model (LLM) to provide highly accurate, document-grounded answers.

## 🚀 Features

* **Retrieval-Augmented Generation (RAG):** Eliminates LLM hallucinations by restricting answers strictly to the provided document context.
* **Intelligent Document Processing:** Asynchronous extraction, chunking, and dense vector embedding using `sentence-transformers` (`all-MiniLM-L6-v2`).
* **High-Speed Vector Search:** Utilizes Facebook AI Similarity Search (FAISS) for lightning-fast, local semantic retrieval.
* **Ultra-Fast LLM Inference:** Powered by **Groq**'s API (using Llama 3 70B & 8B models) for near-instant responses.
* **Persistent Local Sessions:** Uses browser `sessionStorage` to automatically preserve chat histories for up to 1-hour of inactivity per document—no database required.
* **Production-Ready Backend:** Built with FastAPI, featuring async background indexing, clean code architecture, and keep-warm mechanisms for ephemeral deployments (e.g., Render).
* **Modern React UI:** Built with Vite and React, featuring dynamic loading states, drag-and-drop uploads, and responsive chat views.
* **Dockerized:** Fully containerized with a `docker-compose` setup for effortless local deployment.

---

## 🛠️ Tech Stack

**Backend:**
* Python, FastAPI, Uvicorn
* FAISS (Vector Database)
* SentenceTransformers (Local embeddings running on CPU)
* PyMuPDF & python-docx (Document parsing)
* Groq API (Llama 3)
* Pydantic (Data validation)

**Frontend:**
* React, Vite
* React Router DOM
* Vanilla CSS (Modern theming and animations)
* Lucide React (Icons)
* Axios

---

## 🏃‍♂️ Local Setup & Installation

### Prerequisites
* Python 3.11+
* Node.js 18+
* [Groq API Key](https://console.groq.com) (Free)
* *(Optional)* Docker Desktop

### 1. Configuration
Create a `.env` file in the root directory (you can copy `.env.example`):
```env
VECTOR_STORE=faiss
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Get your free key at https://console.groq.com
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL_FAST=llama-3.1-8b-instant
GROQ_MODEL_SMART=llama-3.3-70b-versatile

CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K=5

FRONTEND_URL=http://localhost:5173
```

### 2. Run with Docker (Recommended)
You can spin up the entire application (both frontend and backend) simultaneously:
```bash
docker-compose up --build
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:8000`

### 3. Run Manually (Without Docker)

**Start the Backend:**
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Start the Frontend:**
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

---

## 💡 How It Works Under the Hood

1. **Ingestion & Processing:** 
   When a user uploads a document, a FastAPI background task takes over. The file is parsed (via PyMuPDF/docx) and sanitized. The clean text is split into overlapping chunks (500 chars).
2. **Local Embedding:** 
   The application pre-loads a lightweight embedding model (`all-MiniLM-L6-v2`) in memory at startup. It converts the text chunks into 384-dimensional dense vectors on the CPU without requiring an external API call or GPU.
3. **Indexing:** 
   These vectors are stored locally in a FAISS index alongside a pickle file for metadata tracking.
4. **Retrieval (RAG):**
   When a question is asked, it is embedded into the same 384D space. The FAISS index is queried for the Top-K (default 5) closest contextual chunks mathematically.
5. **Generation:**
   The retrieved chunks and user question are injected into an optimized System Prompt and sent to the Groq API (Llama 3 70B). Groq responds with an accurate, context-grounded answer.
6. **State Management:**
   The React frontend manages ongoing conversations dynamically. Document swapping allows users to view chat history tied seamlessly to the active document ID via local `sessionStorage`.

---

## 🌐 Deployment Guidelines

This application is ready to be deployed to modern cloud providers:
* **Frontend:** Deploy the `/frontend` directory seamlessly on **Vercel** or **Netlify**. Ensure you set the `VITE_API_BASE_URL` environment variable to point to your live backend URL.
* **Backend:** Deploy the `/backend` directory on **Render**, **Railway**, or **Heroku** as a Python Web Service. 
   *(Note: The `requirements.txt` has been tightly pinned for deployment stability. The codebase includes an automated self-ping function to mitigate free-tier server hibernation).*
