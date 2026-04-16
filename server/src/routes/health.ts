import { Router } from 'express';
import { getChunkCount } from '../services/ragService';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const knowledgeChunks = getChunkCount();

  const hasAnthropic = process.env.ANTHROPIC_API_KEY?.startsWith('sk-') ?? false;
  const hasOpenAI    = process.env.OPENAI_API_KEY?.startsWith('sk-')    ?? false;

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    demoMode: !hasAnthropic && !hasOpenAI,
    services: {
      claude:          hasAnthropic,
      openai:          hasOpenAI,
      knowledgeBase:   knowledgeChunks > 0,
      knowledgeChunks,
    },
  });
});
