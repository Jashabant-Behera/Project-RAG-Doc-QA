import asyncio
import os
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://project-rag-doc-qa.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, tags=["Upload"])
app.include_router(qa.router, tags=["Q&A"])


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok", "service": "rag-doc-qa"}


# ✅ FIX: Self-ping every 13 minutes to prevent Render free-tier cold starts.
# Render spins down services after 15 minutes of inactivity.
async def _keep_warm():
    # Only run in production (when RENDER env var is set by Render platform)
    if not os.getenv("RENDER"):
        return
        
    import httpx
    service_url = os.getenv("RENDER_EXTERNAL_URL", "")
    if not service_url:
        logger.warning("RENDER_EXTERNAL_URL not set — keep-warm disabled.")
        return

    ping_url = f"{service_url}/health"
    logger.info(f"Keep-warm task started. Pinging {ping_url} every 13 minutes.")
    async with httpx.AsyncClient() as client:
        while True:
            await asyncio.sleep(13 * 60)  # 13 minutes
            try:
                r = await client.get(ping_url, timeout=10)
                logger.info(f"Keep-warm ping: {r.status_code}")
            except Exception as e:
                logger.warning(f"Keep-warm ping failed: {e}")


@app.on_event("startup")
async def startup_checks():
    logger.info("Backend starting up...")

    # Embedding model is already loaded at import time (see embedder.py)
    logger.info("Embedding model pre-loaded ✓")

    if not settings.GROQ_API_KEY:
        logger.warning(
            "GROQ_API_KEY is not set. "
            "Upload will work but /ask will fail until the key is configured."
        )
    else:
        logger.info(
            f"Groq API key loaded. "
            f"Fast model: {settings.GROQ_MODEL_FAST} | "
            f"Smart model: {settings.GROQ_MODEL_SMART}"
        )

    # Start keep-warm background loop
    asyncio.create_task(_keep_warm())


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected internal error occurred."}
    )
