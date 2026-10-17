import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, pagination } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.view");
  if (guard.denied) return guard.response;
  const { skip, take } = pagination(req);
  const inquiries = await db.inquiry.findMany({ where: { type: "student-referral" }, include: { contact: true }, orderBy: { createdAt: "desc" }, skip, take });
  return ok({ conversations: inquiries.map(i => ({ id: i.id, name: i.contact?.fullName || "Unknown", email: i.contact?.email || "", message: (i as { message?: string }).message || (i as { subject?: string }).subject || "", status: i.status, createdAt: i.createdAt.toISOString() })) });
}
