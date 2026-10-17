/** AI Humanize — humanize AI text to sound natural. RBAC: ai_tasks.create */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/admin-api";
import { humanizeText } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.text) return fail("Text required.", ["text_required"], 422);
  const toneStr = String(body.tone || "casual") as "casual" | "professional" | "friendly" | "persuasive";
  const tone = (["casual","professional","friendly","persuasive"].includes(toneStr) ? toneStr : "casual") as "casual" | "professional" | "friendly" | "persuasive";
  const humanized = await humanizeText(String(body.text), tone);
  return ok({ original: String(body.text), humanized, tone }, "Text humanized.");
}
