import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const EDITABLE_KEYS = new Set(["booking.notificationEmail"]);
const LEGACY_SECRET_KEYS = [
  "smtp.pass",
  "smtp.password",
  "resend.apiKey",
  "google.clientSecret",
  "meta.accessToken",
  "whatsapp.apiToken",
  "linkedin.clientSecret",
];

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

/** GET /api/v1/admin/settings — safe operational settings and env status. */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.view");
  if (guard.denied) return guard.response;

  const [settings, legacySecretRows] = await Promise.all([
    db.setting.findMany({ where: { key: { in: [...EDITABLE_KEYS] } } }),
    db.setting.count({ where: { key: { in: LEGACY_SECRET_KEYS } } }),
  ]);
  const config = env();
  const map: Record<string, string> = {};
  for (const setting of settings) map[setting.key] = setting.value;
  map["_email.configured"] = config.emailConfigured ? "true" : "false";
  map["_email.provider"] = config.resendApiKey
    ? "Resend"
    : config.smtpHost && config.smtpUser && config.smtpPass
      ? "SMTP"
      : "Not configured";
  map["_email.from"] = config.emailFrom || "Not configured";
  map["_email.replyTo"] = config.emailReplyTo || "Not configured";
  map["_security.legacySecretRows"] = String(legacySecretRows);
  return ok(map, "Operational settings loaded.");
}

/** PUT /api/v1/admin/settings — update an explicit allowlist of non-secret settings. */
export async function PUT(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.update");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Invalid JSON body.", ["invalid_json"], 400);
  }

  const keys = Object.keys(body);
  const rejected = keys.filter((key) => !EDITABLE_KEYS.has(key));
  if (rejected.length) {
    return fail(
      "One or more settings cannot be changed here. Provider credentials must be configured through deployment secrets.",
      rejected.map((key) => `unsupported_setting:${key}`),
      422
    );
  }

  const bookingEmail = String(body["booking.notificationEmail"] || "").trim().toLowerCase();
  if (keys.includes("booking.notificationEmail") && !validEmail(bookingEmail)) {
    return fail("Enter a valid booking notification email.", ["invalid_booking_email"], 422);
  }

  try {
    await db.$transaction([
      db.setting.deleteMany({ where: { key: { in: LEGACY_SECRET_KEYS } } }),
      ...keys.map((key) =>
        db.setting.upsert({
          where: { key },
          update: { value: bookingEmail },
          create: { key, value: bookingEmail },
        })
      ),
    ]);
    await writeAudit(guard.session, "settings.update", "Setting", undefined, {
      keys,
      legacySecretsPurged: true,
    });
    return ok({ updated: keys.length }, "Operational settings saved.");
  } catch (error) {
    return fail("Failed to save settings.", [(error as Error).message], 500);
  }
}

/** DELETE /api/v1/admin/settings — remove legacy plaintext provider secrets. */
export async function DELETE(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.update");
  if (guard.denied) return guard.response;
  const result = await db.setting.deleteMany({ where: { key: { in: LEGACY_SECRET_KEYS } } });
  await writeAudit(guard.session, "settings.legacy_secrets_purged", "Setting", undefined, {
    deleted: result.count,
  });
  return ok({ deleted: result.count }, "Legacy database credential rows removed.");
}
