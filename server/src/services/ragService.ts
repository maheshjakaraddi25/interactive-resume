import fs   from 'fs';
import path from 'path';
import { getEmbedding, cosineSimilarity } from './embeddingService';

export interface KnowledgeChunk {
  id:       string;
  content:  string;
  metadata: {
    source:   string;
    category: string;
  };
  embedding: number[];
}

// In-memory store — loaded once at server startup
let chunks: KnowledgeChunk[] = [];

const EMBEDDINGS_PATH = path.resolve(__dirname, '../../../knowledge-base/embeddings.json');

/**
 * Load pre-computed embeddings from disk into memory.
 * Call this once during server startup.
 */
export function loadChunks(): void {
  if (!fs.existsSync(EMBEDDINGS_PATH)) {
    console.warn(
      '\n⚠️  No embeddings found at knowledge-base/embeddings.json'
      + '\n   Run: npm run ingest   (from the project root)'
      + '\n   The AI will use a fallback context until you do.\n'
    );
    return;
  }

  try {
    chunks = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8')) as KnowledgeChunk[];
    console.log(`✅ Loaded ${chunks.length} knowledge chunks into memory`);
  } catch (err) {
    console.error('❌ Failed to parse embeddings.json:', err);
  }
}

export function getChunkCount(): number {
  return chunks.length;
}

/**
 * Find the top-K most relevant knowledge chunks for a given query.
 * Falls back to returning all content joined if embeddings aren't loaded.
 */
export async function search(query: string, topK = 5): Promise<string> {
  // Fallback: no embeddings yet — return all raw content
  if (chunks.length === 0) {
    return getFallbackContext();
  }

  let queryEmbedding: number[];
  try {
    queryEmbedding = await getEmbedding(query);
  } catch {
    // If embedding call fails (e.g., no OpenAI key), return fallback
    return getFallbackContext();
  }

  const scored = chunks
    .map(chunk => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored
    .map(c => `[${c.metadata.category.toUpperCase()}]\n${c.content}`)
    .join('\n\n---\n\n');
}

/**
 * Fallback context used when embeddings haven't been generated yet.
 * Manually written summary of Mahesh's key points.
 */
function getFallbackContext(): string {
  return `
IDENTITY:
Mahesh P Jakaraddi — Cloud & DevOps Engineer with ~3 years at Daimler Truck Innovation Center India.
Currently pursuing MS in Computer Science at Arizona State University (Jan 2026 – Present).
Based in Tempe, Arizona. Email: mjakara1@asu.edu. LinkedIn: linkedin.com/in/maheshjakaraddi.

PROFESSIONAL EXPERIENCE — Daimler Truck Innovation Center India (Feb 2023 – Dec 2025):
- Led live migration from VM-based architecture to containerised Kubernetes: zero data loss, uptime improved from 85% to 99.9%.
- Executed cloud migration for 5+ enterprise applications to Azure using AKS, VMs, and supporting services.
- Authored Terraform IaC modules automating Azure & AWS resource provisioning (AKS, VMs, App Services, EC2, VPC, IAM, S3) — improved deployment speed by 70%.
- Designed CI/CD workflows for dev/staging/production environments.
- Engineered microservice backends supporting 15,000+ internal users.
- Managed Kubernetes clusters: namespace config, RBAC, security patches, zero-downtime deployments.
- Set up observability with Prometheus & Grafana.
- Integrated NLU-powered chatbot for AI-driven conversational features.
- Automated Nginx server routing with Terraform & Ansible playbooks.

INTERNSHIP — Daimler Truck Innovation Center India:
- Built automation workflows for microservice deployments on Azure.
- Expanded Terraform modules for 15+ cloud resources.
- Supported production pipelines, monitoring, and debugging.

PROJECTS:
1. Student Voting System (PERN Stack): React + Node.js/Express + PostgreSQL, JWT auth, deployed on Azure.
2. Load Balancing Algorithm Optimization: Optimized traffic routing algorithm with real-time performance-based routing.

SKILLS:
- Languages: Python, TypeScript, JavaScript, C++, C, Bash
- Dev: React.js, Node.js, Express.js, D3.js, REST APIs
- Databases: PostgreSQL, MongoDB, DynamoDB
- Cloud & DevOps: AWS, Azure, Kubernetes, Docker, Terraform, Helm, Ansible, CI/CD
- Tools: Prometheus, Grafana, Nginx, Jenkins, GitHub Actions, Artifactory

EDUCATION:
- MS Computer Science — Arizona State University (Jan 2026 – Present)
- BE Computer Science (GPA 8.2/10) — KLE Technological University (2019–2023)

CERTIFICATIONS:
- Microsoft Azure Fundamentals (AZ-900)
- AWS Cloud Practitioner
- Speak English Professionally (Georgia Tech)
- Data Structures & Algorithms (Udemy)

LEADERSHIP:
- Admin of Code-KLE Programming Club (100+ members, hackathons & competitions).
- Organized enterprise-level events at Daimler Truck.
`.trim();
}
