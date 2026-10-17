import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson, writeAudit, pagination } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "articles.view");
  if (guard.denied) return guard.response;
  const { skip, take } = pagination(req);
  const items = await db.article.findMany({ where: { category: "video-storyboard" }, orderBy: { publishedAt: "desc" }, skip, take });
  return ok({ items });
}
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "articles.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.title) return fail("Title required.", ["title_required"], 422);
  const created = await db.article.create({ data: { title: String(body.title), summary: body.description as string || "", body: body.scenes as string || "", category: "video-storyboard", status: "draft", slug: `storyboard-${Date.now()}` } });
  await writeAudit(guard.session, "storyboard.create", "article", created.id).catch(() => {});
  return ok({ item: created }, "Storyboard created.");
}
