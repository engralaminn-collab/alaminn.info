import { NextResponse, type NextRequest } from "next/server";
import { verifyCronAuth } from "@/lib/cron-auth";
import { processPendingEmailDeliveries } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Retry durable PENDING/RETRYING/FAILED email deliveries.
 * Authentication is mandatory and provider credentials stay server-side.
 */
export async function GET(request: NextRequest) {
  const auth = verifyCronAuth(request);
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, message: "Unauthorized", data: null, meta: {}, errors: [auth.error] },
      { status: auth.status },
    );
  }

  try {
    const result = await processPendingEmailDeliveries(25);
    return NextResponse.json({
      success: true,
      message: result.configured
        ? "Durable email retry scan complete."
        : "Email transport is not configured; queued deliveries were preserved.",
      data: result,
      meta: { scannedAt: new Date().toISOString() },
      errors: [],
    });
  } catch (error) {
    console.error("[cron:email-queue] retry scan failed", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email retry scan failed; queued deliveries were preserved.",
        data: null,
        meta: {},
        errors: [error instanceof Error ? error.message : "unknown_error"],
      },
      { status: 500 },
    );
  }
}
