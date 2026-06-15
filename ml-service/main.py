"""
ML Service — FastAPI
────────────────────
Owns all ML operations for the Interactive Resume:
  - Tokenization   (tiktoken BPE)
  - Embeddings     (sentence-transformers, local)
  - Vector search  (ChromaDB)
  - Attention viz  (HuggingFace transformer internals)
  - Generation     (fine-tuned GPT-2 via LoRA)

Runs at http://localhost:8000
Node.js Express backend calls this service over HTTP.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.tokenize  import router as tokenize_router
from routes.embed     import router as embed_router
from routes.retrieve  import router as retrieve_router
from routes.attention import router as attention_router
from routes.generate  import router as generate_router
from services.embedder     import load_embedding_model
from services.vector_store import init_vector_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load heavy models once at startup, not on every request.
    Industry pattern: warm the model before serving traffic.
    """
    print("\n[ml-service] Starting up...")
    print("[ml-service] Loading embedding model (all-MiniLM-L6-v2)...")
    load_embedding_model()
    print("[ml-service] Initialising ChromaDB vector store...")
    init_vector_store()
    print("[ml-service] Ready.\n")
    yield
    print("[ml-service] Shutting down.")


app = FastAPI(
    title="Interactive Resume — ML Service",
    description="Local ML pipeline: tokenization, embeddings, vector search, attention, fine-tuned generation",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5001"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(tokenize_router,  prefix="/tokenize",  tags=["Tokenization"])
app.include_router(embed_router,     prefix="/embed",      tags=["Embeddings"])
app.include_router(retrieve_router,  prefix="/retrieve",   tags=["Vector Search"])
app.include_router(attention_router, prefix="/attention",  tags=["Attention"])
app.include_router(generate_router,  prefix="/generate",   tags=["Generation"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service", "version": "2.0.0"}
