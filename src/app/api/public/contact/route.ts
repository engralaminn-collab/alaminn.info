import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const contactSchema = z.object({
  fullName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Valid email address is required"),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  organization: z.string().optional(),
  type: z.string().default("business-consultation"),
  message: z.string().min(5, "Message must be at least 5 characters long"),
  preferredTime: z.string().optional(),
  privacyConsent: z.boolean().optional().default(true),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = contactSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const resolvedFullName = data.fullName || data.name || "Contact";
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Upsert contact
    const contact = await db.contact.upsert({
      where: { email: data.email.toLowerCase() },
      update: {
        fullName: resolvedFullName,
        phone: data.phone || undefined,
        whatsapp: data.whatsapp || undefined,
        organization: data.organization || undefined,
        status: "active",
      },
      create: {
        fullName: resolvedFullName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        organization: data.organization || null,
        preferredChannel: data.whatsapp ? "whatsapp" : "email",
        status: "active",
        tags: "website-contact",
        source: data.utmSource || "website",
      },
    });

    const ref = `INQ-${Date.now().toString(36).toUpperCase()}`;

    // Create inquiry
    const inquiry = await db.inquiry.create({
      data: {
        reference: ref,
        type: data.type,
        contactId: contact.id,
        currentChallenge: data.message,
        desiredOutcome: "Direct contact inquiry submitted from website",
        preferredTime: data.preferredTime || null,
        privacyConsent: data.privacyConsent,
        utmSource: data.utmSource || "website",
        utmMedium: data.utmMedium || null,
        utmCampaign: data.utmCampaign || null,
        status: "new",
        ipHash: ip,
      },
    });

    // Create notification for Al-Amin Command Center
    await db.notification.create({
      data: {
        type: "NEW_MESSAGE",
        title: `New Inquiry from ${data.fullName}`,
        message: `${data.fullName} (${data.email}) sent a ${data.type} message: "${data.message.slice(0, 100)}..."`,
        link: `/dashboard/inbox`,
        read: false,
      },
    });

    // Create follow-up task
    await db.task.create({
      data: {
        title: `Follow up with ${data.fullName} on ${data.type}`,
        description: `Contact: ${data.email} | Phone/WhatsApp: ${data.whatsapp || data.phone || "N/A"}\nMessage: ${data.message}`,
        priority: "high",
        status: "open",
        contactId: contact.id,
        relatedType: "inquiry",
        relatedId: inquiry.id,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // due in 24 hours
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your message has been received. Al-Amin's team will get back to you within 24 hours.",
      data: {
        reference: ref,
        contactName: data.fullName,
        contactEmail: data.email,
      },
    });
  } catch (err: any) {
    console.error("Contact submission error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while submitting your inquiry. Please try again or reach out on WhatsApp.",
        errors: [err.message],
      },
      { status: 500 }
    );
  }
}
