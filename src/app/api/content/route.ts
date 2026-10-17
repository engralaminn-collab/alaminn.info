import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [articles, projects, caseStudies] = await Promise.all([
      db.article.findMany({ orderBy: { publishedAt: "desc" } }),
      db.project.findMany({ orderBy: { createdAt: "desc" } }),
      db.caseStudy.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        articles,
        projects,
        caseStudies,
        totalArticles: articles.length,
        totalProjects: projects.length,
        totalCaseStudies: caseStudies.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { title, summary, body, category, tags, status, verificationStatus } = json;

    if (!title || !summary || !body) {
      return NextResponse.json(
        { success: false, message: "Title, summary, and body are required." },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const article = await db.article.create({
      data: {
        slug: `${slug}-${Date.now().toString(36)}`,
        title,
        summary,
        body,
        category: category || "executive-leadership",
        tags: Array.isArray(tags) ? tags.join(", ") : tags || "leadership,operations",
        author: session.name,
        status: status || "draft",
        verificationStatus: verificationStatus || "verified",
        readingMinutes: Math.max(3, Math.ceil(body.split(" ").length / 200)),
      },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: "content.article_created",
        resource: "article",
        resourceId: article.id,
        meta: JSON.stringify({ title, status: article.status }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Content item created successfully.",
      data: article,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
