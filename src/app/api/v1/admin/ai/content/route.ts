/** AI Content Generator — generate marketing content drafts. RBAC: ai_tasks.create */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { generateContentDraft } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.title) return fail("Title required.", ["title_required"], 422);
  const draft = await generateContentDraft({
    title: String(body.title),
    type: String(body.type || "blog"),
    platform: body.platform as string | undefined,
    audience: body.audience as string | undefined,
    tone: body.tone as string | undefined,
    keyPoints: body.keyPoints as string[] | undefined,
  });
  await writeAudit(guard.session, "ai.content_draft", "ai-task", undefined, { title: String(body.title).slice(0, 80) }).catch(() => {});
  return ok({ draft, title: String(body.title) }, "Content draft generated.");
}
