from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    VECTOR_STORE: str = "faiss"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # LLM Provider Configuration
    GROQ_API_KEY: str = ""
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"
    GROQ_MODEL_SMART: str = "llama-3.3-70b-versatile"

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    RERANK_FETCH_K: int = 15
    RERANK_TOP_N: int = 3
    
    FRONTEND_URL: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
