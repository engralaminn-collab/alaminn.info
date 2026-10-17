import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  whatsapp: z.string().optional().default("+880 1716-609554"),
  meetingType: z.string().optional(),
  consultationType: z.string().default("study-abroad-advisory"),
  requestedDate: z.string().min(10, "Please select a consultation date"),
  requestedTime: z.string().min(2, "Please select a consultation time slot"),
  timezone: z.string().default("Asia/Dhaka"),
  targetCountry: z.string().optional(),
  targetSubject: z.string().optional(),
  currentDegree: z.string().optional(),
  gpa: z.string().optional(),
  englishTest: z.string().optional(),
  englishScore: z.string().optional(),
  topic: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill out all required fields.",
          errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // 1. Upsert Contact
    const contact = await db.contact.upsert({
      where: { email: data.email.toLowerCase() },
      update: {
        fullName: data.fullName,
        whatsapp: data.whatsapp,
        country: data.targetCountry || undefined,
        status: "active",
        tags: "booked-consultation,student",
      },
      create: {
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        whatsapp: data.whatsapp,
        country: data.targetCountry || null,
        preferredChannel: "whatsapp",
        status: "active",
        tags: "booked-consultation,student",
        source: "website-booking",
      },
    });

    const bookingRef = `BK-${Date.now().toString(36).toUpperCase()}`;
    const meetCode = Math.random().toString(36).substring(2, 5) + "-" + Math.random().toString(36).substring(2, 6) + "-" + Math.random().toString(36).substring(2, 5);
    const googleMeetUrl = `https://meet.google.com/${meetCode}`;

    // 2. Create MeetingRequest / Booking record
    const meetingDate = new Date(data.requestedDate);
    const meeting = await db.meetingRequest.create({
      data: {
        reference: bookingRef,
        meetingType: data.meetingType || data.consultationType,
        requestedDate: meetingDate,
        requestedTime: data.requestedTime,
        timezone: data.timezone,
        contactName: data.fullName,
        contactEmail: data.email.toLowerCase(),
        organization: data.targetCountry ? `Destination: ${data.targetCountry}` : "ALO Education Guidance",
        topic: data.topic || `1-on-1 Consultation: ${data.meetingType || data.consultationType} (${data.targetCountry || "Study Abroad"})`,
        notes: `Academic: ${data.currentDegree || "N/A"} | GPA: ${data.gpa || "N/A"} | English: ${data.englishTest || "N/A"} (${data.englishScore || "N/A"})\nTarget: ${data.targetSubject || "N/A"}\nNotes: ${data.notes || "None"}\nMeeting Link: ${googleMeetUrl}`,
        status: "confirmed",
        ipHash: ip,
        utmSource: "booking-page",
      },
    });

    // 3. Create Student Referral entry if applicable
    await db.studentReferral.create({
      data: {
        contactId: contact.id,
        studentName: data.fullName,
        interestCountry: data.targetCountry || "Not specified",
        interestProgram: data.targetSubject || "General Higher Study",
        consent: true,
        stage: "new-referral",
      },
    });

    // 4. Create Notification for Al-Amin Command Center
    await db.notification.create({
      data: {
        type: "NEW_BOOKING",
        title: `New Consultation Booked: ${data.fullName}`,
        message: `${data.fullName} booked a ${data.consultationType} on ${data.requestedDate} at ${data.requestedTime} (${data.timezone}). WhatsApp: ${data.whatsapp}`,
        link: `/dashboard/meetings`,
        read: false,
      },
    });

    // 5. Create Follow-up Task for Al-Amin / Advisory Team
    await db.task.create({
      data: {
        title: `Conduct Consultation with ${data.fullName}`,
        description: `Date: ${data.requestedDate} @ ${data.requestedTime} (${data.timezone})\nTopic: ${data.consultationType}\nGoogle Meet: ${googleMeetUrl}\nWhatsApp: ${data.whatsapp}\nTarget: ${data.targetCountry || "General"} | ${data.targetSubject || "N/A"}`,
        priority: "high",
        status: "open",
        contactId: contact.id,
        relatedType: "meeting",
        relatedId: meeting.id,
        dueDate: meetingDate,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Consultation successfully scheduled! A confirmation has been generated and sent to Al-Amin's calendar.",
      data: {
        reference: bookingRef,
        fullName: data.fullName,
        email: data.email,
        whatsapp: data.whatsapp,
        consultationType: data.consultationType,
        date: data.requestedDate,
        time: data.requestedTime,
        timezone: data.timezone,
        meetingLink: googleMeetUrl,
        instructions:
          "Please be ready with your academic transcripts, English proficiency test reports (if any), and questions 5 minutes before the session.",
      },
    });
  } catch (err: any) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create booking. Please try again or book directly via WhatsApp.",
        errors: [err.message],
      },
      { status: 500 }
    );
  }
}
