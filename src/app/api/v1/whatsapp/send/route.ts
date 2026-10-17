/**
 * POST /api/v1/whatsapp/send
 * ==========================
 * Admin-only endpoint for manually sending a WhatsApp message to a lead.
 * Requires the dedicated `whatsapp.send` permission.
 *
 * Body: { to: string, text: string }
 */
import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";
import { sendWhatsappMessage, normalizeWhatsappNumber } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "whatsapp.send");
  if (guard.denied) return guard.response;

  const body = await readJson<{ to?: string; text?: string }>(req);
  if (!body) return fail("Invalid JSON body.", ["invalid_json"], 400);

  const to = typeof body.to === "string" ? body.to.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!to) return fail("`to` is required.", ["to_required"], 400);
  if (!text) return fail("`text` is required.", ["text_required"], 400);
  if (text.length > 4096) return fail("Text too long (max 4096 chars).", ["text_too_long"], 400);

  const normalized = normalizeWhatsappNumber(to);
  if (!normalized) return fail("Invalid recipient number.", ["invalid_to"], 400);

  const result = await sendWhatsappMessage(normalized, text);

  await writeAudit(
    guard.session,
    "whatsapp_manual_send",
    "WhatsApp",
    result.messageId || undefined,
    {
      toSuffix: normalized.slice(-4),
      status: result.status,
      actuallySent: result.actuallySent,
      error: result.error,
    }
  );

  if (!result.actuallySent) {
    return fail(
      result.status === "FAILED"
        ? `WhatsApp provider rejected the send. ${result.error || ""}`.trim()
        : "WhatsApp Cloud API is not configured. No message was sent.",
      [result.status === "FAILED" ? "send_failed" : "whatsapp_not_configured"],
      result.status === "FAILED" ? 502 : 503,
      { status: result.status, actuallySent: false }
    );
  }

  return ok(
    {
      messageId: result.messageId,
      status: result.status,
      actuallySent: true,
    },
    "Message accepted by WhatsApp Cloud API; delivery confirmation is pending.",
    { toSuffix: normalized.slice(-4) }
  );
}
