import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { chatRouter } from './routes/chat';
import { healthRouter } from './routes/health';
import { loadChunks } from './services/ragService';

const app  = express();
const PORT = process.env.PORT || 5001; // 5000 is reserved by macOS AirPlay

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json({ limit: '2mb' }));

// Rate limiting — 60 requests per minute per IP
app.use('/api/chat', rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/chat',   chatRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Boot ────────────────────────────────────────────────────────────────────
async function main() {
  // Load knowledge base embeddings into memory
  loadChunks();

  app.listen(PORT, () => {
    console.log(`\n🚀 AI Resume server running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Chat:   POST http://localhost:${PORT}/api/chat`);
    console.log(`\n   Model support: Claude Sonnet 3.5 · GPT-4o`);
  });
}

main().catch(console.error);
