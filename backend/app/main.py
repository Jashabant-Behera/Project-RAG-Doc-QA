from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routes import upload, qa
from app.config import settings
from app.logger import logger

app = FastAPI(
    title="RAG Document Q&A",
    description="Upload documents and ask questions grounded in their content.",
    version="0.1.0"
)

# Fix 4: CORS — covers Docker frontend (3000) and Vite dev server (5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload.router, tags=["Upload"])
app.include_router(qa.router, tags=["Q&A"])

# Health check
@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "rag-doc-qa"}

# Groq API startup check
@app.on_event("startup")
async def startup_checks():
    logger.info("Backend starting up...")
    if not settings.GROQ_API_KEY:
        logger.warning(
            "GROQ_API_KEY is not set. "
            "Upload will work but /ask will fail until the key is configured in backend/.env"
        )
    else:
        logger.info(
            f"Groq API key loaded. "
            f"Fast model: {settings.GROQ_MODEL_FAST} | "
            f"Smart model: {settings.GROQ_MODEL_SMART}"
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal error occurred."}
    )
