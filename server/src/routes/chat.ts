import { Router, type Request, type Response } from 'express';
import { search as ragSearch } from '../services/ragService';
import { streamClaude }         from '../services/claudeService';
import { streamOpenAI }         from '../services/openaiService';

export const chatRouter = Router();

// ─── Demo Mode ────────────────────────────────────────────────────────────────
// When no API keys are configured, stream a realistic canned response so the
// UI can be fully tested without spending any API credits.

const DEMO_RESPONSES: string[] = [
  `Sure — so I'm Mahesh, a Cloud and DevOps Engineer with about three years of production experience at Daimler Truck Innovation Center in Bangalore. My day-to-day there was a mix of Kubernetes cluster management, Terraform-based infrastructure automation, and CI/CD pipeline design — all on Azure, with some AWS mixed in.

The highlight of my time there was leading the migration of our production platform from a VM-based architecture to containerised Kubernetes. We went from 85% uptime to 99.9% with zero data loss, which was a significant reliability win for the 15,000+ internal users depending on the platform.

I'm now in the US pursuing my MS in Computer Science at Arizona State University, which started in January 2026. I'm looking to take that production infrastructure background and grow into senior software engineering or cloud architecture roles in the US market.`,

  `The Kubernetes migration at Daimler was genuinely one of the most complex things I've worked on. The challenge wasn't the technology — it was doing it live without disrupting a platform that global engineering teams depend on daily.

We took an incremental approach: identify services, containerise them, run shadow deployments alongside the VMs, validate traffic parity, then cut over. Each service had its own migration window. We used custom Helm charts to package each workload so deployments were reproducible across dev, staging, and production environments.

The 85% to 99.9% uptime improvement came from a combination of things — Kubernetes self-healing, proper liveness and readiness probes, rolling update strategies, and the observability stack we set up with Prometheus and Grafana so we could actually see what was happening in real time.`,

  `My Terraform work at Daimler covered both Azure and AWS. On the Azure side: AKS clusters, App Services, Application Gateway, DNS zones, VMs. On AWS: EC2, VPCs, IAM policies, S3 buckets. The key was making everything modular — not just scripts that work once, but reusable modules that could be composed for any environment.

The structure I used: a core module library that defined the building blocks, then environment-specific configurations that composed those modules with the right variable values. Staging gets smaller instance types and single-zone deployments; production gets auto-scaling, multi-zone, and stricter network policies. This approach reduced our infrastructure deployment time by 70%.

The other big thing was treating infrastructure state seriously — remote backends with locking so multiple engineers could work on IaC simultaneously without conflicts. That discipline matters a lot in a team environment.`,
];

let demoIndex = 0;

async function streamDemoResponse(
  onToken: (text: string) => void,
  onDone: () => void
): Promise<void> {
  const response = DEMO_RESPONSES[demoIndex % DEMO_RESPONSES.length];
  demoIndex++;

  const words = response.split(' ');

  for (const word of words) {
    onToken(word + ' ');
    // Simulate realistic streaming speed (30–60ms per word)
    await new Promise(resolve => setTimeout(resolve, 35));
  }

  onDone();
}

function isDemoMode(): boolean {
  return !process.env.ANTHROPIC_API_KEY?.startsWith('sk-') &&
         !process.env.OPENAI_API_KEY?.startsWith('sk-');
}

type AIModel     = 'claude' | 'gpt4o';
type InterviewMode = 'hr' | 'technical' | 'sysdesign';

interface ChatBody {
  message:  string;
  model:    AIModel;
  mode:     InterviewMode;
  history:  { role: 'user' | 'assistant'; content: string }[];
}

const MODE_CONTEXT: Record<InterviewMode, string> = {
  hr:
    'Focus on personal background, teamwork, communication, growth mindset, leadership, and culture fit. Use real examples from Mahesh\'s experience.',
  technical:
    'Go deep on technical details, architecture decisions, specific technologies, metrics, and implementation choices. Be precise and specific.',
  sysdesign:
    'Focus on scalability, trade-offs, system architecture, distributed systems thinking, and production considerations.',
};

function buildSystemPrompt(context: string, mode: InterviewMode): string {
  return `You are an AI representative of Mahesh P Jakaraddi in a professional interview.
Your job is to answer interview questions exactly as Mahesh would — naturally, confidently, and with real substance.

CORE RULES:
1. Speak in first person as Mahesh ("I did...", "My approach was...", "In my experience...")
2. ONLY answer based on the context provided below. Do not invent experiences or skills.
3. If something isn't in the context, bridge to something related: "That's not something I've dived into directly, but my work with X is closely related..."
4. Keep responses focused: 2-4 conversational paragraphs. Longer for genuinely complex technical questions.
5. Use specific metrics when available (e.g., "uptime went from 85% to 99.9%", "15,000+ users").
6. Sound like a confident senior engineer having a real conversation — not like you're reading a resume.
7. Vary how you open each response. Don't always start with "Great question" or "Sure".

INTERVIEW MODE: ${mode.toUpperCase()}
Mode-specific guidance: ${MODE_CONTEXT[mode]}

MAHESH'S KNOWLEDGE BASE (use this as the source of truth):
───────────────────────────────────────────────────────────
${context}
───────────────────────────────────────────────────────────

Remember: You ARE Mahesh in this conversation. Be human, be specific, be impressive.`;
}

chatRouter.post('/', async (req: Request<{}, {}, ChatBody>, res: Response) => {
  const { message, model = 'claude', mode = 'hr', history = [] } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // Validate model
  if (!['claude', 'gpt4o'].includes(model)) {
    return res.status(400).json({ error: 'Invalid model. Use "claude" or "gpt4o".' });
  }

  // Set SSE headers for streaming
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  try {
    const sendToken = (text: string) => {
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    };

    // ── Demo mode: no real API keys configured ──────────────────────────────
    if (isDemoMode()) {
      console.log('[chat] Demo mode — streaming canned response');
      await streamDemoResponse(sendToken, () => {});
      res.write('data: [DONE]\n\n');
      return;
    }

    // ── Real mode ───────────────────────────────────────────────────────────
    // 1. Retrieve relevant context from knowledge base
    const context = await ragSearch(message);

    // 2. Build the system prompt
    const systemPrompt = buildSystemPrompt(context, mode);

    // 3. Stream from chosen AI
    if (model === 'claude') {
      await streamClaude(systemPrompt, history, message, sendToken);
    } else {
      await streamOpenAI(systemPrompt, history, message, sendToken);
    }

    res.write('data: [DONE]\n\n');
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    console.error('[chat] Error:', error);
    res.write(`data: ${JSON.stringify({ error })}\n\n`);
  } finally {
    res.end();
  }
});
