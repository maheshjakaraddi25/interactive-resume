"""
Training Data Generation
──────────────────────────
GPT-2 fine-tuning needs Q&A pairs about Mahesh.
The knowledge base (~6 files) is too small to fine-tune directly.

Strategy:
  1. Read all markdown files from knowledge-base/
  2. Use Claude (via API) to generate diverse Q&A pairs per file
  3. Save as JSONL → used by finetune.py

WHY generate training data with an LLM?
  Real fine-tuning datasets need hundreds of examples.
  Writing 150 Q&A pairs manually takes hours.
  Using Claude to generate them from source documents is standard practice —
  it's how companies like Anthropic, OpenAI, and Google generate synthetic
  training data for smaller models (student-teacher distillation).

Output format: data/training_data.jsonl
  Each line: {"prompt": "...", "completion": "..."}

Run: python scripts/generate_training_data.py
Requires: ANTHROPIC_API_KEY in ml-service/.env
"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import json
import glob
import anthropic
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../.env"))

KB_DIR   = os.path.join(os.path.dirname(__file__), "../../knowledge-base")
OUT_DIR  = os.path.join(os.path.dirname(__file__), "../data")
OUT_FILE = os.path.join(OUT_DIR, "training_data.jsonl")

QUESTIONS_PER_FILE = 25  # ~150 total across 6 files


GENERATION_PROMPT = """You are generating training data to fine-tune a small language model (GPT-2)
to answer questions about Mahesh P Jakaraddi based on the following document.

Generate exactly {n} diverse question-answer pairs. Cover different aspects and question styles:
- Direct factual questions ("What technology did Mahesh use for X?")
- Conversational questions ("Tell me about Mahesh's experience with Y")
- Technical deep-dives ("How did Mahesh approach Z?")
- Background questions ("Where did Mahesh work?")

DOCUMENT:
{content}

Output a JSON array of objects with "prompt" and "completion" keys.
"prompt" should be a natural interview-style question.
"completion" should be a 1-3 sentence answer in first person as Mahesh ("I...", "My...").
Keep completions factual — only use information from the document above.

JSON array only, no other text:"""


def read_files() -> list[dict]:
    files = glob.glob(os.path.join(KB_DIR, "**", "*.md"), recursive=True)
    results = []
    for fp in sorted(files):
        with open(fp, "r", encoding="utf-8") as f:
            content = f.read().strip()
        if len(content) > 50:
            results.append({
                "path":    fp,
                "name":    os.path.relpath(fp, KB_DIR),
                "content": content,
            })
    return results


def generate_qa_pairs(client: anthropic.Anthropic, content: str, n: int) -> list[dict]:
    prompt = GENERATION_PROMPT.format(content=content, n=n)

    message = client.messages.create(
        model="claude-3-5-haiku-20241022",  # cheap + fast for data generation
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    pairs = json.loads(raw)
    return pairs if isinstance(pairs, list) else []


def generate():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY not set in ml-service/.env")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=api_key)
    files  = read_files()

    print(f"\n[data-gen] Found {len(files)} knowledge base files")
    print(f"[data-gen] Generating ~{QUESTIONS_PER_FILE} Q&A pairs per file...\n")

    os.makedirs(OUT_DIR, exist_ok=True)

    all_pairs = []
    for file in files:
        print(f"  Processing: {file['name']}")
        try:
            pairs = generate_qa_pairs(client, file["content"], QUESTIONS_PER_FILE)
            print(f"    Generated {len(pairs)} pairs")
            all_pairs.extend(pairs)
        except Exception as e:
            print(f"    ERROR: {e}")

    # Write JSONL
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        for pair in all_pairs:
            if "prompt" in pair and "completion" in pair:
                f.write(json.dumps(pair) + "\n")

    print(f"\n[data-gen] Done. {len(all_pairs)} Q&A pairs → {OUT_FILE}")


if __name__ == "__main__":
    generate()
