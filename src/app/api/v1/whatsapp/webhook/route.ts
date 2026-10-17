/**
 * WhatsApp Webhook — Meta Cloud API verification + inbound messages
 *
 * GET  /api/v1/whatsapp/webhook
 *   Meta verifies the webhook by sending hub.challenge. We echo it back
 *   only if hub.verify_token matches WHATSAPP_WEBHOOK_VERIFY_TOKEN.
 *
 * POST /api/v1/whatsapp/webhook
 *   Meta delivers inbound messages here. We parse, classify, retrieve
 *   knowledge, generate a response, and send it back via the Cloud API.
 *   All steps are logged to AuditLog for observability.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  whatsappConfig,
  parseInboundWebhook,
  processAgentMessage,
  sendWhatsappMessage,
  type AgentMessage,
} from "@/lib/whatsapp";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ─── GET: Webhook verification ─────────────────────────────────────────

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const cfg = whatsappConfig();

  if (!cfg.webhookVerifyToken) {
    return new NextResponse("Webhook verify token not configured", { status: 503 });
  }

  if (mode === "subscribe" && token === cfg.webhookVerifyToken) {
    return new NextResponse(challenge || "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ─── POST: Inbound message handler ─────────────────────────────────────

export async function POST(req: NextRequest) {
  const start = Date.now();
  const cfg = whatsappConfig();
  if (!cfg.appSecret) {
    return NextResponse.json({ error: "webhook_signature_not_configured" }, { status: 503 });
  }

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256") || "";
  const expected = `sha256=${createHmac("sha256", cfg.appSecret).update(rawBody).digest("hex")}`;
  const signatureValid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature, "utf8"), Buffer.from(expected, "utf8"));
  if (!signatureValid) {
    return NextResponse.json({ error: "invalid_webhook_signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const inbound = parseInboundWebhook(payload);
  if (!inbound || !inbound.text) {
    // Not a text message (could be a status update or system event) — ack only
    return NextResponse.json({ success: true, message: "ignored" });
  }

  // Meta retries webhook deliveries. Do not create duplicate leads/tasks/sends.
  if (inbound.messageId) {
    const alreadyProcessed = await db.auditLog.findFirst({
      where: {
        action: "whatsapp_message_received",
        resource: "WhatsApp",
        resourceId: inbound.messageId,
      },
      select: { id: true },
    });
    if (alreadyProcessed) {
      return NextResponse.json({ success: true, message: "duplicate_ignored" });
    }
  }

  // Log inbound message (safe — no message content and only a number suffix)
  const logKey = inbound.from.slice(-4);
  await safeAudit("whatsapp_message_received", "WhatsApp", inbound.messageId, {
    fromSuffix: logKey,
    messageLength: inbound.text.length,
    messageType: inbound.type,
    signatureVerified: true,
  });

  // Human-only, approval-required, and paused modes never send an automatic
  // response. Queue a real follow-up task and notification instead.
  if (cfg.aiMode !== "ACTIVE") {
    const task = await db.task.create({
      data: {
        title: `Review WhatsApp message · …${logKey}`,
        description: `Verified inbound WhatsApp message (${inbound.messageId || "no provider id"}) requires human handling. Message content is not stored in audit metadata.`,
        priority: "high",
        status: "open",
        relatedType: "WhatsApp",
        relatedId: inbound.messageId || null,
      },
    });
    await db.notification.create({
      data: {
        type: "whatsapp",
        title: "WhatsApp message needs human review",
        message: `A verified inbound message from …${logKey} was received in ${cfg.aiMode} mode.`,
        link: "/admin/whatsapp-ai",
      },
    });
    await safeAudit("whatsapp_queued_for_human", "Task", task.id, {
      fromSuffix: logKey,
      mode: cfg.aiMode,
      inboundMessageId: inbound.messageId,
    });
    return NextResponse.json({
      success: true,
      message: "queued_for_human",
      data: { mode: cfg.aiMode, actuallySent: false },
    });
  }

  // Fetch recent conversation history (last 10 messages from this user)
  const history = await loadHistory(inbound.from);

  // Process via the AI agent
  const conversationRef = `wa-${inbound.from}-${Date.now().toString(36)}`;
  const response = await processAgentMessage({
    message: inbound.text,
    from: inbound.from,
    history,
    conversationRef,
  });

  // Log intent detection
  await safeAudit(
    "whatsapp_intent_detected",
    "WhatsApp",
    inbound.messageId,
    {
      fromSuffix: logKey,
      intent: response.intent,
      confidence: response.intentConfidence,
      method: response.intentMethod,
      usedLlm: response.usedLlm,
      elapsedMs: response.elapsedMs,
    }
  );

  // Log knowledge retrieval (if any)
  if (response.knowledge && response.knowledge.totalFound > 0) {
    await safeAudit(
      "whatsapp_knowledge_retrieved",
      "WhatsApp",
      inbound.messageId,
      {
        fromSuffix: logKey,
        totalFound: response.knowledge.totalFound,
        universities: response.knowledge.universities.length,
        courses: response.knowledge.courses.length,
        scholarships: response.knowledge.scholarships.length,
        countries: response.knowledge.countries.length,
      }
    );
  }

  // Extract the response text from the action
  const responseText =
    response.action.type === "human_handoff"
      ? response.action.message
      : response.action.type === "lead_created"
        ? response.action.message
        : response.action.type === "consent_required"
          ? response.action.message
          : (response.action as { message: string }).message;

  // Send the response back to the user
  const sendResult = await sendWhatsappMessage(inbound.from, responseText);

  // Log the send result
  await safeAudit(
    sendResult.actuallySent ? "whatsapp_message_sent" : "whatsapp_message_failed",
    "WhatsApp",
    sendResult.messageId || inbound.messageId,
    {
      fromSuffix: logKey,
      status: sendResult.status,
      actuallySent: sendResult.actuallySent,
      error: sendResult.error,
      responseLength: responseText.length,
      totalElapsedMs: Date.now() - start,
    }
  );

  // If lead was created, log it
  if (response.action.type === "lead_created") {
    await safeAudit(
      "whatsapp_lead_created",
      "Inquiry",
      response.action.inquiryId,
      {
        fromSuffix: logKey,
        isExisting: response.action.isExisting,
        contactId: response.action.contactId,
      }
    );
  }

  // If human handoff, log it
  if (response.action.type === "human_handoff") {
    await safeAudit(
      "whatsapp_human_handoff",
      "Task",
      response.action.taskId,
      {
        fromSuffix: logKey,
        reason: "User requested or AI escalated",
      }
    );
  }

  // Store the conversation turn (for future history loading + audit)
  await storeConversationTurn(inbound.from, inbound.text, responseText, response);

  return NextResponse.json({
    success: true,
    message: "processed",
    data: {
      intent: response.intent,
      status: sendResult.status,
      actuallySent: sendResult.actuallySent,
      elapsedMs: Date.now() - start,
    },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────

async function safeAudit(
  action: string,
  resource: string,
  resourceId: string | null,
  meta: Record<string, unknown>
) {
  try {
    await db.auditLog.create({
      data: {
        actorId: "system",
        action,
        resource,
        resourceId: resourceId || null,
        meta: JSON.stringify(meta),
      },
    });
  } catch {
    // Non-fatal — audit logging should never break the message flow
  }
}

async function loadHistory(from: string): Promise<AgentMessage[]> {
  try {
    // Store conversation turns in a Note linked to a synthetic contact.
    // For simplicity, we look up the last 10 audit logs with action
    // whatsapp_message_received/sent for this user suffix.
    const logs = await db.auditLog.findMany({
      where: {
        action: { in: ["whatsapp_message_received", "whatsapp_message_sent"] },
        meta: { contains: from.slice(-4) },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { action: true, meta: true, createdAt: true },
    });
    // Reverse to chronological order
    return logs.reverse().map((log) => ({
      role: log.action === "whatsapp_message_received" ? "user" : "assistant",
      content: "", // We don't store message content in audit logs (privacy)
      timestamp: log.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}

async function storeConversationTurn(
  _from: string,
  _userMessage: string,
  _assistantResponse: string,
  _response: Awaited<ReturnType<typeof processAgentMessage>>
) {
  // Intentionally NOT storing message content in the DB for privacy.
  // Only metadata (intent, timestamp, status) is logged via safeAudit above.
  // If a future requirement needs full conversation history, a dedicated
  // WhatsAppConversation model with encryption-at-rest should be added.
}
