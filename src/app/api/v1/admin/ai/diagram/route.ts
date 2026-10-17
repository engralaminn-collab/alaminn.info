/** AI Diagram — generate Mermaid diagrams from text descriptions. RBAC: ai_tasks.create */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { generateDiagram } from "@/lib/ai-extensions";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "ai_tasks.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.description) return fail("Description required.", ["description_required"], 422);
  const type = (["flowchart","sequence","class","state","er","gantt"].includes(body.type as string) ? body.type : "flowchart") as "flowchart" | "sequence" | "class" | "state" | "er" | "gantt";
  const result = await generateDiagram(String(body.description), type);
  await writeAudit(guard.session, "ai.diagram", "ai-task", undefined, { type, desc: String(body.description).slice(0, 100) }).catch(() => {});
  return ok(result, "Diagram generated.");
}
