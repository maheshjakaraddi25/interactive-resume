"""
Embedding Service — sentence-transformers (local)
──────────────────────────────────────────────────
Model: all-MiniLM-L6-v2
  Architecture : MiniLM (distilled BERT) — 6 transformer layers, 12 attention heads
  Parameters   : ~22 million
  Output dims  : 384
  Max tokens   : 256 (we enforce this via tokenizer.truncate_to_limit)
  Trained for  : semantic textual similarity via contrastive learning

WHY all-MiniLM-L6-v2 over text-embedding-3-small?
  text-embedding-3-small (OpenAI):
    + 1536-dim vectors (higher capacity)
    + Slightly better accuracy on benchmarks
    - API call required (latency, cost, no offline use)
    - You don't own the model

  all-MiniLM-L6-v2 (local):
    + Runs on CPU, no GPU needed
    + Free, no API key
    + You control the model — portable, auditable
    + Good enough for a personal knowledge base (small corpus)
    - 384-dim (lower capacity, but fine for <100 chunks)
    - Slightly lower accuracy on large-scale benchmarks

WHY NOT use a larger local model (e.g. all-mpnet-base-v2, 768-dim)?
  all-MiniLM-L6-v2 loads in ~1 second on CPU.
  all-mpnet-base-v2 is 4x slower to load and run.
  For a portfolio project with <100 chunks, speed wins.

INDUSTRY CONTEXT:
  In production, teams run embedding models on GPU inference servers
  (Triton, TorchServe, vLLM). For a portfolio, in-process is fine.
"""

from sentence_transformers import SentenceTransformer
import numpy as np

from services.tokenizer import truncate_to_limit

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

_model: SentenceTransformer | None = None


def load_embedding_model() -> None:
    """
    Load model into memory at startup.
    First run downloads (~90MB) to ~/.cache/huggingface/
    Subsequent runs load from cache — fast.
    """
    global _model
    if _model is None:
        _model = SentenceTransformer(MODEL_NAME)
        print(f"[embedder] Loaded {MODEL_NAME} — output dim: {EMBEDDING_DIM}")


def get_model() -> SentenceTransformer:
    if _model is None:
        load_embedding_model()
    return _model


def embed(text: str) -> list[float]:
    """
    Embed a single text string → 384-dimensional float vector.

    Steps:
    1. Truncate to 256 tokens (all-MiniLM-L6-v2's context window)
    2. Run through transformer layers (attention → pooling)
    3. Return mean-pooled CLS representation as a flat list
    """
    safe_text = truncate_to_limit(text, model="all-MiniLM-L6-v2")
    vector    = get_model().encode(safe_text, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    """
    Embed multiple texts in one forward pass — more efficient than looping.
    sentence-transformers handles batching internally.
    """
    safe_texts = [truncate_to_limit(t, model="all-MiniLM-L6-v2") for t in texts]
    vectors    = get_model().encode(safe_texts, normalize_embeddings=True, batch_size=32)
    return vectors.tolist()


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """
    Cosine similarity between two L2-normalized vectors.
    Since we normalize embeddings on output, this reduces to a dot product.
    cos(θ) = (a · b) / (|a| |b|)  →  a · b  when both are unit vectors.
    """
    va = np.array(a)
    vb = np.array(b)
    denom = np.linalg.norm(va) * np.linalg.norm(vb)
    if denom == 0:
        return 0.0
    return float(np.dot(va, vb) / denom)
