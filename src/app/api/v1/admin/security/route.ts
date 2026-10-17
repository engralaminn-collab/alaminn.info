import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const LEGACY_SECRET_KEYS = [
  "smtp.pass",
  "smtp.password",
  "resend.apiKey",
  "google.clientSecret",
  "meta.accessToken",
  "whatsapp.apiToken",
  "linkedin.clientSecret",
];

export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.view");
  if (guard.denied) return guard.response;

  const since = new Date(Date.now() - 24 * 60 * 60_000);
  const [activeUsers, inactiveUsers, twoFactorUsers, failedLogins, successfulLogins, legacySecretRows, recentEvents, currentUser] = await Promise.all([
    db.user.count({ where: { status: "active" } }),
    db.user.count({ where: { status: { not: "active" } } }),
    db.user.count({ where: { twoFactorEnabled: true } }),
    db.auditLog.count({ where: { action: "auth.login_failed", createdAt: { gte: since } } }),
    db.auditLog.count({ where: { action: "auth.login_success", createdAt: { gte: since } } }),
    db.setting.count({ where: { key: { in: LEGACY_SECRET_KEYS } } }),
    db.auditLog.findMany({
      where: { action: { startsWith: "auth." } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, action: true, resourceId: true, ipHash: true, createdAt: true },
    }),
    db.user.findUnique({
      where: { id: guard.session.userId },
      select: { twoFactorEnabled: true },
    }),
  ]);

  return ok({
    controls: {
      signedSessionCookie: true,
      httpOnly: true,
      secureInProduction: true,
      sameSite: "lax",
      sessionDurationHours: 8,
      databaseUserRevalidation: true,
      serverSideRbac: true,
      loginRateLimit: "5 failures / 15 minutes / process",
      distributedRateLimit: false,
      twoFactorAuthentication: true,
      twoFactorEnabledForCurrentUser: currentUser?.twoFactorEnabled ?? false,
      crossSiteOriginValidation: true,
      csrfToken: false,
      authSecretConfigured: env().authSecretConfigured,
    },
    counts: { activeUsers, inactiveUsers, twoFactorUsers, failedLogins24h: failedLogins, successfulLogins24h: successfulLogins, legacySecretRows },
    recentEvents,
    limitations: [
      "Login throttling is in-memory and is not shared across multiple server instances.",
      "TOTP is optional per user; administrators must securely retain their one-time recovery codes.",
      "No dedicated CSRF token is used; SameSite cookies plus Origin validation protect browser mutations.",
      "AUTH_SECRET presence is checked, but its value is never returned.",
    ],
  }, "Security posture loaded from runtime configuration and audit data.");
}
