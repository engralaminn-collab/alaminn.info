import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
import { getDashboardStats } from "@/lib/email-marketing";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.view");
  if (guard.denied) return guard.response;
  const stats = await getDashboardStats();
  return ok(stats, "Email marketing stats.");
}
