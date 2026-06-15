"""
/retrieve — Vector Search API
───────────────────────────────
Semantic search over ChromaDB.
Node.js calls this instead of doing manual cosine similarity on embeddings.json.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.embedder     import embed
from services.vector_store import query, get_chunk_count

router = APIRouter()


class RetrieveRequest(BaseModel):
    query: str
    top_k: int = 5


@router.post("/")
def retrieve(req: RetrieveRequest):
    """
    Embed the query locally, search ChromaDB, return top-k chunks.
    This is the retrieval step of the RAG pipeline.
    """
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="query is required")

    if get_chunk_count() == 0:
        raise HTTPException(
            status_code=503,
            detail="Knowledge base is empty. Run: python scripts/ingest.py"
        )

    query_vector = embed(req.query)
    results      = query(query_vector, top_k=req.top_k)

    context = "\n\n---\n\n".join(
        f"[{r['metadata'].get('category', 'GENERAL').upper()}]\n{r['text']}"
        for r in results
    )

    return {
        "query":        req.query,
        "top_k":        req.top_k,
        "chunks_found": len(results),
        "total_indexed": get_chunk_count(),
        "context":      context,
        "results":      results,
    }


@router.get("/stats")
def stats():
    return {
        "total_chunks": get_chunk_count(),
        "status": "ready" if get_chunk_count() > 0 else "empty — run ingest.py",
    }
