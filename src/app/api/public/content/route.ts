import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [articles, resources, caseStudies] = await Promise.all([
      db.article.findMany({
        where: { status: "published", verificationStatus: "verified" },
        orderBy: { publishedAt: "desc" },
        take: 20,
      }),
      db.resource.findMany({
        where: { status: "published" },
        take: 12,
      }),
      db.caseStudy.findMany({
        where: { evidenceStatus: "verified" },
        take: 10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        articles,
        resources,
        caseStudies,
        counts: {
          articles: articles.length,
          resources: resources.length,
          caseStudies: caseStudies.length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      data: {
        articles: [],
        resources: [],
        caseStudies: [],
        counts: { articles: 0, resources: 0, caseStudies: 0 },
      },
    });
  }
}
