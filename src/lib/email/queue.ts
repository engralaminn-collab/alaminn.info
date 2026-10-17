/**
 * Durable transactional-email delivery and retry queue.
 *
 * A delivery row is persisted before the provider call. Real SMTP/Resend
 * acceptance marks SENT; console previews are deliberately left PENDING.
 * Failures never roll back the business transaction and can be retried by the
 * authenticated email-queue cron route after a restart.
 */
import { sendEmail, type EmailMessage, type EmailResult, type EmailAddress } from "./transport";
import { EMAIL_TEMPLATES, type EmailTemplateKey, type TemplateResult } from "./templates";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export type SendEmailOptions = {
  to: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  ipHash?: string | null;
  triggeredBy?: string;
  relatedType?: string;
  relatedId?: string;
  skipLog?: boolean;
  /** Internal retry controls. */
  deliveryId?: string;
  suppressBackgroundRetry?: boolean;
};

type StoredOptions = Pick<
  SendEmailOptions,
  "to" | "cc" | "bcc" | "ipHash" | "triggeredBy" | "relatedType" | "relatedId"
>;

const MAX_ATTEMPTS = 4;
const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];

function addressString(address: EmailAddress): string {
  return typeof address === "string" ? address : `${address.name} <${address.address}>`;
}

function recipientSummary(to: EmailAddress | EmailAddress[]): string {
  return (Array.isArray(to) ? to : [to]).map(addressString).join(", ").slice(0, 1000);
}

function storedOptions(options: SendEmailOptions): StoredOptions {
  return {
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    ipHash: options.ipHash,
    triggeredBy: options.triggeredBy,
    relatedType: options.relatedType,
    relatedId: options.relatedId,
  };
}

function isDelivered(result: EmailResult): boolean {
  return result.success && (result.provider === "smtp" || result.provider === "resend");
}

async function createDelivery(
  templateKey: string,
  params: unknown,
  options: SendEmailOptions,
): Promise<string | null> {
  if (options.deliveryId) return options.deliveryId;
  try {
    const row = await db.emailDelivery.create({
      data: {
        templateKey,
        recipient: recipientSummary(options.to),
        payload: JSON.stringify(params),
        options: JSON.stringify(storedOptions(options)),
        status: "PENDING",
        maxAttempts: MAX_ATTEMPTS,
        triggeredBy: options.triggeredBy || null,
        relatedType: options.relatedType || null,
        relatedId: options.relatedId || null,
      },
      select: { id: true },
    });
    return row.id;
  } catch (error) {
    console.error("[email] Could not persist delivery queue row", error);
    return null;
  }
}

async function updateDelivery(
  deliveryId: string | null,
  result: EmailResult,
  attempt: number,
): Promise<void> {
  if (!deliveryId) return;
  const delivered = isDelivered(result);
  const previewOnly = result.provider === "console";
  const canRetry = !delivered && !previewOnly && env().emailConfigured && attempt < MAX_ATTEMPTS;
  const nextDelay = BACKOFF_MS[Math.max(0, attempt - 1)] ?? BACKOFF_MS.at(-1)!;

  try {
    await db.emailDelivery.update({
      where: { id: deliveryId },
      data: {
        status: delivered ? "SENT" : previewOnly || !env().emailConfigured ? "PENDING" : canRetry ? "RETRYING" : "FAILED",
        attempts: previewOnly ? 0 : attempt,
        nextAttemptAt: canRetry ? new Date(Date.now() + nextDelay) : null,
        provider: result.provider,
        providerMessageId: result.messageId || null,
        lastError: delivered ? null : result.error || (previewOnly ? "Development preview only; not delivered" : "Provider did not confirm delivery"),
        sentAt: delivered ? new Date() : null,
      },
    });
  } catch (error) {
    console.error("[email] Could not update delivery queue row", { deliveryId, error });
  }
}

function renderTemplate(templateKey: string, params: unknown): TemplateResult {
  const template = EMAIL_TEMPLATES[templateKey as EmailTemplateKey] as
    | ((value: never) => TemplateResult)
    | undefined;
  if (!template) throw new Error(`Unknown email template: ${templateKey}`);
  return template(params as never);
}

