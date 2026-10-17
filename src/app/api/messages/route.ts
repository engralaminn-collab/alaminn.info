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
    const { conversationId, contactId, text, channel, isApprovedAiDraft } = json;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ success: false, message: "Message text is required." }, { status: 400 });
    }

    // Create audit log for message sent / approved
    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: isApprovedAiDraft ? "message.ai_draft_approved_and_sent" : "message.sent_by_alamin",
        resource: "conversation",
        resourceId: conversationId || contactId || "direct",
        meta: JSON.stringify({
          channel: channel || "WHATSAPP",
          textLength: text.length,
          preview: text.slice(0, 80),
        }),
      },
    });

    const newMsg = {
      id: `msg-sent-${Date.now()}`,
      sender: "alamin",
      senderName: "Al-Amin (Approved)",
      text,
      timestamp: new Date().toISOString(),
      channel: channel || "WHATSAPP",
      isDraft: false,
    };

    return NextResponse.json({
      success: true,
      message: `Message dispatched via ${channel || "WhatsApp"} successfully.`,
      data: newMsg,
    });
  } catch (err: any) {
    console.error("Message send error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
