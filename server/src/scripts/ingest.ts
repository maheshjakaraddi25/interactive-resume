/**
 * Knowledge Base Ingest Script
 * ────────────────────────────
 * Reads all markdown files from knowledge-base/, chunks them,
 * generates OpenAI embeddings, and saves to knowledge-base/embeddings.json
 *
 * Run: npm run ingest   (from project root)
 * Or:  cd server && npx ts-node src/scripts/ingest.ts
 */

import 'dotenv/config';
import fs   from 'fs';
import path from 'path';
import OpenAI from 'openai';
import type { KnowledgeChunk } from '../services/ragService';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const KB_DIR  = path.resolve(__dirname, '../../../knowledge-base');
const OUT_PATH = path.join(KB_DIR, 'embeddings.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCategoryFromPath(filePath: string): string {
  const rel  = path.relative(KB_DIR, filePath);
  const parts = rel.split(path.sep);
  if (parts.length === 1) return path.basename(parts[0], '.md');
  return parts[0]; // e.g. "experience", "projects"
}

function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
  const words  = text.split(/\s+/);
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ').trim();
    if (chunk.length > 50) chunks.push(chunk);
  }

  return chunks;
}

function readMarkdownFiles(dir: string): { filePath: string; content: string }[] {
  const results: { filePath: string; content: string }[] = [];

  const walk = (currentDir: string) => {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        results.push({ filePath: fullPath, content });
      }
    }
  };

  walk(dir);
  return results;
}

async function getEmbedding(text: string): Promise<number[]> {
  const res = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.slice(0, 8000),
  });
  return res.data[0].embedding;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function ingest() {
  console.log('\n🔍 Reading knowledge base...');

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set. Add it to your .env file.');
    process.exit(1);
  }

  const files = readMarkdownFiles(KB_DIR);
  console.log(`   Found ${files.length} markdown files`);

  const allChunks: KnowledgeChunk[] = [];
  let chunkIndex = 0;

  for (const { filePath, content } of files) {
    const category = getCategoryFromPath(filePath);
    const source   = path.relative(KB_DIR, filePath);
    const rawChunks = chunkText(content);

    console.log(`\n📄 ${source}  →  ${rawChunks.length} chunk(s)`);

    for (const chunk of rawChunks) {
      process.stdout.write(`   Embedding chunk ${chunkIndex + 1}...`);

      try {
        const embedding = await getEmbedding(chunk);

        allChunks.push({
          id: `chunk-${chunkIndex}`,
          content: chunk,
          metadata: { source, category },
          embedding,
        });

        process.stdout.write(' ✓\n');
        chunkIndex++;

        // Small delay to respect OpenAI rate limits
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (err) {
        console.error(`\n   ❌ Failed to embed chunk: ${err}`);
      }
    }
  }

  // Write to disk
  fs.writeFileSync(OUT_PATH, JSON.stringify(allChunks, null, 2), 'utf-8');

  console.log(`\n✅ Ingestion complete!`);
  console.log(`   Total chunks embedded: ${allChunks.length}`);
  console.log(`   Saved to: ${OUT_PATH}`);
  console.log('\n🚀 You can now start the server: npm run dev\n');
}

ingest().catch(err => {
  console.error('\n❌ Ingest failed:', err);
  process.exit(1);
});