async function deliver(
  templateKey: string,
  params: unknown,
  options: SendEmailOptions,
  attempt: number,
): Promise<{ result: EmailResult; deliveryId: string | null }> {
  const deliveryId = await createDelivery(templateKey, params, options);
  let rendered: TemplateResult;
  try {
    rendered = renderTemplate(templateKey, params);
  } catch (error) {
    const result: EmailResult = {
      success: false,
      provider: "none",
      error: `Template render failed: ${error instanceof Error ? error.message : String(error)}`,
      durationMs: 0,
    };
    await updateDelivery(deliveryId, result, attempt);
    if (!options.skipLog) await logEmail(templateKey, options, result, attempt, deliveryId);
    return { result, deliveryId };
  }

  const message: EmailMessage = {
    to: options.to,
    cc: options.cc,
    bcc: options.bcc,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
  };
  const result = await sendEmail(message);
  await updateDelivery(deliveryId, result, attempt);
  if (!options.skipLog) await logEmail(templateKey, options, result, attempt, deliveryId);
  return { result, deliveryId };
}

export async function sendTransactional<K extends EmailTemplateKey>(
  templateKey: K,
  params: Parameters<typeof EMAIL_TEMPLATES[K]>[0],
  options: SendEmailOptions,
): Promise<EmailResult> {
  const { result, deliveryId } = await deliver(templateKey, params, options, options.deliveryId ? 1 : 1);
  if (
    !isDelivered(result) &&
    result.provider !== "console" &&
    env().emailConfigured &&
    !options.suppressBackgroundRetry &&
    deliveryId
  ) {
    void retryInBackground(templateKey, params, { ...options, deliveryId }, 2);
  }
  return result;
}

async function retryInBackground(
  templateKey: string,
  params: unknown,
  options: SendEmailOptions,
  startAttempt: number,
): Promise<void> {
  for (let attempt = startAttempt; attempt <= MAX_ATTEMPTS; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, BACKOFF_MS[attempt - 2] ?? 60_000));
    const { result } = await deliver(templateKey, params, options, attempt);
    if (isDelivered(result)) return;
  }
}

/** Process durable due rows. Called only by the CRON_SECRET-protected route. */
export async function processPendingEmailDeliveries(limit = 25) {
  if (!env().emailConfigured) {
    const pending = await db.emailDelivery.count({
      where: { status: { in: ["PENDING", "RETRYING", "FAILED"] } },
    });
    return { scanned: 0, sent: 0, failed: 0, pending, configured: false };
  }

  const now = new Date();
  const rows = await db.emailDelivery.findMany({
    where: {
      status: { in: ["PENDING", "RETRYING", "FAILED"] },
      OR: [{ nextAttemptAt: null }, { nextAttemptAt: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: Math.max(1, Math.min(limit, 100)),
  });

  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    if (row.attempts >= row.maxAttempts) {
      failed++;
      continue;
    }
    try {
      const params = JSON.parse(row.payload) as unknown;
      const options = JSON.parse(row.options) as StoredOptions;
      const attempt = row.attempts + 1;
      await db.emailDelivery.update({ where: { id: row.id }, data: { status: "RETRYING" } });
      const delivery = await deliver(row.templateKey, params, {
        ...options,
        deliveryId: row.id,
        suppressBackgroundRetry: true,
      }, attempt);
      if (isDelivered(delivery.result)) sent++;
      else failed++;
    } catch (error) {
      failed++;
      await db.emailDelivery.update({
        where: { id: row.id },
        data: {
          status: "FAILED",
          lastError: error instanceof Error ? error.message : String(error),
          attempts: { increment: 1 },
        },
      }).catch(() => undefined);
    }
  }

  const pending = await db.emailDelivery.count({
    where: { status: { in: ["PENDING", "RETRYING"] } },
  });
  return { scanned: rows.length, sent, failed, pending, configured: true };
}

async function logEmail(
  templateKey: string,
  options: SendEmailOptions,
  result: EmailResult,
  attempt: number,
  deliveryId: string | null,
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: `email.${result.provider === "console" ? "previewed" : isDelivered(result) ? "sent" : "failed"}`,
        resource: "EmailDelivery",
        resourceId: deliveryId || result.messageId || templateKey,
        meta: JSON.stringify({
          template: templateKey,
          provider: result.provider,
          attempt,
          durationMs: result.durationMs,
          error: result.error || null,
          triggeredBy: options.triggeredBy || null,
        }),
        ipHash: options.ipHash || null,
      },
    });
  } catch {
    // A logging failure never changes delivery or the originating transaction.
  }
}
