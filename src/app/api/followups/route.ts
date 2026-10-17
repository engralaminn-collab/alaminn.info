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
    const [openTasks, pendingInquiries, recentBookings] = await Promise.all([
      db.task.findMany({
        where: { status: "open" },
        include: { contact: true },
        orderBy: { dueDate: "asc" },
      }),
      db.inquiry.findMany({
        where: { status: "new" },
        include: { contact: true },
        orderBy: { createdAt: "desc" },
      }),
      db.meetingRequest.findMany({
        where: { status: "confirmed" },
        orderBy: { requestedDate: "asc" },
        take: 5,
      }),
    ]);

    const recommendations = [
      {
        id: "rec-unanswered",
        title: `${pendingInquiries.length} New Inquiries awaiting counselor response`,
        priority: "HIGH",
        count: pendingInquiries.length,
        items: pendingInquiries.map((inq) => ({
          contactName: inq.contact.fullName,
          email: inq.contact.email,
          timeElapsed: "Received recently",
          type: inq.type,
        })),
        suggestedAction: "Generate AI Draft & Dispatch via WhatsApp",
      },
      {
        id: "rec-upcoming-meetings",
        title: `${recentBookings.length} Upcoming Consultation Meetings scheduled this week`,
        priority: "MEDIUM",
        count: recentBookings.length,
        items: recentBookings.map((b) => ({
          studentName: b.contactName,
          date: b.requestedDate.toISOString().split("T")[0],
          time: b.requestedTime,
          type: b.meetingType,
        })),
        suggestedAction: "Send reminder & pre-meeting checklist",
      },
      {
        id: "rec-overdue",
        title: `${openTasks.length} Pipeline Tasks pending action`,
        priority: "HIGH",
        count: openTasks.length,
        items: openTasks.map((t) => ({
          title: t.title,
          priority: t.priority,
          contact: t.contact?.fullName || "General",
        })),
        suggestedAction: "Batch review & mark completed",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        totalRecommendations: recommendations.length,
        aiInsightSummary: `${pendingInquiries.length + openTasks.length} items need your attention today to maintain SLA under 24 hours.`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
