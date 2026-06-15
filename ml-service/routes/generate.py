"""
/generate — Fine-tuned GPT-2 Generation API
──────────────────────────────────────────────
Serves responses from the LoRA fine-tuned GPT-2 model.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.generator import generate, is_model_available, get_model_meta

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 200
    temperature: float = 0.7


@router.post("/")
def generate_response(req: GenerateRequest):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="prompt is required")

    if not is_model_available():
        raise HTTPException(
            status_code=503,
            detail="Fine-tuned model not available. Run: python scripts/finetune.py"
        )

    response = generate(req.prompt, req.max_new_tokens, req.temperature)

    return {
        "prompt":   req.prompt,
        "response": response,
        "model":    "gpt2-mahesh-lora",
        "method":   "fine-tuning (LoRA)",
    }


@router.get("/status")
def model_status():
    available = is_model_available()
    meta      = get_model_meta() if available else {}

    return {
        "available": available,
        "model":     "gpt2-mahesh-lora",
        "meta":      meta,
        "message":   "ready" if available else "run python scripts/finetune.py to train",
    }
