import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/admin-api";
import { getProvider } from "@/lib/email-marketing/providers";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.to || !body?.subject) return fail("To and subject required.", ["fields_required"], 422);
  const provider = getProvider((body.provider as "smtp" | "brevo" | "mailerlite" | "native") || "native");
  if (!provider) return fail("Invalid provider.", ["invalid_provider"], 400);
  const valid = await provider.validateCredentials();
  if (!valid) return fail("Provider credentials not configured.", ["not_configured"], 400);
  const result = await provider.send({ to: String(body.to), from: "noreply@alaminn.info", fromName: "Al Aminn", subject: String(body.subject), html: String(body.html || "<p>Test email</p>") });
  if (result.success) return ok({ messageId: result.messageId }, "Test email sent.");
  return fail(result.error || "Send failed.", ["send_failed"], 500);
}
