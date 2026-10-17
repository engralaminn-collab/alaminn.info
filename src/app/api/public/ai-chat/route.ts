import { NextRequest, NextResponse } from "next/server";
import { processAiMessage } from "@/lib/ai-assistant-engine";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { sessionId, message } = json;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "A message string is required." },
        { status: 400 }
      );
    }

    const sid = sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const assistantReply = await processAiMessage(sid, message.trim());

    return NextResponse.json({
      success: true,
      sessionId: sid,
      data: assistantReply,
    });
  } catch (err: any) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while generating a response. Please try again.",
        errors: [err.message],
      },
      { status: 500 }
    );
  }
}
