import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/v1/admin/students — CRM contacts with student/referral evidence. */
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "student_referrals.view");
  if (guard.denied) return guard.response;

  const contacts = await db.contact.findMany({
    where: {
      OR: [
        { tags: { contains: "student" } },
        { referrals: { some: {} } },
        { inquiries: { some: { type: "education-advisory" } } },
      ],
    },
    include: {
      referrals: { orderBy: { createdAt: "desc" } },
      inquiries: {
        where: { type: "education-advisory" },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return ok(
    contacts.map((contact) => ({
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      whatsapp: contact.whatsapp,
      country: contact.country,
      status: contact.status,
      updatedAt: contact.updatedAt,
      referralCount: contact.referrals.length,
      inquiryCount: contact.inquiries.length,
      studyLevel: contact.inquiries[0]?.scope || null,
      destination: contact.inquiries[0]?.desiredOutcome || contact.referrals[0]?.interestCountry || null,
      intake: contact.inquiries[0]?.timeline || null,
      latestReference: contact.inquiries[0]?.reference || null,
    })),
    "Students loaded from CRM and referral records."
  );
}
