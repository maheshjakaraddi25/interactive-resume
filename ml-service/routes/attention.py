"""
/attention — Attention Visualization API
──────────────────────────────────────────
Returns per-token attention scores from the transformer model.
The React frontend uses this to highlight which tokens mattered most.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.attention import extract_attention

router = APIRouter()


class AttentionRequest(BaseModel):
    text: str


@router.post("/")
def get_attention(req: AttentionRequest):
    """
    Extract attention weights for the given text.
    Returns token-level importance scores for visualization.
    """
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    if len(req.text) > 2000:
        raise HTTPException(status_code=400, detail="text too long — max 2000 chars")

    result = extract_attention(req.text)
    return result
