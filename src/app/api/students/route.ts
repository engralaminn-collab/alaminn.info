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
  const stage = searchParams.get("stage");
  const country = searchParams.get("country");
  const search = searchParams.get("search");

  try {
    const contacts = await db.contact.findMany({
      where: {
        AND: [
          search
            ? {
                OR: [
                  { fullName: { contains: search } },
                  { email: { contains: search } },
                  { whatsapp: { contains: search } },
                ],
              }
            : {},
          country ? { country: { equals: country } } : {},
        ],
      },
      include: {
        referrals: true,
        inquiries: true,
        notes: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        tasks: {
          orderBy: { dueDate: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    const students = contacts.map((c) => {
      const referral = c.referrals[0];
      const inquiry = c.inquiries[0];

      return {
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone || c.whatsapp || "N/A",
        whatsapp: c.whatsapp || c.phone || "N/A",
        country: c.country || referral?.interestCountry || "United Kingdom",
        stage: referral?.stage || "COUNSELING",
        preferredProgram: referral?.interestProgram || "Postgraduate Studies",
        budget: "$15,000 - $25,000",
        englishTest: "IELTS 6.5",
        academicGpa: "CGPA 3.40 / 4.00",
        intake: "September 2026",
        notesCount: c.notes.length,
        tasksCount: c.tasks.length,
        notes: c.notes,
        tasks: c.tasks,
        inquiryScope: inquiry?.scope || null,
        updatedAt: c.updatedAt.toISOString(),
      };
    });

    // If stage filter is provided
    const filtered = stage ? students.filter((s) => s.stage === stage) : students;

    return NextResponse.json({
      success: true,
      data: {
        students: filtered,
        total: filtered.length,
        pipelineStages: [
          "NEW",
          "CONTACTED",
          "COUNSELING",
          "UNIVERSITY_SELECTION",
          "APPLICATION",
          "OFFER",
          "DEPOSIT",
          "VISA",
          "PRE_DEPARTURE",
          "ENROLLED",
          "LOST",
        ],
      },
    });
  } catch (err: any) {
    console.error("Students API error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { fullName, email, whatsapp, country, program, stage, notes } = json;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: "Name and email are required." },
        { status: 400 }
      );
    }

    const contact = await db.contact.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        fullName,
        whatsapp,
        country,
        status: "active",
        tags: "student,alo-education",
      },
      create: {
        fullName,
        email: email.toLowerCase().trim(),
        whatsapp,
        country,
        preferredChannel: "whatsapp",
        status: "active",
        tags: "student,alo-education",
        source: "command-center-manual",
      },
    });

    const referral = await db.studentReferral.create({
      data: {
        contactId: contact.id,
        studentName: fullName,
        interestCountry: country || "United Kingdom",
        interestProgram: program || "Higher Study Advisory",
        stage: stage || "NEW",
        consent: true,
      },
    });

    if (notes) {
      await db.note.create({
        data: {
          body: notes,
          contactId: contact.id,
          authorId: session.userId,
        },
      });
    }

    // Audit log
    await db.auditLog.create({
      data: {
        actorId: session.userId,
        action: "student.created",
        resource: "contact",
        resourceId: contact.id,
        meta: JSON.stringify({ studentName: fullName, stage }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student record successfully created.",
      data: { contact, referral },
    });
  } catch (err: any) {
    console.error("Student create error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
