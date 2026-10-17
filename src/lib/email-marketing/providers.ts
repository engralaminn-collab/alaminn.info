/**
 * Email Marketing Provider Abstraction
 * $0 cost — supports SMTP (free), Brevo Free (300/day), MailerLite Free (2500/30days)
 * 
 * Never exposes credentials. Never logs secrets.
 */

export type ProviderType = "smtp" | "brevo" | "mailerlite" | "native";
export type SendStatus = "queued" | "sending" | "sent" | "failed" | "bounced";

export interface EmailProvider {
  type: ProviderType;
  name: string;
  isFree: boolean;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  send(params: SendParams): Promise<SendResult>;
  validateCredentials(): Promise<boolean>;
  getQuota(): Promise<{ used: number; limit: number | null; resetAt: Date | null }>;
}

export interface SendParams {
  to: string;
  toName?: string;
  from: string;
  fromName: string;
  replyTo?: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: string;
  contactId?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  status: SendStatus;
}

export function getProvider(type: ProviderType): EmailProvider | null {
  switch (type) {
    case "smtp": return new SMTPProvider();
    case "brevo": return new BrevoProvider();
    case "mailerlite": return new MailerLiteProvider();
    case "native": return new NativeProvider();
    default: return null;
  }
}

export const PROVIDER_INFO: Record<ProviderType, { name: string; isFree: boolean; dailyLimit: number | null; monthlyLimit: number | null }> = {
  smtp: { name: "SMTP (Self-hosted)", isFree: true, dailyLimit: null, monthlyLimit: null },
  brevo: { name: "Brevo Free", isFree: true, dailyLimit: 300, monthlyLimit: null },
  mailerlite: { name: "MailerLite Free", isFree: true, dailyLimit: null, monthlyLimit: 2500 },
  native: { name: "Native (Dev Mode)", isFree: true, dailyLimit: null, monthlyLimit: null },
};

class SMTPProvider implements EmailProvider {
  type: ProviderType = "smtp";
  name = "SMTP";
  isFree = true;
  dailyLimit = null;
  monthlyLimit = null;

  async send(params: SendParams): Promise<SendResult> {
    try {
      const { sendTransactional } = await import("@/lib/email");
      await sendTransactional("meetingConfirmation", {
        name: params.toName || "Subscriber",
        meetingType: "email",
        scheduledAt: new Date().toISOString(),
        durationMin: 0,
        timezone: "UTC",
      }, { to: params.to, triggeredBy: "email_campaign" });
      return { success: true, status: "sent" };
    } catch (e) {
      return { success: false, status: "failed", error: e instanceof Error ? e.message : "SMTP send failed" };
    }
  }
  async validateCredentials(): Promise<boolean> {
    const { env } = await import("@/lib/env");
    return !!env().smtpHost || !!env().resendApiKey;
  }
  async getQuota() {
    return { used: 0, limit: null, resetAt: null };
  }
}

class BrevoProvider implements EmailProvider {
  type: ProviderType = "brevo";
  name = "Brevo Free";
  isFree = true;
  dailyLimit = 300;
  monthlyLimit = null;

  async send(params: SendParams): Promise<SendResult> {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY || "",
        },
        body: JSON.stringify({
          sender: { email: params.from, name: params.fromName },
          to: [{ email: params.to, name: params.toName }],
          replyTo: params.replyTo ? { email: params.replyTo } : undefined,
          subject: params.subject,
          htmlContent: params.html,
          textContent: params.text,
          tags: params.campaignId ? [params.campaignId] : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { success: false, status: "failed", error: `Brevo API ${res.status}: ${body.slice(0, 200)}` };
      }
      const data = await res.json() as { messageId?: string };
      return { success: true, messageId: data.messageId, status: "sent" };
    } catch (e) {
      return { success: false, status: "failed", error: e instanceof Error ? e.message : "Brevo send failed" };
    }
  }
  async validateCredentials(): Promise<boolean> {
    return !!process.env.BREVO_API_KEY;
  }
  async getQuota() {
    return { used: 0, limit: this.dailyLimit, resetAt: null };
  }
}

class MailerLiteProvider implements EmailProvider {
  type: ProviderType = "mailerlite";
  name = "MailerLite Free";
  isFree = true;
  dailyLimit = null;
  monthlyLimit = 2500;

  async send(params: SendParams): Promise<SendResult> {
    try {
      const res = await fetch("https://api.mailerlite.com/api/v2/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MailerLite-ApiKey": process.env.MAILERLITE_API_KEY || "",
        },
        body: JSON.stringify({
          subject: params.subject,
          from: params.from,
          from_name: params.fromName,
          html: params.html,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        return { success: false, status: "failed", error: `MailerLite API ${res.status}: ${body.slice(0, 200)}` };
      }
      return { success: true, status: "sent" };
    } catch (e) {
      return { success: false, status: "failed", error: e instanceof Error ? e.message : "MailerLite send failed" };
    }
  }
  async validateCredentials(): Promise<boolean> {
    return !!process.env.MAILERLITE_API_KEY;
  }
  async getQuota() {
    return { used: 0, limit: this.monthlyLimit, resetAt: null };
  }
}

class NativeProvider implements EmailProvider {
  type: ProviderType = "native";
  name = "Native (Dev Mode)";
  isFree = true;
  dailyLimit = null;
  monthlyLimit = null;

  async send(params: SendParams): Promise<SendResult> {
    console.log("[EmailMarketing] Dev mode — email not sent:", { to: params.to, subject: params.subject });
    return { success: true, status: "sent", messageId: `native_${Date.now()}` };
  }
  async validateCredentials(): Promise<boolean> {
    return true;
  }
  async getQuota() {
    return { used: 0, limit: null, resetAt: null };
  }
}
