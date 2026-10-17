import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * Authenticated scheduler probe for dependencies owned by the application.
 * It does not ping retired/in-memory sidecars or claim external providers work.
 */
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", data: null, meta: {}, errors: [auth.error] },
      { status: auth.status },
    );
  }

  const checkedAt = new Date().toISOString();
  try {
    await db.$queryRaw`SELECT 1`;
    const config = env();
    const dependencies = [
      { id: "database", status: "healthy", required: true, evidence: "SQLite query completed." },
      {
        id: "transactional-email",
        status: config.emailConfigured ? "configured_unverified" : "blocked",
        required: false,
        evidence: config.emailConfigured
          ? "Transport configuration is present; delivery still requires provider evidence."
          : "No SMTP or Resend transport is configured.",
      },
      {
        id: "whatsapp-cloud-api",
        status: config.whatsappApiConfigured && config.whatsappAppSecret && config.whatsappWebhookVerifyToken
          ? "configured_unverified"
          : "blocked",
        required: false,
        evidence: "Provider status is configuration-derived and never treated as a successful exchange.",
      },
    ];

    return NextResponse.json({
      success: true,
      message: "Owned dependency health scan complete.",
      data: { overall: "healthy", dependencies },
      meta: { checkedAt },
      errors: [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Required database dependency is unhealthy.",
        data: { overall: "unhealthy" },
        meta: { checkedAt },
        errors: [error instanceof Error ? error.message : "database_check_failed"],
      },
      { status: 503 },
    );
  }
}
