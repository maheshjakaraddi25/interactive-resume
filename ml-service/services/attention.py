"""
Attention Extraction Service
──────────────────────────────
Extracts attention weights from all-MiniLM-L6-v2's transformer layers.

TRANSFORMER ATTENTION — how it works:
  Each transformer layer has multiple "attention heads".
  Each head computes: Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V
  where Q=query, K=key, V=value are linear projections of the input tokens.

  The softmax output is an (n_tokens × n_tokens) matrix — for each token,
  how much it "attends to" every other token. High score = strong relationship.

all-MiniLM-L6-v2 architecture:
  Layers       : 6 transformer layers
  Heads/layer  : 12 attention heads
  Hidden dim   : 384
  Total params : ~22M

What we extract:
  attention tensor shape: (n_layers=6, n_heads=12, n_tokens, n_tokens)
  We average across all layers and heads → one score per token pair.
  Then sum each token's outgoing attention → "importance score" per token.

Why is this useful?
  It shows WHICH tokens the model focused on when processing your text.
  "Tell me about Mahesh's Kubernetes experience" →
    "Kubernetes" and "experience" should have high attention scores.
  This is a real interpretability technique used in NLP research.

Limitation: Attention ≠ Explanation
  High attention doesn't always mean causal importance.
  But it's a useful proxy and the standard way to visualize transformers.
"""

import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

_tokenizer = None
_model     = None


def _load_attention_model():
    global _tokenizer, _model
    if _model is None:
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model     = AutoModel.from_pretrained(
            MODEL_NAME,
            output_attentions=True,  # expose attention weights
        )
        _model.eval()
        print(f"[attention] Loaded {MODEL_NAME} with attention output enabled")


def extract_attention(text: str) -> dict:
    """
    Run text through transformer, extract and aggregate attention weights.

    Returns:
      tokens       : list of token strings (how BPE split the input)
      token_ids    : integer IDs
      attention_scores : per-token importance (averaged across all layers+heads)
      layer_attention  : per-layer attention matrices (for detailed visualization)
      model_info   : architecture details
    """
    _load_attention_model()

    # Tokenize
    inputs = _tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=256,
        padding=False,
    )

    token_ids = inputs["input_ids"][0].tolist()
    tokens    = [_tokenizer.decode([tid]) for tid in token_ids]

    # Forward pass — no gradient needed for inference
    with torch.no_grad():
        outputs = _model(**inputs)

    # outputs.attentions: tuple of (n_layers) tensors
    # each tensor shape: (batch=1, n_heads=12, seq_len, seq_len)
    attentions = outputs.attentions  # tuple of 6 tensors

    n_layers = len(attentions)
    n_heads  = attentions[0].shape[1]
    seq_len  = attentions[0].shape[2]

    # Stack → (n_layers, n_heads, seq_len, seq_len)
    stacked = torch.stack(attentions, dim=0).squeeze(1)  # remove batch dim

    # Average across all layers and heads → (seq_len, seq_len)
    avg_attention = stacked.mean(dim=(0, 1)).numpy()

    # Per-token importance: sum of attention each token receives
    # (column sum of attention matrix = how much other tokens attend TO this token)
    token_importance = avg_attention.sum(axis=0).tolist()

    # Normalize to [0, 1] for visualization
    max_score = max(token_importance) or 1.0
    normalized = [round(s / max_score, 4) for s in token_importance]

    # Per-layer attention (averaged across heads) for detailed viz
    layer_data = []
    for layer_idx in range(n_layers):
        layer_attn = stacked[layer_idx].mean(dim=0).numpy()  # avg over heads
        layer_data.append({
            "layer":     layer_idx,
            "attention": layer_attn.tolist(),  # (seq_len, seq_len) matrix
        })

    return {
        "text":              text,
        "tokens":            tokens,
        "token_ids":         token_ids,
        "token_count":       seq_len,
        "attention_scores":  normalized,     # per-token importance [0,1]
        "raw_scores":        token_importance,
        "layer_attention":   layer_data,     # full per-layer matrices
        "model_info": {
            "name":       MODEL_NAME,
            "n_layers":   n_layers,
            "n_heads":    n_heads,
            "hidden_dim": 384,
        },
    }
