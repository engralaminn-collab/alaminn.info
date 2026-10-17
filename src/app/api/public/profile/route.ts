import { NextResponse } from "next/server";
import { PROFILE, SOCIAL_LINKS } from "@/lib/site-data";
import { VERIFIED_CAREER_DATA } from "@/lib/career-data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      profile: PROFILE,
      verifiedRolesCount: VERIFIED_CAREER_DATA.filter((c) => c.verificationStatus === "VERIFIED").length,
      socialLinks: SOCIAL_LINKS,
      brand: {
        name: "Al-Amin",
        domain: "https://alaminn.info",
        business: "ALO Education",
        businessUrl: "https://aloeducation.com",
        location: "Dhaka, Bangladesh",
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  });
}
