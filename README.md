# AI-Powered Document Question Answering System using Generative AI

## Skills Take Away From This Project
- Basics of Generative AI & LLMs
- Prompt engineering fundamentals
- Using pre-trained LLM APIs
- Text embeddings & semantic search
- Building simple AI applications
- Understanding limitations of GenAI

**Domain:** Artificial Intelligence / Knowledge Management

## Problem Statement
Build a Generative AI-based system that allows users to upload documents and ask questions, receiving accurate answers extracted from the document content.

## Business Use Cases
- Internal knowledge assistants for companies
- HR policy document assistants
- Legal or compliance document querying
- Student learning assistants
- Customer support knowledge bases

## Approach (How It Works & What We Have Done)
1. **Load and preprocess documents (PDF/Text):** Users upload a document which is parsed and preprocessed to extract raw text using PyMuPDF and python-docx.
2. **Convert document text into chunks:** The extracted text is split into smaller, overlapping chunks (e.g., 500 characters with a 50-character overlap) to maintain contextual coherence.
3. **Generate embeddings for document chunks:** These chunks are processed by a Sentence-Transformer model (`all-MiniLM-L6-v2`) to create 384-dimensional dense vector embeddings.
4. **Store embeddings in a vector store:** The generated embeddings and their corresponding text are indexed in a local FAISS (Facebook AI Similarity Search) vector database for fast retrieval.
5. **Accept user queries:** Users input a natural language question via the React frontend.
6. **Retrieve relevant document chunks:** The system embeds the user's question and performs a semantic similarity search in FAISS to retrieve the top 5 most relevant document chunks.
7. **Use a Large Language Model (LLM) to generate answers:** The retrieved chunks are injected into a prompt as context. This prompt is sent to the Groq API (using the `llama-3.3-70b-versatile` model) which reasons over the context to generate an accurate answer.
8. **Display responses with source context:** The generated answer is presented to the user in the UI, alongside the exact source chunks acting as citations (Retrieval-Augmented Generation).

## Results
- A working document-based AI assistant
- Accurate answers grounded in uploaded documents
- Simple UI (Frontend) with interactive document upload and chat views
- Demonstration of retrieval-augmented generation (RAG)

## Project Evaluation Metrics
- Answer relevance
- Context accuracy
- Response completeness
- Prompt quality
- System usability
- Handling of irrelevant queries

## Technical Tags
Generative AI, LLM, Prompt Engineering, Embeddings, RAG, Python, React, FastAPI, FAISS, Groq

## Data Set
1. Document QA Dataset (RAG Project)
https://www.kaggle.com/datasets/aswanthandewc/document-qa-dataset-rag-project/data
2. Stanford Question Answering Dataset (SQuAD)
https://www.kaggle.com/datasets/stanfordu/stanford-question-answering-dataset
3. Question-Answer Dataset (General QA)
https://www.kaggle.com/datasets/rtatman/questionanswer-dataset
4. MLQA – Multilingual QA Dataset 
https://www.kaggle.com/datasets/thedevastator/mlqa-multilingual-question-answering-dataset

## Data Set Explanation
The dataset consists of unstructured documents.
Preprocessing includes:
- Text extraction
- Chunking text into smaller parts
- Removing noise
- Generating vector embeddings

## Project Deliverables
- Python source code (FastAPI backend) and React JS (Vite frontend)
- Document ingestion pipeline
- Query-answering module
- Demo video or screenshots (To be prepared)
- README explaining setup and usage

## Project Guidelines
- Keep prompts simple and clear
- Handle empty or irrelevant queries gracefully
- Avoid hallucinations by grounding responses
- Modularize code
- Clearly document assumptions and limitations

---

## Setup and Usage

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API Key (Free at https://console.groq.com)

### 1. Configuration
Create a `.env` file in the `backend/` directory with the following:
```env
VECTOR_STORE=faiss
EMBEDDING_MODEL=all-MiniLM-L6-v2
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL_FAST=llama-3.1-8b-instant
GROQ_MODEL_SMART=llama-3.3-70b-versatile
CHUNK_SIZE=500
CHUNK_OVERLAP=50
TOP_K=5
```

### 2. Run the Backend
```bash
cd backend
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On Mac/Linux:
# source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
