from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    VECTOR_STORE: str = "faiss"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Groq API settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL_FAST: str = "llama-3.1-8b-instant"    # fast, for simple queries
    GROQ_MODEL_SMART: str = "llama-3.3-70b-versatile" # smart, for RAG answers

    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
