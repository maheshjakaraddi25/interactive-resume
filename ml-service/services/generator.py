"""
Generation Service — Fine-tuned GPT-2 (LoRA)
──────────────────────────────────────────────
Loads the LoRA-adapted GPT-2 model and generates answers.
Used in comparison mode: fine-tuned GPT-2 vs Claude via RAG+prompting.

Why the outputs will look different:
  Claude (RAG + prompting):
    - Modern 200B+ parameter model
    - Gets the retrieved context injected into the prompt
    - Coherent, fluent, detailed answers
    - "Prompting" — the model wasn't trained on Mahesh's data

  Fine-tuned GPT-2 (LoRA):
    - 124M parameter model from 2019
    - Knowledge baked in via fine-tuning, no retrieval needed
    - Shorter, simpler output (GPT-2's generation quality is lower)
    - "Fine-tuning" — the model was adapted on Mahesh's Q&A pairs

The comparison demonstrates the core trade-off:
  Fine-tuning: knowledge in weights, no retrieval needed, but expensive to update
  Prompting:   knowledge in context, easy to update, but requires retrieval system
"""

import os
import json
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer
from peft import PeftModel

MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models/gpt2-mahesh-lora")

_tokenizer = None
_model     = None
_meta      = None


def _load_model():
    global _tokenizer, _model, _meta

    if not os.path.exists(MODEL_DIR):
        raise RuntimeError(
            f"Fine-tuned model not found at {MODEL_DIR}. "
            "Run: python scripts/finetune.py"
        )

    if _model is None:
        print(f"[generator] Loading fine-tuned GPT-2 from {MODEL_DIR}...")
        _tokenizer = GPT2Tokenizer.from_pretrained(MODEL_DIR)
        _tokenizer.pad_token = _tokenizer.eos_token

        base_model = GPT2LMHeadModel.from_pretrained("gpt2")
        _model     = PeftModel.from_pretrained(base_model, MODEL_DIR)
        _model.eval()

        meta_path = os.path.join(MODEL_DIR, "training_meta.json")
        if os.path.exists(meta_path):
            with open(meta_path) as f:
                _meta = json.load(f)

        print("[generator] Fine-tuned GPT-2 loaded and ready")


def is_model_available() -> bool:
    return os.path.exists(MODEL_DIR)


def get_model_meta() -> dict:
    _load_model()
    return _meta or {}


def generate(prompt: str, max_new_tokens: int = 200, temperature: float = 0.7) -> str:
    """
    Generate a response from fine-tuned GPT-2.

    Format: "<question> ### <answer>"
    We provide the question prefix and let GPT-2 complete after "###"
    """
    _load_model()

    input_text = f"{prompt} ###"
    inputs     = _tokenizer(input_text, return_tensors="pt", truncation=True, max_length=300)

    with torch.no_grad():
        output_ids = _model.generate(
            inputs["input_ids"],
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            do_sample=True,
            top_p=0.9,
            top_k=50,
            pad_token_id=_tokenizer.eos_token_id,
            eos_token_id=_tokenizer.eos_token_id,
            repetition_penalty=1.2,  # reduce repetition (GPT-2 tends to loop)
        )

    full_text = _tokenizer.decode(output_ids[0], skip_special_tokens=True)

    # Extract only the completion (after "###")
    if "###" in full_text:
        completion = full_text.split("###", 1)[1].strip()
    else:
        completion = full_text[len(input_text):].strip()

    return completion
