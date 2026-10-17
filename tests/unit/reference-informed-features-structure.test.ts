import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), "utf8");

describe("reference-informed production features", () => {
  it("applies only allow-listed managed SEO keys to consumed public pages", () => {
    const managed = read("src/lib/managed-seo.ts");
    const api = read("src/app/api/v1/admin/seo/route.ts");
    expect(managed).toContain('"home" | "about" | "projects" | "articles" | "work-with-me"');
    expect(api).toContain("SEO_FIELDS");
    for (const page of [
      "src/app/page.tsx",
      "src/app/about/page.tsx",
      "src/app/projects/page.tsx",
      "src/app/insights/page.tsx",
      "src/app/work-with-me/page.tsx",
    ]) {
      expect(read(page)).toContain("managedMetadata");
    }
  });

  it("keeps redirects out of the sitemap and includes canonical/new routes", () => {
    const sitemap = read("src/app/sitemap.ts");
    expect(sitemap).not.toContain("`${siteUrl}/contact`");
    expect(sitemap).not.toContain("`${siteUrl}/expertise`");
    expect(sitemap).toContain("`${siteUrl}/work-with-me`");
    expect(sitemap).toContain("`${siteUrl}/higher-study/planner`");
  });

  it("provides source-authored diagrams and governed marketing workflows", () => {
    const architecture = read("src/app/admin/architecture/page.tsx");
    const marketing = read("src/app/admin/marketing-studio/page.tsx");
    expect(architecture).toContain("exportSvg");
    expect(architecture).toContain("exportEvidence");
    expect(architecture).toContain("AI approval lifecycle");
    expect(marketing).toContain("human approval");
    expect(marketing).toContain("/api/v1/admin/ai-tasks");
    expect(marketing).toContain("video-script-draft");
  });

  it("keeps the study planner private to the browser", () => {
    const planner = read("src/app/higher-study/planner/planner-client.tsx");
    expect(planner).toContain("localStorage");
    expect(planner).not.toContain("fetch(");
    expect(planner).not.toContain("/api/");
  });

  it("makes the web assistant real, explicit, and non-impersonating", () => {
    const widget = read("src/components/site/whatsapp/whatsapp-chat-widget.tsx");
    const advisor = read("src/components/site/sections/ai-advisor.tsx");
    const agent = read("src/lib/whatsapp/agent.ts");
    const route = read("src/app/api/v1/whatsapp/chat/route.ts");
    expect(widget).toContain("alaminn:open-ai-chat");
    expect(advisor).toContain("alaminn:open-ai-chat");
    expect(widget).toContain("Al-Amin&apos;s AI Assistant");
    expect(agent).toContain("it never impersonates him");
    expect(route).toContain('"verified_rules"');
    expect(route).toContain("randomBytes(8)");
  });

  it("persists email delivery state and retries without cancelling bookings", () => {
    const schema = read("prisma/schema.prisma");
    const queue = read("src/lib/email/queue.ts");
    const cron = read("src/app/api/cron/email-queue/route.ts");
    const booking = read("src/app/api/v1/meetings/route.ts");
    expect(schema).toContain("model EmailDelivery");
    for (const status of ["PENDING", "SENT", "FAILED", "RETRYING"]) {
      expect(schema).toContain(status);
    }
    expect(queue).toContain("processPendingEmailDeliveries");
    expect(cron).not.toContain("placeholder");
    expect(booking).toContain("Email delivery is pending");
    expect(booking).toContain('relatedType: "MeetingRequest"');
  });

  it("uses a portable generated client and refuses schema/provider drift", () => {
    const schema = read("prisma/schema.prisma");
    const generator = read("scripts/generate-prisma-client.mjs");
    const prisma = read("src/lib/prisma-client.ts");
    const env = read("src/lib/env.ts");
    expect(schema).toContain('engineType      = "client"');
    expect(generator).toContain("skipDownload: true");
    expect(prisma).toContain("PrismaLibSQL");
    expect(env).toContain('DATABASE_URL must use file:');
  });

  it("keeps all 61 admin pages inventoried without rejected scaffold text", () => {
    const inventory = read("ROUTE_INVENTORY.md");
    expect(inventory).toContain("## Admin pages (all 61)");
    expect(inventory).toContain("## API routes (all 174)");
    expect(inventory).toContain("No checked-in admin `page.tsx` contains");
  });
});
