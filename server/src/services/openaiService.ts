import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MessageParam = { role: 'user' | 'assistant'; content: string };

export async function streamOpenAI(
  systemPrompt: string,
  history: MessageParam[],
  userMessage: string,
  onToken: (text: string) => void
): Promise<void> {
  if (!process.env.OPENAI_API_KEY) {
    onToken("⚠️ OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.");
    return;
  }

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user',   content: userMessage },
  ];

  const stream = await client.chat.completions.create({
    model:       'gpt-4o',
    max_tokens:  1024,
    temperature: 0.7,
    stream:      true,
    messages,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) onToken(token);
  }
}
