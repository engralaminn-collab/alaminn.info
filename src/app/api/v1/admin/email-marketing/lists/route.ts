import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.view");
  if (guard.denied) return guard.response;
  const items = await db.emailList.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { contacts: true } } } });
  return ok({ items });
}
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.name) return fail("Name required.", ["name_required"], 422);
  const created = await db.emailList.create({ data: { name: String(body.name), description: body.description as string | undefined } });
  await writeAudit(guard.session, "em.list.create", "email_list", created.id).catch(() => {});
  return ok({ item: created }, "List created.");
}
