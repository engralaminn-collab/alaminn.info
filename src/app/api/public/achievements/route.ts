import { NextResponse } from "next/server";
import { VERIFIED_ACHIEVEMENTS } from "@/lib/career-data";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbImpacts = await db.impactRecord.findMany({
      where: { evidenceStatus: "verified" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        achievements: VERIFIED_ACHIEVEMENTS,
        verifiedImpacts: dbImpacts,
        total: VERIFIED_ACHIEVEMENTS.length + dbImpacts.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      data: {
        achievements: VERIFIED_ACHIEVEMENTS,
        verifiedImpacts: [],
        total: VERIFIED_ACHIEVEMENTS.length,
      },
    });
  }
}
