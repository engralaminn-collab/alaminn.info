import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type IntegrationState = "VERIFIED" | "CONFIGURED_UNVERIFIED" | "NOT_CONFIGURED" | "NOT_IMPLEMENTED";

type Integration = {
  id: string;
  name: string;
  category: string;
  state: IntegrationState;
  implementation: "REAL" | "PARTIAL" | "NOT_IMPLEMENTED";
  officialApi: string;
  lastVerifiedAt: string | null;
  blocker: string | null;
  nextStep: string;
};

/**
 * GET /api/v1/admin/integrations
 * Returns server-derived status only. "VERIFIED" requires both configuration
 * and a persisted successful provider event; environment presence alone is
 * never presented as a working connection.
 */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "integration_settings.view");
  if (guard.denied) return guard.response;

  const config = env();
  const [lastEmailSuccess, lastWhatsappSuccess, lastWhatsappInbound] = await Promise.all([
    db.auditLog.findFirst({
      where: { action: "email.sent" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.auditLog.findFirst({
      where: { action: "whatsapp_message_sent" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
    db.auditLog.findFirst({
      where: { action: "whatsapp_message_received" },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);

  const emailState: IntegrationState = !config.emailConfigured
    ? "NOT_CONFIGURED"
    : lastEmailSuccess
      ? "VERIFIED"
      : "CONFIGURED_UNVERIFIED";
  const whatsappVerified = lastWhatsappSuccess || lastWhatsappInbound;
  const whatsappFullyConfigured = Boolean(
    config.whatsappApiConfigured && config.whatsappAppSecret && config.whatsappWebhookVerifyToken
  );
  const whatsappState: IntegrationState = !whatsappFullyConfigured
    ? "NOT_CONFIGURED"
    : whatsappVerified
      ? "VERIFIED"
      : "CONFIGURED_UNVERIFIED";

  const integrations: Integration[] = [
    {
      id: "email",
      name: "Transactional Email",
      category: "Communication",
      state: emailState,
      implementation: "REAL",
      officialApi: config.resendApiKey ? "Resend API" : "SMTP",
      lastVerifiedAt: lastEmailSuccess?.createdAt.toISOString() || null,
      blocker: emailState === "NOT_CONFIGURED"
        ? "No Resend or complete SMTP credential set is present in the deployment environment."
        : emailState === "CONFIGURED_UNVERIFIED"
          ? "Credentials are present, but no successful provider delivery has been recorded."
          : null,
      nextStep: emailState === "VERIFIED"
        ? "Monitor Email Operations and provider delivery logs."
        : "Configure deployment secrets, redeploy, then send a real test email from Settings.",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      category: "Communication",
      state: whatsappState,
      implementation: "PARTIAL",
      officialApi: "Meta WhatsApp Cloud API",
      lastVerifiedAt: whatsappVerified?.createdAt.toISOString() || null,
      blocker: whatsappState === "NOT_CONFIGURED"
        ? "WhatsApp requires Phone Number ID, API token, webhook verify token, and Meta app secret; at least one is missing."
        : whatsappState === "CONFIGURED_UNVERIFIED"
          ? "Credentials are present, but no successful inbound or outbound provider event has been recorded."
          : null,
      nextStep: "Validate the Meta webhook, send a test message to an opted-in recipient, and verify provider logs.",
    },
    {
      id: "generative-ai",
      name: "Generative AI Draft Provider",
      category: "Automation",
      state: "NOT_CONFIGURED",
      implementation: "PARTIAL",
      officialApi: "No provider selected",
      lastVerifiedAt: null,
      blocker: "No official generative-provider credential exchange is configured or verified. Deterministic verified-rules assistance remains available without impersonation.",
      nextStep: "Select an approved provider, add server-side credentials, persist a non-sensitive draft, and require human approval before any external communication.",
    },
    ...notImplementedIntegrations(),
  ];

  return ok(
    { integrations, checkedAt: new Date().toISOString() },
    "Integration status loaded from server configuration and audit evidence."
  );
}

function notImplementedIntegrations(): Integration[] {
  return [
    ["google-calendar", "Google Calendar", "Scheduling", "Google Calendar API", "Implement OAuth 2.0 authorization-code flow, encrypted token storage, refresh, revocation, and event sync."],
    ["gmail", "Gmail", "Communication", "Gmail API", "Implement Google OAuth with least-privilege Gmail scopes and verified send/read flows."],
    ["facebook", "Facebook", "Social", "Meta Graph API", "Implement Meta OAuth, Page selection, encrypted tokens, webhook verification, and publishing review."],
    ["instagram", "Instagram", "Social", "Meta Graph API for Instagram", "Implement Meta OAuth for an eligible Professional account, token refresh, and publishing permissions."],
    ["linkedin", "LinkedIn", "Social", "LinkedIn Marketing APIs", "Obtain LinkedIn app approval, then implement OAuth, encrypted tokens, organization selection, and publishing."],
  ].map(([id, name, category, officialApi, nextStep]) => ({
    id,
    name,
    category,
    state: "NOT_IMPLEMENTED" as const,
    implementation: "NOT_IMPLEMENTED" as const,
    officialApi,
    lastVerifiedAt: null,
    blocker: "No backend OAuth/token/publishing implementation exists in this repository.",
    nextStep,
  }));
}
