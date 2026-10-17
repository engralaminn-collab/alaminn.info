import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/email-operations — redacted durable delivery evidence. */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.view");
  if (guard.denied) return guard.response;

  const deliveries = await db.emailDelivery.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      templateKey: true,
      status: true,
      attempts: true,
      provider: true,
      lastError: true,
      relatedType: true,
      relatedId: true,
      nextAttemptAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Recipient, rendered payload, and provider credentials are intentionally
  // absent from this response.
  const records = deliveries.map((delivery) => ({
    id: delivery.id,
    action: `email.${delivery.status.toLowerCase()}`,
    resource: delivery.relatedType || "EmailDelivery",
    resourceId: delivery.relatedId || delivery.id,
    meta: {
      template: delivery.templateKey,
      provider: delivery.provider || "not attempted",
      attempt: delivery.attempts,
      error: delivery.lastError,
      nextAttemptAt: delivery.nextAttemptAt,
      updatedAt: delivery.updatedAt,
    },
    createdAt: delivery.createdAt,
  }));

  const count = (status: string) => deliveries.filter((item) => item.status === status).length;
  const config = env();

  return ok({
    configured: config.emailConfigured,
    provider: config.resendApiKey ? "Resend" : config.smtpHost ? "SMTP" : "Not configured",
    counts: {
      sent: count("SENT"),
      failed: count("FAILED"),
      pending: count("PENDING"),
      retrying: count("RETRYING"),
      records: records.length,
    },
    records,
  }, "Email operations loaded.");
}
