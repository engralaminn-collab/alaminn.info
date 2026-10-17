/**
 * AI Extensions — consolidated AI capabilities for Alaminn.info.
 *
 * Ported from ALO Labs Marketing OS + ALO Labs AgentOS.
 * Inspired by inspected GitHub repos:
 * - cathrynlavery/diagram-design → expanded diagram types (10+ layout grammars)
 * - blader/humanizer → improved humanizer patterns
 * - coreyhaines31/marketingskills → 50 marketing skill prompts
 * - every-app/open-seo → SEO audit patterns
 * - akitaonrails/ai-memory → memory store/retrieve
 * - mksglu/context-mode → context management
 * - debpalash/VoiceStudio → voice/TTS
 * - heygen/hyperframes → image generation
 */

import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

// ─── AI Diagram Generator (cathrynlavery/diagram-design) ────────────────
const DIAGRAM_TYPES = [
  "flowchart", "sequence", "class", "state", "er", "gantt",
  "sankey", "fishbone", "wardley-map", "kanban", "user-journey",
  "deployment", "dependency-graph", "uml-class", "story-map", "database-schema",
] as const;
export type DiagramType = (typeof DIAGRAM_TYPES)[number];

export async function generateDiagram(
  description: string,
  type: DiagramType = "flowchart"
): Promise<{ mermaid: string; type: string }> {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Generate a Mermaid ${type} diagram based on the user's description. Return ONLY valid Mermaid code (no markdown, no backticks, no explanation). Start with the diagram type keyword (e.g. "graph TD" or "sequenceDiagram"). For ${type}, use the appropriate Mermaid syntax. If ${type} is not directly supported by Mermaid, use the closest approximation with "graph TD".`,
        },
        { role: "user", content: description },
      ],
      thinking: { type: "disabled" },
    });
    const mermaid = completion.choices[0]?.message?.content || "";
    return { mermaid: mermaid.trim(), type };
  } catch {
    return { mermaid: diagramFallback(type, description), type };
  }
}

function diagramFallback(type: string, desc: string): string {
  const d = desc.slice(0, 50);
  if (type === "sequence") return `sequenceDiagram\n    participant User\n    participant System\n    User->>System: ${d}\n    System-->>User: Response`;
  if (type === "gantt") return `gantt\n    title ${d}\n    section Phase 1\n    Task 1 :a1, 2024-01-01, 30d\n    Task 2 :after a1, 20d`;
  if (type === "kanban") return `graph TD\n    A[Backlog: ${d}] --> B[In Progress]\n    B --> C[Review]\n    C --> D[Done]`;
  if (type === "user-journey") return `journey\n    title ${d}\n    section Step 1\n      Visit site: 5: User\n    section Step 2\n      Book meeting: 4: User`;
  return `graph TD\n    A[${d}]`;
}

// ─── Text Humanizer (blader/humanizer) ────────────────────────────────
export async function humanizeText(
  text: string,
  tone: "casual" | "professional" | "friendly" | "persuasive" = "casual"
): Promise<string> {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Rewrite this text to sound more natural and human. Use ${tone} tone. Remove AI-typical patterns:
- Staging: signals importance instead of adding a fact
- Rhythm by rule: forced triads and excessive dashes
- Inflation: ordinary facts dressed as pivotal or expert-backed
- Formatting by rule: bold/title case on every item
- Leftovers: chat wrappers and drafting moves
- Stock AI words: "delve", "leverage", "seamless", "robust", "comprehensive"
Return ONLY the rewritten text.`,
        },
        { role: "user", content: text },
      ],
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content || text;
  } catch {
    return humanizeFallback(text, tone);
  }
}

function humanizeFallback(text: string, tone: string): string {
  let r = text
    .replace(/in order to/gi, "to").replace(/leverage/gi, "use").replace(/utilize/gi, "use")
    .replace(/delve into/gi, "explore").replace(/cutting-edge/gi, "modern")
    .replace(/robust/gi, "strong").replace(/comprehensive/gi, "complete")
    .replace(/seamless/gi, "smooth").replace(/it's worth noting that/gi, "")
    .replace(/in today's fast-paced world/gi, "today").replace(/  +/g, " ").trim();
  if (tone === "casual" || tone === "friendly") {
    r = r.replace(/\bdo not\b/gi, "don't").replace(/\bis not\b/gi, "isn't")
      .replace(/\bcan not\b/gi, "can't").replace(/\bwill not\b/gi, "won't")
      .replace(/\byou are\b/gi, "you're").replace(/\bit is\b/gi, "it's");
  }
  return r;
}

// ─── Marketing Content Generator (coreyhaines31/marketingskills) ──────
export const MARKETING_SKILLS = [
  "copywriting", "content-strategy", "seo-audit", "social-media", "email-marketing",
  "cold-email", "lead-magnets", "referral-marketing", "ad-creative", "pricing",
  "onboarding", "churn-prevention", "ab-testing", "cro", "analytics",
  "competitor-profiling", "customer-research", "influencer-marketing", "launch",
  "programmatic-seo", "schema-markup", "site-architecture", "sms-marketing",
] as const;
export type MarketingSkill = (typeof MARKETING_SKILLS)[number];

export async function generateContentDraft(params: {
  title: string;
  type: string;
  platform?: string;
  audience?: string;
  tone?: string;
  keyPoints?: string[];
  marketingSkill?: MarketingSkill;
}): Promise<string> {
  try {
    const zai = await ZAI.create();
    const skillHint = params.marketingSkill ? ` Apply ${params.marketingSkill.replace(/-/g, " ")} marketing framework.` : "";
    const platformHint = params.platform ? ` for ${params.platform}` : "";
    const audienceHint = params.audience ? ` targeting ${params.audience}` : "";
    const toneHint = params.tone ? ` in ${params.tone} tone` : "";
    const pointsHint = params.keyPoints?.length ? ` Include: ${params.keyPoints.join(", ")}` : "";

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional content writer for Al Aminn's personal brand platform (alaminn.info). Generate a ${params.type} draft${platformHint}${audienceHint}${toneHint}.${pointsHint}${skillHint} The draft should be well-structured, engaging, and ready for review. Do not include placeholder text.`,
        },
        { role: "user", content: `Title: ${params.title}\n\nGenerate the content draft.` },
      ],
      thinking: { type: "disabled" },
    });
    return completion.choices[0]?.message?.content || "";
  } catch {
    return `Unable to generate content draft. Please try again or write manually.\n\nTitle: ${params.title}`;
  }
}

