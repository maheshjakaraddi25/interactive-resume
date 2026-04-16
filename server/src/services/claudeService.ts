import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type MessageParam = { role: 'user' | 'assistant'; content: string };

export async function streamClaude(
  systemPrompt: string,
  history: MessageParam[],
  userMessage: string,
  onToken: (text: string) => void
): Promise<void> {
  if (!process.env.ANTHROPIC_API_KEY) {
    onToken("⚠️ Claude API key not configured. Please add ANTHROPIC_API_KEY to your .env file.");
    return;
  }

  const messages: MessageParam[] = [
    ...history,
    { role: 'user', content: userMessage },
  ];

  const stream = await client.messages.stream({
    model:      'claude-sonnet-4-5',
    max_tokens: 1024,
    system:     systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (
      event.type === 'content_block_delta' &&
      event.delta.type === 'text_delta'
    ) {
      onToken(event.delta.text);
    }
  }
}
