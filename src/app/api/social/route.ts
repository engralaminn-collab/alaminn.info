import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = [
      {
        id: "post-1",
        platform: "LINKEDIN",
        title: "Structuring Higher Education Admissions for Scalability",
        content:
          "In international education counseling, sustainable growth comes from clear stage-gates: profile verification, transparent requirement mapping, and ethical student guidance rather than sales pressure.",
        stage: "AI_REVIEW", // DRAFT | AI_REVIEW | ALAMIN_APPROVAL | PUBLISHED
        scheduledFor: "2026-10-20T10:00:00Z",
        category: "LEADERSHIP",
        aiCritique: "Factual tone is strong. No unsupported claims. Aligned with Al-Amin's executive voice.",
        author: "Al-Amin AI Assistant",
        createdAt: new Date().toISOString(),
      },
      {
        id: "post-2",
        platform: "FACEBOOK",
        title: "ALO Education Sept 2026 UK Intake Guidelines for Bangladeshi Students",
        content:
          "Planning for UK Master's or Bachelor's degrees? Understand post-study Graduate Route rules, university shortlisting strategy, and early-bird scholarship discounts with ALO Education.",
        stage: "ALAMIN_APPROVAL",
        scheduledFor: "2026-10-18T14:30:00Z",
        category: "STUDY_ABROAD",
        aiCritique: "Clear and compliant. Accurately references 2-year Graduate Route without making false visa guarantees.",
        author: "Al-Amin",
        createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      },
      {
        id: "post-3",
        platform: "LINKEDIN",
        title: "Why Operating Systems Beat Operating Hours in Scaling Service Businesses",
        content:
          "Heroics don't scale. Operating frameworks with documented accountability, CRM workflows, and governed automation allow teams to deliver consistent outcomes without burnout.",
        stage: "PUBLISHED",
        publishedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        category: "OPERATIONS",
        author: "Al-Amin",
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        engagement: { impressions: 1420, reactions: 84, comments: 19 },
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        posts,
        total: posts.length,
        channels: {
          linkedin: {
            connected: true,
            account: "Al-Amin (linkedin.com/in/al-aminn)",
            lastSynced: new Date().toISOString(),
          },
          facebook: {
            connected: true,
            pages: ["Al-Amin Official", "ALO Education"],
            lastSynced: new Date().toISOString(),
          },
          website: {
            connected: true,
            domain: "alaminn.info",
            status: "active",
          },
        },
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
    const { title, content, platform, category, stage } = json;

    if (!title || !content) {
      return NextResponse.json({ success: false, message: "Title and content are required." }, { status: 400 });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: "social.post_created",
        resource: "socialPost",
        resourceId: `post-${Date.now()}`,
        meta: JSON.stringify({ platform, title, stage: stage || "DRAFT" }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Social media post draft created.",
      data: {
        id: `post-${Date.now()}`,
        title,
        content,
        platform,
        category: category || "EDUCATION",
        stage: stage || "DRAFT",
        author: session.name,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
