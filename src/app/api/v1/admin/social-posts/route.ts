/**
 * Admin Social Posts API — list, create, update social media posts.
 * RBAC: requires `articles.view` for GET, `articles.create` for POST.
 */
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok, fail, pagination, readJson, writeAudit } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/admin/social-posts — list social posts with pagination.
 * Uses Article model with category "social-post" to store social media drafts.
 */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "articles.view");
  if (guard.denied) return guard.response;

  const { skip, take, page, pageSize } = pagination(req);
  const status = new URL(req.url).searchParams.get("status");
  const platform = new URL(req.url).searchParams.get("platform");

  const where: { category?: string; status?: string } = {};
  if (platform && platform !== "all") where.category = platform;
  else where.category = "social-post";
  if (status && status !== "all") where.status = status;

  try {
    const [posts, total] = await Promise.all([
      db.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        skip,
        take,
      }),
      db.article.count({ where }),
    ]);

    const formattedPosts = posts.map((p) => ({
      id: p.id,
      platform: p.category === "social-post" ? "website" : p.category,
      topic: p.title,
      content: p.summary || "",
      status: p.status,
      scheduledAt: p.publishedAt?.toISOString() || null,
      createdAt: p.publishedAt?.toISOString() || p.updatedAt.toISOString(),
    }));

    return ok(
      {
        posts: formattedPosts,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      },
      "Social posts loaded."
    );
  } catch (e) {
    console.error("[admin/social-posts GET] error", e);
    return fail("Internal error.", ["server_error"], 500);
  }
}

/**
 * POST /api/v1/admin/social-posts — create a new social post draft.
 */
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "articles.create");
  if (guard.denied) return guard.response;

  const body = await readJson(req);
  if (!body) return fail("Request body required.", ["body_required"], 400);
  if (!body.topic) return fail("Topic is required.", ["topic_required"], 422);

  try {
    const created = await db.article.create({
      data: {
        title: String(body.topic).trim(),
        summary: body.content ? String(body.content).trim() : "",
        body: body.content ? String(body.content).trim() : "",
        category: body.platform ? String(body.platform) : "social-post",
        status: "draft",
        slug: `social-post-${Date.now()}`,
      },
    });

    await writeAudit(guard.session, "social_post.create", "article", created.id, {
      platform: body.platform,
      topic: body.topic,
    });

    return ok({ post: created }, "Social post draft created.");
  } catch (e) {
    console.error("[admin/social-posts POST] error", e);
    return fail("Internal error.", ["server_error"], 500);
  }
}
