import { NextResponse } from "next/server";
import { VERIFIED_CAREER_DATA } from "@/lib/career-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicExperience = VERIFIED_CAREER_DATA.filter(
    (item) => item.visibility === "PUBLIC" && item.verificationStatus === "VERIFIED"
  );

  return NextResponse.json({
    success: true,
    data: {
      experiences: publicExperience,
      totalVerified: publicExperience.length,
    },
    meta: {
      timestamp: new Date().toISOString(),
      governance: "Truth & Verification Standard — only VERIFIED records are publicly exposed",
    },
  });
}
