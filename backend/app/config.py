from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    VECTOR_STORE: str = "faiss"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"
    OLLAMA_URL: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "mistral:7b"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 5

    class Config:
        env_file = ".env"

settings = Settings()
