import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET() {
  // Templates are viewable by any authenticated user
  const items = await db.emailTemplate.findMany({ orderBy: { createdAt: "desc" } });
  return ok({ items });
}
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "articles.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.name || !body?.subject || !body?.htmlContent) return fail("Name, subject, htmlContent required.", ["fields_required"], 422);
  const created = await db.emailTemplate.create({ data: { name: String(body.name), subject: String(body.subject), preheader: body.preheader as string | undefined, htmlContent: String(body.htmlContent), textContent: body.textContent as string | undefined, category: body.category as string | "general" } });
  await writeAudit(guard.session, "em.template.create", "email_template", created.id).catch(() => {});
  return ok({ item: created }, "Template created.");
}
