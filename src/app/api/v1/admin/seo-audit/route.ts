import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { performSeoAudit } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.url) return fail("URL required.", ["url_required"], 422);
  const result = await performSeoAudit({ url: String(body.url), targetKeywords: body.targetKeywords as string[] | undefined });
  await writeAudit(guard.session, "ai.seo_audit", "ai-task", undefined, { url: String(body.url).slice(0, 100) }).catch(() => {});
  return ok(result, "SEO audit complete.");
}
