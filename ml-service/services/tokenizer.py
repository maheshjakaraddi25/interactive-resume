"""
Tokenization Service — tiktoken BPE
─────────────────────────────────────
Uses OpenAI's tiktoken library with cl100k_base encoding.

WHY cl100k_base?
  Same encoding used by GPT-4, GPT-3.5-turbo, and text-embedding-3-small.
  BPE (Byte Pair Encoding) — starts with characters, merges frequent pairs
  into subword tokens. Vocabulary size: ~100,277 tokens.

WHY NOT word-based tokenization?
  Word tokenizers break on unknown words ("Kubernetes" → unknown token).
  BPE handles rare words by breaking them into subword pieces
  ("Kubernetes" → "Kube" + "rn" + "etes") — no unknowns, ever.

WHY NOT character-based?
  Too many tokens per sentence → blows context window fast.
  BPE is the sweet spot: compact, no unknowns, subword-aware.

Context window limits (for reference):
  text-embedding-3-small : 8,191 tokens
  GPT-4o                 : 128,000 tokens
  GPT-2 small            : 1,024 tokens  ← our fine-tune target
  all-MiniLM-L6-v2       : 256 tokens    ← our local embedding model
"""

import tiktoken

# cl100k_base: used by GPT-4, GPT-3.5, text-embedding-3-small
ENCODING_NAME = "cl100k_base"

# Context window limits by model
CONTEXT_WINDOWS = {
    "text-embedding-3-small": 8_191,
    "gpt-4o":                128_000,
    "gpt-2":                   1_024,
    "all-MiniLM-L6-v2":          256,
}

_enc: tiktoken.Encoding | None = None


def get_encoder() -> tiktoken.Encoding:
    global _enc
    if _enc is None:
        _enc = tiktoken.get_encoding(ENCODING_NAME)
    return _enc


def tokenize(text: str) -> list[int]:
    """Encode text → list of integer token IDs."""
    return get_encoder().encode(text)


def decode(token_ids: list[int]) -> str:
    """Decode token IDs back to text."""
    return get_encoder().decode(token_ids)


def token_count(text: str) -> int:
    return len(tokenize(text))


def token_strings(text: str) -> list[str]:
    """
    Return each token as its decoded string piece.
    Useful for visualizing how BPE splits a word.
    e.g. "Kubernetes" → ["Kube", "rn", "etes"]
    """
    enc = get_encoder()
    ids = enc.encode(text)
    return [enc.decode([tid]) for tid in ids]


def truncate_to_limit(text: str, model: str = "all-MiniLM-L6-v2") -> str:
    """
    Truncate text to the model's context window limit.
    Returns the longest prefix that fits within the token budget.
    """
    limit = CONTEXT_WINDOWS.get(model, 512)
    enc   = get_encoder()
    ids   = enc.encode(text)
    if len(ids) <= limit:
        return text
    return enc.decode(ids[:limit])


def chunk_by_tokens(
    text: str,
    chunk_size: int = 200,
    overlap: int = 20,
    model: str = "all-MiniLM-L6-v2",
) -> list[dict]:
    """
    Chunk text by token count rather than word count.

    WHY token-based chunking over word-based?
      Word count is a proxy. Token count is exact — models think in tokens,
      not words. "Kubernetes" is 3 tokens; "a" is 1. Token-based chunking
      guarantees every chunk fits within the model's context window.

    Args:
        chunk_size: max tokens per chunk (default 200, fits all-MiniLM-L6-v2's 256 limit)
        overlap:    token overlap between consecutive chunks (context continuity)
        model:      enforce this model's context window as a hard cap

    Returns list of dicts: {text, token_ids, token_count, start_token, end_token}
    """
    limit  = CONTEXT_WINDOWS.get(model, 512)
    size   = min(chunk_size, limit)
    enc    = get_encoder()
    ids    = enc.encode(text)
    chunks = []

    i = 0
    while i < len(ids):
        chunk_ids = ids[i : i + size]
        chunk_text = enc.decode(chunk_ids)
        chunks.append({
            "text":        chunk_text,
            "token_ids":   chunk_ids,
            "token_count": len(chunk_ids),
            "start_token": i,
            "end_token":   i + len(chunk_ids),
        })
        i += size - overlap

    return chunks
