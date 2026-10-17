import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { id, type } = json;

    if (!id) {
      return NextResponse.json({ success: false, message: "Item ID is required." }, { status: 400 });
    }

    if (type === "project") {
      const project = await db.project.update({
        where: { id },
        data: { visibility: "public", evidenceStatus: "verified" },
      });
      return NextResponse.json({ success: true, message: "Project published.", data: project });
    }

    const article = await db.article.update({
      where: { id },
      data: { status: "published", verificationStatus: "verified", publishedAt: new Date() },
    });

    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: "content.published",
        resource: "article",
        resourceId: id,
        meta: JSON.stringify({ title: article.title }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Article published live to public site.",
      data: article,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
