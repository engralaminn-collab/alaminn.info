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
  const status = searchParams.get("status");

  try {
    const bookings = await db.meetingRequest.findMany({
      where: status ? { status } : {},
      orderBy: [{ requestedDate: "desc" }, { requestedTime: "desc" }],
      take: 100,
    });

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        total: bookings.length,
      },
    });
  } catch (err: any) {
    console.error("Bookings API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { id, status, notes, requestedDate, requestedTime } = json;

    if (!id) {
      return NextResponse.json({ success: false, message: "Booking ID is required." }, { status: 400 });
    }

    const updated = await db.meetingRequest.update({
      where: { id },
      data: {
        status: status ?? undefined,
        notes: notes ?? undefined,
        requestedDate: requestedDate ? new Date(requestedDate) : undefined,
        requestedTime: requestedTime ?? undefined,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: `booking.${status || "updated"}`,
        resource: "meetingRequest",
        resourceId: id,
        meta: JSON.stringify({ status, requestedDate, requestedTime }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking status updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    console.error("Booking update error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
