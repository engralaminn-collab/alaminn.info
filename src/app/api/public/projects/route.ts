import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await db.project.findMany({
      where: {
        visibility: "public",
        evidenceStatus: "verified",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        projects,
        total: projects.length,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json({
      success: true,
      data: {
        projects: [],
        total: 0,
      },
    });
  }
}
