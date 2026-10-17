import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.view");
  if (guard.denied) return guard.response;
  const items = await db.emailCampaign.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { queueItems: true, events: true } } } });
  return ok({ items });
}
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.name || !body?.subject) return fail("Name, subject required.", ["fields_required"], 422);
  const created = await db.emailCampaign.create({ data: { name: String(body.name), subject: String(body.subject), fromName: body.fromName as string || "Al Aminn", fromEmail: body.fromEmail as string || "noreply@alaminn.info", replyTo: body.replyTo as string | undefined, listId: body.listId as string | undefined, htmlContent: body.htmlContent as string || "", textContent: body.textContent as string | undefined, type: body.type as string || "regular", status: "draft", provider: body.provider as string || "native" } });
  await writeAudit(guard.session, "em.campaign.create", "email_campaign", created.id).catch(() => {});
  return ok({ item: created }, "Campaign created.");
}
