# Mahesh's AI Resume — Setup Guide

A fully interactive AI-powered resume. Recruiters chat with an AI version of Mahesh in real-time, powered by Claude Sonnet or GPT-4o with RAG over a personal knowledge base.

---

## ⚡ Quick Start (5 steps)

### 1. Install dependencies
```bash
npm run install:all
```

### 2. Set up API keys
```bash
cp .env.example server/.env
# Edit server/.env and add your API keys
```

You need at least one of:
- `ANTHROPIC_API_KEY` — for Claude responses (get at console.anthropic.com)
- `OPENAI_API_KEY` — for GPT-4o responses AND for RAG embeddings

> **Note:** If you only have one key, the other model will show a friendly error message. The site still works with just one.

### 3. Generate the knowledge base embeddings
```bash
npm run ingest
```
This reads all markdown files from `knowledge-base/`, generates embeddings via OpenAI, and saves them to `knowledge-base/embeddings.json`. Run once. Re-run whenever you update your knowledge base files.

> **Skip this step?** The app still works — it uses a built-in fallback context. But RAG will make responses significantly more accurate and detailed.

### 4. Start the app
```bash
npm run dev
```
This starts both:
- React client at `http://localhost:3000`
- Express server at `http://localhost:5000`

### 5. Open your browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
ai-resume/
├── client/                  # React + TypeScript + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Resume/      # Left panel: all resume sections
│       │   └── Chat/        # Right panel: AI chat interface
│       ├── hooks/useChat.ts # Chat state + streaming logic
│       ├── services/api.ts  # Backend API calls
│       └── data/resumeData.ts # All resume content (edit this!)
│
├── server/                  # Node.js + Express backend
│   └── src/
│       ├── routes/chat.ts   # POST /api/chat — main endpoint
│       ├── services/
│       │   ├── claudeService.ts    # Anthropic streaming
│       │   ├── openaiService.ts    # OpenAI streaming
│       │   ├── ragService.ts       # Vector search
│       │   └── embeddingService.ts # Cosine similarity
│       └── scripts/ingest.ts # Run once to embed knowledge base
│
├── knowledge-base/          # Markdown files — edit these with your details!
│   ├── identity.md
│   ├── experience/
│   ├── projects/
│   ├── skills.md
│   ├── education.md
│   └── certifications.md
│
└── .env.example             # Copy to server/.env and add your keys
```

---

## 🧠 Updating Your Knowledge Base

Edit any `.md` files in `knowledge-base/`. Be specific — the more detail, the better the AI answers.

After editing, regenerate embeddings:
```bash
npm run ingest
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| AI (Claude) | Anthropic SDK — claude-sonnet-4-5 |
| AI (GPT-4o) | OpenAI SDK — gpt-4o |
| Embeddings | OpenAI text-embedding-3-small |
| RAG | File-based cosine similarity (no external DB needed) |

---

## 🔍 Health Check

```
GET http://localhost:5000/api/health
```

Returns which services are configured and how many knowledge chunks are loaded.

---

## 🚀 Ready to Deploy?

This is Phase 6 — deployment is the next milestone. Options:
- **Vercel** (frontend) + **Railway** (backend)
- **AWS** (EC2 or Lambda + S3 + CloudFront)
- **Azure** (App Service + Static Web Apps)
