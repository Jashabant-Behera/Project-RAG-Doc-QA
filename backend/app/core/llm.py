import httpx
from app.config import settings
from app.logger import logger

async def call_ollama(prompt: str) -> str:
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            answer = data.get("response", "").strip()
            logger.info(f"LLM responded with {len(answer)} characters.")
            return answer

    except httpx.ConnectError:
        logger.error("Cannot connect to Ollama. Is it running?")
        raise ConnectionError(
            f"Cannot reach Ollama at {settings.OLLAMA_URL}. "
            "Ensure Ollama is running: docker run -p 11434:11434 ollama/ollama"
        )
    except httpx.TimeoutException:
        logger.error("Ollama request timed out.")
        raise TimeoutError("Ollama did not respond within 60 seconds.")
    except httpx.HTTPStatusError as e:
        logger.error(f"Ollama returned HTTP error: {e.response.status_code}")
        raise RuntimeError(
            f"Ollama HTTP error: {e.response.status_code} — {e.response.text}"
        )
