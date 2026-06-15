/**
 * ML Service Client
 * ──────────────────
 * HTTP client for the Python FastAPI ML service (port 8000).
 * Node.js backend delegates all ML operations here:
 *   - Retrieval (replaces ragService + embeddingService)
 *   - Fine-tuned generation (GPT-2 LoRA)
 *   - Tokenization info
 *   - Attention weights
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function mlFetch<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${ML_SERVICE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`ML service error (${res.status}): ${err.detail || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function mlGet<T>(path: string): Promise<T> {
  const res = await fetch(`${ML_SERVICE_URL}${path}`);
  if (!res.ok) throw new Error(`ML service error: ${res.statusText}`);
  return res.json() as Promise<T>;
}

// ── Retrieval (RAG) ───────────────────────────────────────────────────────────

export async function retrieveContext(query: string, topK = 5): Promise<string> {
  const data = await mlFetch<{ context: string }>('/retrieve', { query, top_k: topK });
  return data.context;
}

// ── Fine-tuned generation (GPT-2 LoRA) ───────────────────────────────────────

export async function generateFineTuned(
  prompt: string,
  maxNewTokens = 200,
  temperature  = 0.7,
): Promise<{ response: string; model: string; method: string }> {
  return mlFetch('/generate', {
    prompt,
    max_new_tokens: maxNewTokens,
    temperature,
  });
}

export async function getGeneratorStatus(): Promise<{ available: boolean; meta: object }> {
  return mlGet('/generate/status');
}

// ── Tokenization ──────────────────────────────────────────────────────────────

export async function tokenizeText(text: string, model = 'all-MiniLM-L6-v2') {
  return mlFetch('/tokenize', { text, model });
}

// ── Attention ─────────────────────────────────────────────────────────────────

export async function getAttention(text: string) {
  return mlFetch('/attention', { text });
}

// ── Health ────────────────────────────────────────────────────────────────────

export async function isMlServiceHealthy(): Promise<boolean> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
