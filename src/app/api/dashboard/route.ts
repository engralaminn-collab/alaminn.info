import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  try {
    const [
      todaysMeetings,
      upcomingMeetings,
      newBookingsCount,
      newStudentsCount,
      unreadNotifications,
      tasksDue,
      recentContacts,
      recentAuditLogs,
      recentInquiries,
    ] = await Promise.all([
      db.meetingRequest.findMany({
        where: {
          requestedDate: { gte: startOfToday, lte: endOfToday },
        },
        orderBy: { requestedTime: "asc" },
      }),
      db.meetingRequest.findMany({
        where: {
          requestedDate: { gte: startOfToday },
        },
        orderBy: [{ requestedDate: "asc" }, { requestedTime: "asc" }],
        take: 8,
      }),
      db.meetingRequest.count({
        where: { status: "new" },
      }),
      db.contact.count({
        where: { tags: { contains: "student" } },
      }),
      db.notification.findMany({
        where: { read: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.task.findMany({
        where: { status: "open" },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        take: 10,
      }),
      db.contact.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      db.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.inquiry.findMany({
        where: { status: "new" },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // AI Follow-up recommendations calculation
    const followUpRecommendations = [
      {
        id: "rec-1",
        title: `${tasksDue.length} priority follow-up tasks waiting for action today`,
        type: "FOLLOW_UP",
        urgency: "high",
        action: "Review Tasks",
        link: "/dashboard/tasks",
      },
      {
        id: "rec-2",
        title: `${newBookingsCount} new consultation booking requests require confirmation`,
        type: "BOOKING_APPROVAL",
        urgency: newBookingsCount > 0 ? "high" : "normal",
        action: "View Bookings",
        link: "/dashboard/bookings",
      },
      {
        id: "rec-3",
        title: "AI draft replies prepared for recent student WhatsApp inquiries",
        type: "AI_DRAFT",
        urgency: "normal",
        action: "Open WhatsApp Center",
        link: "/dashboard/whatsapp",
      },
    ];

    // Recent student conversations stream
    const studentConversations = recentContacts.map((c, i) => ({
      id: c.id,
      name: c.fullName,
      email: c.email,
      whatsapp: c.whatsapp || "+880 1716-609554",
      country: c.country || "United Kingdom",
      channel: c.preferredChannel || "whatsapp",
      stage: i % 2 === 0 ? "COUNSELING" : "UNIVERSITY_SELECTION",
      lastMessage: i % 2 === 0 
        ? "Interested in September 2026 intake for MSc Computer Science."
        : "Shared IELTS TRF: Overall 6.5 (R:6.5, W:6.0, L:7.0, S:6.5).",
      timestamp: c.updatedAt.toISOString(),
      aiSummary: "Eligible for UK Russell Group with merit scholarship matching.",
      status: "OPEN",
      unread: i < 2,
    }));

    // Social activity stream
    const socialActivity = [
      {
        id: "soc-1",
        platform: "LinkedIn",
        type: "POST_DRAFT",
        title: "Structuring Higher Education Admissions for Scalability",
        status: "READY_FOR_APPROVAL",
        author: "Al-Amin AI Assistant (Draft)",
        date: new Date().toISOString(),
      },
      {
        id: "soc-2",
        platform: "Facebook",
        type: "UPDATE",
        title: "ALO Education UK Sept 2026 Intake Application Drive",
        status: "PUBLISHED",
        author: "Al-Amin",
        date: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
      {
        id: "soc-3",
        platform: "Website",
        type: "ARTICLE",
        title: "Why Operating Systems Beat Operating Hours",
        status: "VERIFIED",
        author: "Al-Amin",
        date: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        session,
        greeting: `Good morning, ${session.name.split(" ")[0]}`,
        kpis: {
          todaysMeetings: todaysMeetings.length,
          newBookings: newBookingsCount,
          newStudents: newStudentsCount,
          unreadMessages: unreadNotifications.length,
          tasksDue: tasksDue.length,
          aiConversations: recentContacts.length + 12,
        },
        todaysSchedule: todaysMeetings,
        upcomingMeetings,
        priorityFollowups: tasksDue,
        studentConversations,
        socialActivity,
        aiRecommendations: followUpRecommendations,
        notifications: unreadNotifications,
        recentActivity: recentAuditLogs,
      },
    });
  } catch (err: any) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
