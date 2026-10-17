import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Reports durable in-application notification state. It does not simulate a
 * push provider or claim that an external notification was delivered. */
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", data: null, meta: {}, errors: [auth.error] },
      { status: auth.status },
    );
  }

  try {
    const [unread, total, newest] = await Promise.all([
      db.notification.count({ where: { read: false } }),
      db.notification.count(),
      db.notification.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    ]);
    return NextResponse.json({
      success: true,
      message: "Durable notification state loaded.",
      data: { unread, total, newestAt: newest?.createdAt.toISOString() || null, externalPushProvider: "not_configured" },
      meta: { scannedAt: new Date().toISOString() },
      errors: [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Notification state check failed.", data: null, meta: {}, errors: [String(error)] },
      { status: 500 },
    );
  }
}
