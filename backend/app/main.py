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

# Fix 5: Ollama startup check
@app.on_event("startup")
async def startup_checks():
    import httpx
    logger.info("Backend starting up...")
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{settings.OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                logger.info(f"Ollama is reachable at {settings.OLLAMA_URL}")
            else:
                logger.warning(
                    f"Ollama responded with status {response.status_code}"
                )
    except Exception:
        logger.warning(
            f"Ollama is NOT reachable at {settings.OLLAMA_URL}. "
            "Upload will work but /ask will fail until Ollama is running."
        )

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal error occurred."}
    )
