from openai import AsyncOpenAI
from app.config import settings
from app.logger import logger

def _get_groq_client() -> AsyncOpenAI:
    return AsyncOpenAI(
        api_key=settings.GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )


async def call_groq(prompt: str, smart: bool = True) -> str:
    """
    Call Groq's LLM via the OpenAI-compatible API.

    Args:
        prompt: The full RAG prompt (context + question).
        smart:  If True, use the 70b versatile model (better accuracy).
                If False, use the 8b instant model (faster, cheaper).
    """
    model = settings.GROQ_MODEL_SMART if smart else settings.GROQ_MODEL_FAST
    client = _get_groq_client()

    try:
        logger.info(f"Calling Groq model '{model}' ...")
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant answering questions about a document. "
                        "Use the provided context as the main source of information. "
                        "If the context is partially relevant, use it to give the best possible answer. "
                        "If the answer cannot be found in the context, say you could not find it."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.2,
            max_tokens=1024,
        )

        answer = response.choices[0].message.content.strip()
        logger.info(f"Groq responded with {len(answer)} characters.")
        return answer

    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise RuntimeError(f"Groq API call failed: {e}")
