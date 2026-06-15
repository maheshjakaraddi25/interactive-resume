"""
Vector Store Service — ChromaDB
─────────────────────────────────
Replaces: knowledge-base/embeddings.json + manual cosine similarity loop

ChromaDB internals:
  - Index type : HNSW (Hierarchical Navigable Small World graph)
  - Query time : O(log n) approximate nearest neighbour vs O(n) brute force
  - Storage    : persistent on disk at ./chroma_store/
  - Distance   : cosine similarity (we use normalized embeddings)

WHY ChromaDB over alternatives?

  Pinecone   — managed SaaS, API key required, data leaves your machine, paid
  Weaviate   — self-hosted, heavy (needs Docker + separate process), GraphQL API
  Qdrant     — self-hosted, Rust-based, excellent for production, overkill here
  FAISS      — Meta's library, C++ backed, no persistence out of box, lower-level
  ChromaDB   — embedded in-process, persistent, Python-native, zero infra needed
               → correct choice for portfolio/demo with <10k chunks

HNSW explained simply:
  Imagine organizing vectors as a multi-layer graph.
  Top layers: few nodes, long-range connections (fast rough search)
  Bottom layers: all nodes, short-range connections (precise local search)
  Query: enter at top, follow closest neighbours downward → find approximate
  nearest neighbours in O(log n) instead of scanning all O(n) vectors.
"""

import os
import chromadb
from chromadb.config import Settings

COLLECTION_NAME = "resume_knowledge_base"
PERSIST_DIR     = os.path.join(os.path.dirname(__file__), "../chroma_store")

_client:     chromadb.PersistentClient | None = None
_collection: chromadb.Collection | None = None


def init_vector_store() -> None:
    """
    Initialise ChromaDB client and get/create collection.
    Called once at FastAPI startup.
    """
    global _client, _collection

    _client = chromadb.PersistentClient(
        path=PERSIST_DIR,
        settings=Settings(anonymized_telemetry=False),
    )

    _collection = _client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},  # use cosine distance for similarity
    )

    count = _collection.count()
    print(f"[vector_store] Collection '{COLLECTION_NAME}' — {count} chunks indexed")


def get_collection() -> chromadb.Collection:
    if _collection is None:
        raise RuntimeError("Vector store not initialised. Call init_vector_store() first.")
    return _collection


def upsert_chunks(chunks: list[dict]) -> int:
    """
    Insert or update chunks in ChromaDB.

    Each chunk: {id, text, embedding, metadata}
    ChromaDB stores: embedding vector + document text + metadata dict
    Returns count of chunks upserted.
    """
    col = get_collection()

    ids        = [c["id"]        for c in chunks]
    embeddings = [c["embedding"] for c in chunks]
    documents  = [c["text"]      for c in chunks]
    metadatas  = [c["metadata"]  for c in chunks]

    col.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=documents,
        metadatas=metadatas,
    )
    return len(chunks)


def query(query_embedding: list[float], top_k: int = 5) -> list[dict]:
    """
    Semantic search: find top-k most similar chunks to the query vector.

    ChromaDB runs HNSW approximate nearest neighbour search internally.
    Returns chunks sorted by relevance (highest similarity first).
    """
    col     = get_collection()
    results = col.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, col.count() or 1),
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    for i, doc in enumerate(results["documents"][0]):
        distance = results["distances"][0][i]
        # ChromaDB cosine distance = 1 - cosine_similarity
        similarity = round(1 - distance, 4)
        chunks.append({
            "id":         results["ids"][0][i],
            "text":       doc,
            "metadata":   results["metadatas"][0][i],
            "similarity": similarity,
        })

    return chunks


def get_chunk_count() -> int:
    return get_collection().count()


def clear_collection() -> None:
    """Delete all documents from the collection (for re-ingestion)."""
    col = get_collection()
    if col.count() > 0:
        all_ids = col.get()["ids"]
        col.delete(ids=all_ids)
    print(f"[vector_store] Collection cleared")
