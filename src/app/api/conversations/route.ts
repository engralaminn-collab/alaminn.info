import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel"); // all | whatsapp | email | facebook | linkedin | website
  const status = searchParams.get("status");

  try {
    const contacts = await db.contact.findMany({
      include: {
        inquiries: true,
        referrals: true,
        notes: { take: 3 },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    const mockConversations = contacts.map((c, index) => {
      const channelTypes = ["WHATSAPP", "EMAIL", "FACEBOOK", "LINKEDIN", "WEBSITE"] as const;
      const assignedChannel = c.preferredChannel ? c.preferredChannel.toUpperCase() : channelTypes[index % channelTypes.length];
      
      const inquiry = c.inquiries[0];
      const referral = c.referrals[0];

      return {
        id: `conv-${c.id}`,
        contactId: c.id,
        contactName: c.fullName,
        contactEmail: c.email,
        contactPhone: c.whatsapp || c.phone || "+880 1716-609554",
        channel: assignedChannel,
        status: index === 0 ? "NEW" : index === 1 ? "WAITING" : "OPEN",
        lastMessage: inquiry?.currentChallenge || "Inquiring about September 2026 intake admissions & visa documentation.",
        lastSender: index % 2 === 0 ? "student" : "alamin",
        timestamp: c.updatedAt.toISOString(),
        unread: index < 2,
        aiSummary: `Student exploring ${c.country || "UK"} universities. IELTS 6.5. Needs scholarship verification.`,
        nextAction: "Review university shortlist and approve suggested WhatsApp draft reply.",
        studentProfile: {
          fullName: c.fullName,
          email: c.email,
          country: c.country || "United Kingdom",
          stage: referral?.stage || "COUNSELING",
          gpa: "3.50",
          englishTest: "IELTS 6.5",
        },
        messages: [
          {
            id: `msg-1-${c.id}`,
            sender: "student",
            senderName: c.fullName,
            text: inquiry?.currentChallenge || "Hello Al-Amin, I want to apply for Master's in UK for Sept 2026. Can you guide me on requirements?",
            timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
            channel: assignedChannel,
          },
          {
            id: `msg-2-${c.id}`,
            sender: "ai_draft",
            senderName: "AI Assistant Draft",
            text: `Hello ${c.fullName.split(" ")[0]}, thanks for reaching out to ALO Education! For Sept 2026 UK Master's, top options include Russell Group and modern universities with 1-year duration and 2-year Graduate Route. We can evaluate your CGPA and IELTS for scholarship eligibility. Would you like to schedule a 1-on-1 session?`,
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            isDraft: true,
            needsApproval: true,
            channel: assignedChannel,
          },
        ],
      };
    });

    let filtered = mockConversations;
    if (channel && channel !== "all") {
      filtered = filtered.filter((c) => c.channel.toLowerCase() === channel.toLowerCase());
    }
    if (status) {
      filtered = filtered.filter((c) => c.status === status);
    }

    return NextResponse.json({
      success: true,
      data: {
        conversations: filtered,
        total: filtered.length,
        unreadCount: filtered.filter((c) => c.unread).length,
      },
    });
  } catch (err: any) {
    console.error("Conversations API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
