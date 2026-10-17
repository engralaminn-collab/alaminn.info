import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("production-hardening source invariants", () => {
  it("records every required booking side effect before email delivery", () => {
    const route = read("src/app/api/v1/meetings/route.ts");
    expect(route).toContain("db.$transaction");
    expect(route).toContain("tx.meetingRequest.create");
    expect(route).toContain("tx.contact.upsert");
    expect(route).toContain("tx.inquiry.create");
    expect(route).toContain("tx.notification.create");
    expect(route).toContain("tx.task.create");
    expect(route).toContain("tx.analyticsEvent.create");
    expect(route).toContain("tx.auditLog.create");
    expect(route).toContain("slot_unavailable");
    expect(route).toContain("meeting.email_status");
    expect(route).toContain("engr.alaminn@gmail.com");
    expect(route.indexOf("db.$transaction")).toBeLessThan(route.indexOf("Promise.all(["));
  });

  it("keeps provider secrets out of the editable settings UI and fails closed for unconfigured email", () => {
    const page = read("src/app/admin/settings/page.tsx");
    const api = read("src/app/api/v1/admin/settings/route.ts");
    const testEmail = read("src/app/api/v1/admin/settings/test-email/route.ts");
    expect(page).not.toContain('key: "smtp.pass"');
    expect(api).toContain("EDITABLE_KEYS");
    expect(api).toContain("LEGACY_SECRET_KEYS");
    expect(testEmail).toContain("email_transport_not_configured");
    expect(testEmail).toContain("503");
  });

  it("verifies Meta webhook signatures and defaults AI sending to approval-required", () => {
    const webhook = read("src/app/api/v1/whatsapp/webhook/route.ts");
    const env = read("src/lib/env.ts");
    expect(webhook).toContain('x-hub-signature-256');
    expect(webhook).toContain('createHmac("sha256"');
    expect(webhook).toContain("timingSafeEqual");
    expect(webhook).toContain('cfg.aiMode !== "ACTIVE"');
    expect(env).toContain('process.env.WHATSAPP_AI_MODE || "APPROVAL_REQUIRED"');
  });

  it("keeps cron credentials out of query strings", () => {
    const cronAuth = read("src/lib/cron-auth.ts");
    expect(cronAuth).toContain('headers.get("x-cron-secret")');
    expect(cronAuth).not.toContain('searchParams.get("secret")');
  });

  it("uses the required AI identity and does not claim unverified WhatsApp connection", () => {
    const agent = read("src/lib/whatsapp/agent.ts");
    const config = read("src/lib/whatsapp/config.ts");
    expect(agent).toContain("Al-Amin's AI Assistant");
    expect(agent).not.toContain("Alaminn AI");
    expect(config).toContain("CONFIGURED_UNVERIFIED");
    expect(config).not.toContain('return "CONNECTED"');
  });

  it("provides every dedicated Command Center route", () => {
    const routes = [
      "calendar", "meetings", "bookings", "students", "leads", "inbox",
      "email", "whatsapp-ai", "facebook", "linkedin", "instagram",
      "social-media", "articles", "ai-assistant", "tasks", "follow-ups",
      "analytics", "notifications", "integrations", "settings", "security",
      "audit-logs",
    ];
    for (const route of routes) {
      expect(existsSync(resolve(root, `src/app/admin/${route}/page.tsx`)), route).toBe(true);
    }
  });
});
