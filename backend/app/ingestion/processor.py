import re
import unicodedata
from pathlib import Path
from app.logger import logger

def extract_text(file_path: str) -> tuple[str, dict]:
    path = Path(file_path)
    ext = path.suffix.lower()
    metadata = {"filename": path.name, "file_type": ext}

    if ext == ".pdf":
        text, metadata = _extract_pdf(path, metadata)
    elif ext == ".docx":
        text, metadata = _extract_docx(path, metadata)
    elif ext == ".txt":
        text, metadata = _extract_txt(path, metadata)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    clean = _clean_text(text)
    logger.info(f"Extracted and cleaned text from {path.name} — {len(clean)} chars")
    return clean, metadata

def _extract_pdf(path: Path, metadata: dict) -> tuple[str, dict]:
    import fitz  # PyMuPDF
    doc = fitz.open(str(path))
    pages = [page.get_text() for page in doc]
    metadata["page_count"] = len(pages)
    return "\n".join(pages), metadata

def _extract_docx(path: Path, metadata: dict) -> tuple[str, dict]:
    from docx import Document
    doc = Document(str(path))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    metadata["page_count"] = len(paragraphs)
    return "\n".join(paragraphs), metadata

def _extract_txt(path: Path, metadata: dict) -> tuple[str, dict]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        text = f.read()
    metadata["page_count"] = 1
    return text, metadata

def _clean_text(text: str) -> str:
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    # Remove null bytes and control characters (except newlines and tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    # Collapse 3+ consecutive newlines into 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Strip leading/trailing whitespace per line
    lines = [line.strip() for line in text.splitlines()]
    return "\n".join(lines).strip()
