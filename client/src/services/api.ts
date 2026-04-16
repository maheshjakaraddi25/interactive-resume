import type { AIModel, InterviewMode } from '../types';

const API_BASE = '/api';

export interface StreamCallbacks {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

/**
 * Streams a chat response from the backend using fetch + ReadableStream.
 * The server sends SSE-style lines: `data: {"text":"..."}` or `data: [DONE]`
 */
export async function streamChat(
  message: string,
  model: AIModel,
  mode: InterviewMode,
  history: { role: 'user' | 'assistant'; content: string }[],
  callbacks: StreamCallbacks
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, model, mode, history }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      callbacks.onError((errData as { error?: string }).error || `Server error: ${response.status}`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      callbacks.onError('No response body from server.');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last (potentially incomplete) line in the buffer
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();

        if (payload === '[DONE]') {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(payload) as { text?: string; error?: string };
          if (parsed.error) {
            callbacks.onError(parsed.error);
            return;
          }
          if (parsed.text) {
            callbacks.onToken(parsed.text);
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }
    }

    callbacks.onDone();
  } catch (err) {
    callbacks.onError(err instanceof Error ? err.message : 'Unknown error occurred.');
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
