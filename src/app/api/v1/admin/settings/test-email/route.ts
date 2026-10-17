import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { env } from "@/lib/env";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/admin/settings/test-email
 * Body: { to?: string }   (defaults to the current user's email)
 *
 * Sends a minimal test email to verify SMTP / Resend configuration.
 * An unconfigured transport is a blocked operation (HTTP 503), never a
 * successful send. Every attempt is written to the audit log.
 */
export async function POST(req: NextRequest) {
  // The existing /api/v1/admin/settings routes use `security_settings.update`
  // for write operations — we reuse the same permission here so the test-email
  // button is gated by the same role as the rest of the settings page.
  const guard = await requirePermission(req, "security_settings.update");
  if (guard.denied) return guard.response;

  const body = await readJson<Record<string, string>>(req);
  const to = (body?.to || guard.session.email || "").trim();
  if (!to) return fail("No recipient address available.");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 254) {
    return fail("Enter a valid recipient address.", ["invalid_recipient"], 422);
  }

  if (!env().emailConfigured) {
    await writeAudit(guard.session, "settings.test_email_blocked", "Setting", undefined, {
      to,
      configured: false,
      result: "not_configured",
    });
    return fail(
      "Email transport is not configured. Set RESEND_API_KEY or all SMTP_* deployment secrets, then redeploy and retry.",
      ["email_transport_not_configured"],
      503,
      { configured: false, sent: false }
    );
  }

  const subject = "Alaminn.info — Test Email";
  const text = [
    "This is a test email from the Alaminn.info Command Center.",
    "",
    `Sent by: ${guard.session.email}`,
    `Sent at: ${new Date().toISOString()}`,
    "",
    "If you received this message, your SMTP / Resend configuration is working correctly.",
  ].join("\n");
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #F97316; margin: 0 0 16px;">Alaminn.info — Test Email</h1>
      <p style="font-size: 15px; color: #1f2937;">This is a test email from the Alaminn.info Command Center.</p>
      <table style="font-size: 14px; color: #374151; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Sent by:</td><td>${guard.session.email}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: 600;">Sent at:</td><td>${new Date().toISOString()}</td></tr>
      </table>
      <p style="font-size: 14px; color: #6B7280;">If you received this message, your SMTP / Resend configuration is working correctly.</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject,
    text,
    html,
  });

  await writeAudit(
    guard.session,
    result.success ? "settings.test_email_delivered" : "settings.test_email_failed",
    "Setting",
    undefined,
    {
      to,
      configured: true,
      provider: result.provider,
      success: result.success,
      error: result.error || null,
    }
  );

  if (!result.success) {
    return fail(
      `Email send failed: ${result.error || "unknown error"}`,
      ["email_send_failed"],
      500
    );
  }

  return ok(
    { sent: true, provider: result.provider, messageId: result.messageId || null },
    `Test email sent to ${to}.`
  );
}
