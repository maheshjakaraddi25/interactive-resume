"""
Knowledge Base Ingest Script
─────────────────────────────
Replaces: server/src/scripts/ingest.ts

Old approach:
  - Chunked by word count (imprecise)
  - Called OpenAI embedding API (network, cost, black box)
  - Stored in embeddings.json (flat file, no index)
  - Manual cosine similarity on every query (O(n) brute force)

New approach:
  - Chunks by TOKEN count via tiktoken (exact, model-aware)
  - Embeds locally via sentence-transformers (no API, no cost)
  - Stores in ChromaDB (HNSW index, O(log n) query)

Run from project root:
  cd ml-service && python scripts/ingest.py
"""

import sys
import os

# Make sure service modules are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import glob
from services.tokenizer    import chunk_by_tokens
from services.embedder     import embed_batch, load_embedding_model
from services.vector_store import init_vector_store, upsert_chunks, clear_collection, get_chunk_count

KB_DIR = os.path.join(os.path.dirname(__file__), "../../knowledge-base")


def get_category(filepath: str) -> str:
    """Derive category from file path e.g. experience/daimler.md → experience"""
    rel   = os.path.relpath(filepath, KB_DIR)
    parts = rel.replace("\\", "/").split("/")
    return parts[0] if len(parts) > 1 else os.path.splitext(parts[0])[0]


def read_markdown_files() -> list[dict]:
    pattern = os.path.join(KB_DIR, "**", "*.md")
    files   = glob.glob(pattern, recursive=True)
    results = []
    for fp in sorted(files):
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read()
        results.append({
            "filepath": fp,
            "content":  content,
            "source":   os.path.relpath(fp, KB_DIR).replace("\\", "/"),
            "category": get_category(fp),
        })
    return results


def ingest():
    print("\n[ingest] Starting knowledge base ingestion")
    print("[ingest] Loading models...")

    load_embedding_model()
    init_vector_store()

    print("\n[ingest] Clearing existing collection for fresh ingest...")
    clear_collection()

    files = read_markdown_files()
    print(f"[ingest] Found {len(files)} markdown files in {KB_DIR}\n")

    all_chunks = []
    chunk_idx  = 0

    for file in files:
        # Token-based chunking: chunk_size=200 tokens, overlap=20 tokens
        # all-MiniLM-L6-v2 has a 256-token context window
        # 200-token chunks leave room for the overlap and stay within limit
        raw_chunks = chunk_by_tokens(file["content"], chunk_size=200, overlap=20)
        print(f"  {file['source']:40s} → {len(raw_chunks)} chunks")

        for chunk in raw_chunks:
            if len(chunk["text"].strip()) < 20:
                continue  # skip near-empty chunks

            all_chunks.append({
                "id":        f"chunk-{chunk_idx}",
                "text":      chunk["text"],
                "metadata": {
                    "source":      file["source"],
                    "category":    file["category"],
                    "token_count": chunk["token_count"],
                    "start_token": chunk["start_token"],
                    "end_token":   chunk["end_token"],
                },
            })
            chunk_idx += 1

    print(f"\n[ingest] Total chunks to embed: {len(all_chunks)}")
    print("[ingest] Generating local embeddings (all-MiniLM-L6-v2)...")

    # Batch embed all chunks in one pass — efficient
    texts      = [c["text"] for c in all_chunks]
    embeddings = embed_batch(texts)

    for chunk, embedding in zip(all_chunks, embeddings):
        chunk["embedding"] = embedding

    print("[ingest] Storing in ChromaDB...")
    count = upsert_chunks(all_chunks)

    print(f"\n[ingest] Done. {count} chunks indexed in ChromaDB.")
    print(f"[ingest] Total in collection: {get_chunk_count()}")
    print("[ingest] Start the ML service: uvicorn main:app --reload --port 8000\n")


if __name__ == "__main__":
    ingest()
