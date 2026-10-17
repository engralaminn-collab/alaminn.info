/**
 * Email Marketing System — Core library
 * Handles: template rendering, variable substitution, queue management,
 * campaign lifecycle, tracking, suppression checks.
 */

import { db } from "@/lib/db";

/** Replace {{variable}} placeholders in email content */
export function renderTemplate(html: string, variables: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => variables[key] || `{{${key}}}`);
}

/** Check if email is suppressed before sending */
export async function isSuppressed(email: string): Promise<boolean> {
  const suppressed = await db.emailSuppression.findUnique({ where: { email } }).catch(() => null);
  return !!suppressed;
}

/** Add to suppression list */
export async function suppressEmail(email: string, reason: string, source?: string): Promise<void> {
  await db.emailSuppression.upsert({
    where: { email },
    create: { email, reason, source },
    update: { reason, source },
  }).catch(() => {});
}

/** Create unsubscribe URL for a contact */
export function createUnsubscribeUrl(contactId: string, email: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alaminn.info";
  return `${baseUrl}/unsubscribe?c=${contactId}&e=${encodeURIComponent(email)}`;
}

/** Process campaign queue — called by cron */
export async function processCampaignQueue(campaignId: string, batchSize = 50): Promise<void> {
  const campaign = await db.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || campaign.status !== "sending") return;

  const queueItems = await db.emailQueueItem.findMany({
    where: { campaignId, status: "queued" },
    take: batchSize,
    orderBy: { createdAt: "asc" },
  });

  if (queueItems.length === 0) {
    await db.emailCampaign.update({ where: { id: campaignId }, data: { status: "sent", completedAt: new Date() } });
    return;
  }

  const { getProvider } = await import("./providers");
  const provider = getProvider((campaign.provider as "smtp" | "brevo" | "mailerlite" | "native") || "native");
  if (!provider) return;

  for (const item of queueItems) {
    const suppressed = await isSuppressed(item.contactEmail);
    if (suppressed) {
      await db.emailQueueItem.update({ where: { id: item.id }, data: { status: "failed", lastError: "Email suppressed" } });
      continue;
    }

    await db.emailQueueItem.update({ where: { id: item.id }, data: { status: "sending" } });

    const result = await provider.send({
      to: item.contactEmail,
      toName: item.contactName || undefined,
      from: campaign.fromEmail,
      fromName: campaign.fromName,
      subject: campaign.subject,
      html: campaign.htmlContent,
      text: campaign.textContent || undefined,
      campaignId,
      contactId: item.contactId,
    });

    if (result.success) {
      await db.emailQueueItem.update({
        where: { id: item.id },
        data: { status: "sent", sentAt: new Date(), messageId: result.messageId },
      });
      await db.emailEvent.create({
        data: {
          campaignId,
          contactId: item.contactId,
          contactEmail: item.contactEmail,
          eventType: "sent",
          messageId: result.messageId,
        },
      });
      await db.emailCampaign.update({
        where: { id: campaignId },
        data: { totalSent: { increment: 1 } },
      });
    } else {
      const attempts = item.attempts + 1;
      const nextRetry = attempts < 3 ? new Date(Date.now() + Math.pow(2, attempts) * 60000) : null;
      await db.emailQueueItem.update({
        where: { id: item.id },
        data: {
          status: attempts >= 3 ? "failed" : "queued",
          attempts,
          lastError: result.error,
          nextRetryAt: nextRetry,
        },
      });
      await db.emailCampaign.update({
        where: { id: campaignId },
        data: { totalFailed: { increment: 1 } },
      });
    }
  }
}

/** Get campaign stats from real DB */
export async function getCampaignStats(campaignId: string) {
  const [sent, delivered, bounced, opened, clicked, unsubscribed, failed] = await Promise.all([
    db.emailEvent.count({ where: { campaignId, eventType: "sent" } }),
    db.emailEvent.count({ where: { campaignId, eventType: "delivered" } }),
    db.emailEvent.count({ where: { campaignId, eventType: "bounce" } }),
    db.emailEvent.count({ where: { campaignId, eventType: "open" } }),
    db.emailEvent.count({ where: { campaignId, eventType: "click" } }),
    db.emailEvent.count({ where: { campaignId, eventType: "unsubscribe" } }),
    db.emailQueueItem.count({ where: { campaignId, status: "failed" } }),
  ]);
  return { sent, delivered, bounced, opened, clicked, unsubscribed, failed };
}

/** Get dashboard stats from real DB */
export async function getDashboardStats() {
  const [totalContacts, activeSubs, unsubscribed, suppressed, totalCampaigns, totalSent, totalBounced, totalOpened, totalClicked] = await Promise.all([
    db.emailContact.count(),
    db.emailContact.count({ where: { status: "active" } }),
    db.emailContact.count({ where: { status: "unsubscribed" } }),
    db.emailSuppression.count(),
    db.emailCampaign.count(),
    db.emailEvent.count({ where: { eventType: "sent" } }),
    db.emailEvent.count({ where: { eventType: "bounce" } }),
    db.emailEvent.count({ where: { eventType: "open" } }),
    db.emailEvent.count({ where: { eventType: "click" } }),
  ]);
  const deliveryRate = totalSent > 0 ? Math.round(((totalSent - totalBounced) / totalSent) * 100) : 0;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const bounceRate = totalSent > 0 ? Math.round((totalBounced / totalSent) * 100) : 0;
  return {
    totalContacts, activeSubs, unsubscribed, suppressed,
    totalCampaigns, totalSent, totalBounced, totalOpened, totalClicked,
    deliveryRate, openRate, clickRate, bounceRate,
  };
}
