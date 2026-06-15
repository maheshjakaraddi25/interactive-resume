"""
/embed — Embedding API
───────────────────────
Returns local 384-dim vectors from sentence-transformers.
No OpenAI API call. No network. No cost.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.embedder import embed, embed_batch, cosine_similarity, EMBEDDING_DIM, MODEL_NAME

router = APIRouter()


class EmbedRequest(BaseModel):
    text: str


class EmbedBatchRequest(BaseModel):
    texts: list[str]


class SimilarityRequest(BaseModel):
    text_a: str
    text_b: str


@router.post("/")
def embed_text(req: EmbedRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    vector = embed(req.text)

    return {
        "text":          req.text,
        "embedding":     vector,
        "dimensions":    EMBEDDING_DIM,
        "model":         MODEL_NAME,
        "normalized":    True,
    }


@router.post("/batch")
def embed_texts(req: EmbedBatchRequest):
    if not req.texts:
        raise HTTPException(status_code=400, detail="texts list is required")

    vectors = embed_batch(req.texts)

    return {
        "count":      len(vectors),
        "dimensions": EMBEDDING_DIM,
        "model":      MODEL_NAME,
        "embeddings": [
            {"text": t, "embedding": v}
            for t, v in zip(req.texts, vectors)
        ],
    }


@router.post("/similarity")
def similarity(req: SimilarityRequest):
    """
    Compute cosine similarity between two texts.
    Useful for testing retrieval quality — are semantically similar
    texts actually close in vector space?
    """
    vec_a = embed(req.text_a)
    vec_b = embed(req.text_b)
    score = cosine_similarity(vec_a, vec_b)

    return {
        "text_a":     req.text_a,
        "text_b":     req.text_b,
        "similarity": round(score, 4),
        "model":      MODEL_NAME,
        "interpretation": (
            "very similar"   if score > 0.85 else
            "related"        if score > 0.60 else
            "loosely related" if score > 0.40 else
            "unrelated"
        ),
    }
