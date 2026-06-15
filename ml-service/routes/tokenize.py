"""
/tokenize — Tokenization API
─────────────────────────────
Exposes tiktoken BPE tokenization over HTTP.
Node.js backend calls this before embedding any text.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.tokenizer import (
    tokenize,
    token_count,
    token_strings,
    truncate_to_limit,
    chunk_by_tokens,
    CONTEXT_WINDOWS,
)

router = APIRouter()


class TokenizeRequest(BaseModel):
    text: str
    model: str = "all-MiniLM-L6-v2"


class ChunkRequest(BaseModel):
    text: str
    chunk_size: int = 200
    overlap: int = 20
    model: str = "all-MiniLM-L6-v2"


@router.post("/")
def tokenize_text(req: TokenizeRequest):
    """
    Tokenize text and return token IDs, count, and visual breakdown.
    Use this to understand how BPE splits your knowledge base chunks.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    limit        = CONTEXT_WINDOWS.get(req.model, 512)
    ids          = tokenize(req.text)
    pieces       = token_strings(req.text)
    count        = len(ids)
    within_limit = count <= limit
    truncated    = truncate_to_limit(req.text, req.model) if not within_limit else req.text

    return {
        "token_count":    count,
        "context_window": limit,
        "within_limit":   within_limit,
        "utilization_pct": round(count / limit * 100, 1),
        "token_pieces":   pieces,       # visual: how BPE split your text
        "token_ids":      ids,
        "truncated_text": truncated,
        "encoding":       "cl100k_base",
        "model":          req.model,
    }


@router.post("/chunk")
def chunk_text(req: ChunkRequest):
    """
    Split text into token-bounded chunks with overlap.
    Returns each chunk with its token IDs and position in the original stream.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    chunks = chunk_by_tokens(req.text, req.chunk_size, req.overlap, req.model)

    return {
        "total_chunks": len(chunks),
        "chunk_size":   req.chunk_size,
        "overlap":      req.overlap,
        "model":        req.model,
        "chunks":       chunks,
    }


@router.get("/models")
def list_models():
    """Return known context window sizes per model."""
    return {"context_windows": CONTEXT_WINDOWS}
