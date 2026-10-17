/** AI Grammar Check — check and correct grammar. RBAC: ai_tasks.create */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/admin-api";
import { checkGrammar } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.text) return fail("Text required.", ["text_required"], 422);
  const result = await checkGrammar(String(body.text));
  return ok(result, "Grammar checked.");
}