// ─── SEO Audit (every-app/open-seo) ────────────────────────────────────
export async function performSeoAudit(params: {
  url: string;
  targetKeywords?: string[];
}): Promise<{ score: number; issues: string[]; recommendations: string[] }> {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an SEO auditor. Analyze the given URL and return a JSON object with:
- score: number 0-100
- issues: array of specific SEO issues found
- recommendations: array of actionable recommendations
Return ONLY valid JSON.`,
        },
        { role: "user", content: `URL: ${params.url}\n${params.targetKeywords ? `Target keywords: ${params.targetKeywords.join(", ")}` : ""}` },
      ],
      thinking: { type: "disabled" },
    });
    const result = completion.choices[0]?.message?.content || "";
    try {
      return JSON.parse(result);
    } catch {
      return { score: 0, issues: ["Unable to parse SEO audit result"], recommendations: [] };
    }
  } catch {
    return { score: 0, issues: ["SEO audit failed"], recommendations: [] };
  }
}

// ─── AI Image Generation (heygen/hyperframes) ──────────────────────────
export async function generateImage(
  prompt: string,
  size: string = "1024x1024"
): Promise<{ url: string; prompt: string } | null> {
  try {
    const zai = await ZAI.create();
    const validSizes = ["1024x1024", "768x1344", "864x1152", "1344x768", "1152x864", "1440x720", "720x1440"];
    const actualSize = (validSizes.includes(size) ? size : "1024x1024") as "1024x1024" | "768x1344" | "864x1152" | "1344x768" | "1152x864" | "1440x720" | "720x1440";
    const result = await zai.images.generations.create({ prompt, size: actualSize });
    const base64 = (result as { base64?: string }).base64;
    if (base64) return { url: `data:image/png;base64,${base64}`, prompt };
    return null;
  } catch { return null; }
}

// ─── AI Memory (akitaonrails/ai-memory) ────────────────────────────────
export async function storeMemory(category: string, content: string, metadata?: Record<string, unknown>): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: "ai.memory_store",
        resource: "memory",
        meta: JSON.stringify({ category, content: content.slice(0, 500), ...metadata }),
      },
    });
  } catch { /* silent fail */ }
}

export async function retrieveMemories(category?: string, limit = 10): Promise<Array<{ action: string; meta: string | null; createdAt: Date }>> {
  try {
    const where: { action: string; resource: string } = { action: "ai.memory_store", resource: "memory" };
    return await db.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: limit });
  } catch { return []; }
}

// ─── Context Management (mksglu/context-mode) ──────────────────────────
export async function buildContext(params: {
  conversationId?: string;
  contactId?: string;
  inquiryId?: string;
  maxTokens?: number;
}): Promise<string> {
  const parts: string[] = [];
  try {
    if (params.contactId) {
      const contact = await db.contact.findUnique({ where: { id: params.contactId } });
      if (contact) parts.push(`Contact: ${contact.fullName}, ${contact.email}, status: ${contact.status}`);
    }
    if (params.inquiryId) {
      const inquiry = await db.inquiry.findUnique({ where: { id: params.inquiryId }, include: { contact: true } });
      if (inquiry) parts.push(`Inquiry: ${inquiry.reference}, type: ${inquiry.type}, status: ${inquiry.status}`);
    }
    const recentMemories = await retrieveMemories(undefined, 5);
    if (recentMemories.length) parts.push(`Recent context: ${recentMemories.map(m => m.meta).join("; ")}`);
  } catch { /* silent fail */ }
  return parts.join("\n");
}

// ─── Grammar Check ─────────────────────────────────────────────────────
export async function checkGrammar(text: string): Promise<{ corrections: string; original: string }> {
  try {
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: "Check the following text for grammar, spelling, and style issues. Return ONLY the corrected text. If no corrections needed, return the original text unchanged." },
        { role: "user", content: text },
      ],
      thinking: { type: "disabled" },
    });
    return { corrections: (completion.choices[0]?.message?.content || text).trim(), original: text };
  } catch { return { corrections: text, original: text }; }
}
