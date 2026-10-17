import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const SEO_FIELDS: Record<string, { max: number; kind: "title" | "description" }> = {
  "seo.home.title": { max: 70, kind: "title" },
  "seo.home.description": { max: 180, kind: "description" },
  "seo.about.title": { max: 70, kind: "title" },
  "seo.about.description": { max: 180, kind: "description" },
  "seo.projects.title": { max: 70, kind: "title" },
  "seo.projects.description": { max: 180, kind: "description" },
  "seo.articles.title": { max: 70, kind: "title" },
  "seo.articles.description": { max: 180, kind: "description" },
  "seo.work-with-me.title": { max: 70, kind: "title" },
  "seo.work-with-me.description": { max: 180, kind: "description" },
};

/** GET /api/v1/admin/seo — only the public metadata override allow-list. */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.view");
  if (guard.denied) return guard.response;
  const settings = await db.setting.findMany({ where: { key: { in: Object.keys(SEO_FIELDS) } } });
  const map: Record<string, string> = {};
  for (const setting of settings) map[setting.key] = setting.value;
  return ok(map, "Managed metadata overrides loaded.", {
    appliedBy: "src/lib/managed-seo.ts",
    generatedRoutes: ["/robots.txt", "/sitemap.xml"],
  });
}

/** PUT /api/v1/admin/seo — update only metadata fields consumed by public pages. */
export async function PUT(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.update");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Invalid JSON body.");

  const entries = Object.entries(body);
  const unknown = entries.map(([key]) => key).filter((key) => !SEO_FIELDS[key]);
  if (unknown.length) return fail("Unsupported SEO setting key.", unknown, 422);
  if (!entries.length) return fail("At least one SEO field is required.", ["empty_update"], 422);

  const normalized: Record<string, string> = {};
  for (const [key, raw] of entries) {
    if (typeof raw !== "string") return fail(`${key} must be a string.`, ["invalid_type"], 422);
    const value = raw.trim();
    if (value.length > SEO_FIELDS[key].max) {
      return fail(`${key} exceeds ${SEO_FIELDS[key].max} characters.`, ["value_too_long"], 422);
    }
    normalized[key] = value;
  }

  try {
    await db.$transaction(
      Object.entries(normalized).map(([key, value]) =>
        db.setting.upsert({ where: { key }, update: { value }, create: { key, value } }),
      ),
    );
    await writeAudit(guard.session, "seo_metadata.update", "Setting", undefined, { keys: Object.keys(normalized) });
    return ok({ updated: Object.keys(normalized).length }, "Managed metadata saved.");
  } catch (cause) {
    return fail("Failed to save managed metadata.", [cause instanceof Error ? cause.message : "unknown_error"], 500);
  }
}
