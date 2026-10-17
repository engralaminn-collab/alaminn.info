import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, pagination, readJson, writeAudit } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.view");
  if (guard.denied) return guard.response;
  const { skip, take, page, pageSize } = pagination(req);
  const search = new URL(req.url).searchParams.get("q");
  const where = search ? { email: { contains: search } } : {};
  const [items, total] = await Promise.all([
    db.emailContact.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
    db.emailContact.count({ where }),
  ]);
  return ok({ items, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } });
}
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.email) return fail("Email required.", ["email_required"], 422);
  const created = await db.emailContact.create({ data: { email: String(body.email), firstName: body.firstName as string | undefined, lastName: body.lastName as string | undefined, phone: body.phone as string | undefined, company: body.company as string | undefined, country: body.country as string | undefined, source: body.source as string | "manual", consentStatus: body.consentStatus as string | "single" } });
  await writeAudit(guard.session, "em.contact.create", "email_contact", created.id).catch(() => {});
  return ok({ item: created }, "Contact created.");
}
