/** AI Image Generator — generate images from text prompts. RBAC: ai_tasks.create */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { generateImage } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.prompt) return fail("Prompt required.", ["prompt_required"], 422);
  const result = await generateImage(String(body.prompt), String(body.size || "1024x1024"));
  if (!result) return fail("Image generation unavailable.", ["generation_failed"], 503);
  await writeAudit(guard.session, "ai.image_gen", "ai-task", undefined, { prompt: String(body.prompt).slice(0, 80) }).catch(() => {});
  return ok(result, "Image generated.");
}
