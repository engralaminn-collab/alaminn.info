import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isCrossSiteMutation } from "@/lib/auth";
import { sendTransactional } from "@/lib/email";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const ADMIN_EMAIL = "engr.alaminn@gmail.com";
const TIMEZONE = "Asia/Dhaka";
const ALLOWED_TYPES = new Set(["discovery", "strategy", "partnership", "education"]);
const ALLOWED_TIMES = new Set([
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "20:00", "20:30", "21:00",
]);

const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;

function envelope(
  success: boolean,
  message: string,
  data: unknown,
  errors: string[],
  status: number
) {
  return NextResponse.json({ success, message, data, meta: {}, errors }, { status });
}

function ipHash(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function normalizeDate(value: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
}

function meetingLabel(type: string) {
  return type.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function reference() {
  return `ALM-MTG-${new Date().getUTCFullYear()}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

/**
 * POST /api/v1/meetings
 *
 * Public meeting-request endpoint. The database transaction records the
 * meeting, CRM contact/inquiry, notification, follow-up task, analytics event,
 * and audit event before any email is attempted. Email failure therefore never
 * loses a booking and is returned explicitly to the caller.
 */
export async function POST(req: NextRequest) {
  if (isCrossSiteMutation(req)) {
    return envelope(false, "Cross-site request rejected.", null, ["csrf_origin_rejected"], 403);
  }

  const hash = ipHash(req);
  const now = Date.now();
  const bucket = rateLimitMap.get(hash);
  if (bucket && now < bucket.reset && bucket.count >= RATE_MAX) {
    return envelope(false, "Too many requests. Please try again later.", null, ["rate_limited"], 429);
  }
  rateLimitMap.set(
    hash,
    bucket && now < bucket.reset
      ? { ...bucket, count: bucket.count + 1 }
      : { count: 1, reset: now + RATE_WINDOW_MS }
  );

  const contentLength = Number(req.headers.get("content-length") || "0");
  if (contentLength > 20_000) {
    return envelope(false, "Request body is too large.", null, ["payload_too_large"], 413);
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return envelope(false, "Invalid request body.", null, ["invalid_json"], 400);

  const meetingType = clean(body.meetingType, 40).toLowerCase();
  const requestedDate = normalizeDate(clean(body.requestedDate, 40));
  const requestedTime = clean(body.requestedTime, 5);
  const contactName = clean(body.contactName, 120);
  const contactEmail = clean(body.contactEmail, 254).toLowerCase();
  const whatsapp = clean(body.whatsapp, 40);
  const country = clean(body.country, 80);
  const studyLevel = clean(body.studyLevel, 100);
  const subject = clean(body.subject, 180);
  const destination = clean(body.destination, 100);
  const intake = clean(body.intake, 100);
  const organization = clean(body.organization, 160);
  const topic = clean(body.topic, 2_000);
  const privacyConsent = body.privacyConsent === true;

  const errors: string[] = [];
  if (!ALLOWED_TYPES.has(meetingType)) errors.push("meetingType must be one of discovery, strategy, partnership, or education");
  if (!requestedDate) errors.push("requestedDate must be a valid date");
  if (!ALLOWED_TIMES.has(requestedTime)) errors.push("requestedTime is not an available slot");
  if (contactName.length < 2) errors.push("contactName must be at least 2 characters");
  if (!validEmail(contactEmail)) errors.push("contactEmail must be a valid email address");
  if (!privacyConsent) errors.push("privacyConsent is required");

  let scheduledAt: Date | null = null;
  if (requestedDate && ALLOWED_TIMES.has(requestedTime)) {
    scheduledAt = new Date(`${requestedDate}T${requestedTime}:00+06:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      errors.push("The selected date and time are invalid");
      scheduledAt = null;
    } else {
      const leadTimeMs = scheduledAt.getTime() - Date.now();
      if (leadTimeMs < 60 * 60_000) errors.push("The selected slot must be at least one hour from now");
      if (leadTimeMs > 90 * 24 * 60 * 60_000) errors.push("The selected slot must be within 90 days");
      if (scheduledAt.getUTCDay() === 5) errors.push("Friday is unavailable for meetings");
    }
  }

  if (errors.length || !scheduledAt || !requestedDate) {
    return envelope(false, "Please correct the highlighted fields.", null, errors, 422);
  }

  const bookingReference = reference();
  // A deterministic ID provides database-level race protection for a slot even
  // though the legacy schema does not yet have a unique scheduledAt column.
  const slotId = `slot_${createHash("sha256").update(scheduledAt.toISOString()).digest("hex").slice(0, 24)}`;
  const meetingTypeLabel = meetingLabel(meetingType);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(scheduledAt);

  let meeting: { id: string; reference: string };
  try {
    meeting = await db.$transaction(async (tx) => {
      const storedRequestedDate = new Date(`${requestedDate}T00:00:00+06:00`);
      const existingSlot = await tx.meetingRequest.findFirst({
        where: {
          requestedDate: storedRequestedDate,
          requestedTime,
          status: { not: "cancelled" },
        },
        select: { id: true },
      });
      if (existingSlot) throw new Error(`slot_unavailable:${slotId}`);

      const contact = await tx.contact.upsert({
        where: { email: contactEmail },
        update: {
          fullName: contactName,
          whatsapp: whatsapp || undefined,
          country: country || undefined,
          organization: organization || undefined,
          preferredChannel: whatsapp ? "whatsapp" : undefined,
        },
        create: {
          fullName: contactName,
          email: contactEmail,
          whatsapp: whatsapp || null,
          country: country || null,
          organization: organization || null,
          preferredChannel: whatsapp ? "whatsapp" : "email",
          source: "meeting-booking",
          tags: meetingType === "education" ? "meeting,student" : "meeting,lead",
        },
      });

      await tx.inquiry.create({
        data: {
          reference: `${bookingReference}-INQ`,
          type: meetingType === "education" ? "education-advisory" : "business-consultation",
          contactId: contact.id,
          currentChallenge: subject || topic || null,
          desiredOutcome: destination || null,
          timeline: intake || null,
          scope: studyLevel || meetingTypeLabel,
          preferredTime: `${requestedDate} ${requestedTime} ${TIMEZONE}`,
          notes: topic || null,
          privacyConsent: true,
          commsConsent: false,
          marketingConsent: false,
          studentDataConsent: meetingType === "education",
          status: "new",
          ipHash: hash,
        },
      });

      const created = await tx.meetingRequest.create({
        data: {
          id: slotId,
          reference: bookingReference,
          meetingType,
          requestedDate: storedRequestedDate,
          requestedTime,
          timezone: TIMEZONE,
          contactName,
          contactEmail,
          organization: organization || null,
          topic: topic || subject || null,
          status: "new",
          ipHash: hash,
        },
        select: { id: true, reference: true },
      });

      await tx.notification.create({
        data: {
          type: "meeting",
          title: "New meeting request",
          message: `${contactName} requested ${meetingTypeLabel} on ${dateLabel} at ${requestedTime}.`,
          link: `/admin/meetings?booking=${encodeURIComponent(bookingReference)}`,
        },
      });

      await tx.task.create({
        data: {
          title: `Follow up: ${contactName} (${bookingReference})`,
          description: `Review and confirm the ${meetingTypeLabel} request for ${dateLabel} at ${requestedTime} ${TIMEZONE}.`,
          dueDate: new Date(Date.now() + 24 * 60 * 60_000),
          priority: "high",
          status: "open",
          contactId: contact.id,
          relatedType: "MeetingRequest",
          relatedId: created.id,
        },
      });

      await tx.analyticsEvent.create({
        data: {
          eventName: "meeting_requested",
          page: "/",
          ipHash: hash,
          meta: JSON.stringify({
            meetingType,
            reference: bookingReference,
            requestedDate,
            requestedTime,
          }),
        },
      });

      await tx.auditLog.create({
        data: {
          action: "meeting.booking_created",
          resource: "MeetingRequest",
          resourceId: created.id,
          meta: JSON.stringify({
            reference: bookingReference,
            meetingType,
            requestedDate,
            requestedTime,
            timezone: TIMEZONE,
          }),
          ipHash: hash,
        },
      });

      return created;
    });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code === "P2002" || (error instanceof Error && error.message.includes(slotId))) {
      return envelope(false, "That meeting slot has just been booked. Please choose another time.", null, ["slot_unavailable"], 409);
    }
    console.error("[meetings] transaction failed", error);
    return envelope(false, "Unable to save the meeting request.", null, ["database_error"], 500);
  }

  const adminSetting = await db.setting.findUnique({ where: { key: "booking.notificationEmail" } }).catch(() => null);
  const configuredAdminEmail = adminSetting?.value?.trim().toLowerCase();
  const adminEmail = configuredAdminEmail && validEmail(configuredAdminEmail)
    ? configuredAdminEmail
    : ADMIN_EMAIL;

  const [studentResult, adminResult] = await Promise.all([
    sendTransactional(
      "meetingRequestReceived",
      {
        name: contactName,
        reference: bookingReference,
        meetingType: meetingTypeLabel,
        requestedDate: dateLabel,
        requestedTime,
        timezone: TIMEZONE,
      },
      {
        to: contactEmail,
        ipHash: hash,
        triggeredBy: `meeting:${meeting.id}:student`,
        relatedType: "MeetingRequest",
        relatedId: meeting.id,
      }
    ),
    sendTransactional(
      "meetingBookedInternal",
      {
        studentName: contactName,
        email: contactEmail,
        whatsapp: whatsapp || null,
        country: country || null,
        studyLevel: studyLevel || null,
        subject: subject || null,
        destination: destination || null,
        intake: intake || null,
        meetingType: meetingTypeLabel,
        date: dateLabel,
        time: requestedTime,
        timezone: TIMEZONE,
        bookingReference,
        meetingLink: null,
        studentMessage: topic || null,
        createdAt: new Date().toISOString(),
        adminUrl: `${env().siteUrl}/admin/meetings?booking=${encodeURIComponent(bookingReference)}`,
        studentUrl: `${env().siteUrl}/admin/students?email=${encodeURIComponent(contactEmail)}`,
        calendarUrl: `${env().siteUrl}/admin/calendar?booking=${encodeURIComponent(bookingReference)}`,
        contactUrl: `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(`Meeting ${bookingReference}`)}`,
      },
      {
        to: adminEmail,
        ipHash: hash,
        triggeredBy: `meeting:${meeting.id}:admin`,
        relatedType: "MeetingRequest",
        relatedId: meeting.id,
      }
    ),
  ]);

  const isDelivered = (result: typeof studentResult) =>
    result.success && (result.provider === "smtp" || result.provider === "resend");
  const studentDelivered = isDelivered(studentResult);
  const adminDelivered = isDelivered(adminResult);

  await db.auditLog.create({
    data: {
      action: "meeting.email_status",
      resource: "MeetingRequest",
      resourceId: meeting.id,
      meta: JSON.stringify({
        student: studentDelivered ? "sent" : studentResult.provider === "console" ? "preview_only" : "failed",
        admin: adminDelivered ? "sent" : adminResult.provider === "console" ? "preview_only" : "failed",
        studentProvider: studentResult.provider,
        adminProvider: adminResult.provider,
        studentMessageId: studentResult.messageId || null,
        adminMessageId: adminResult.messageId || null,
      }),
      ipHash: hash,
    },
  }).catch(() => null);

  if (!studentDelivered || !adminDelivered) {
    await db.notification.create({
      data: {
        type: "email_failure",
        title: "Booking email requires attention",
        message: `${bookingReference}: student ${studentDelivered ? "sent" : "not delivered"}; admin ${adminDelivered ? "sent" : "not delivered"}. Check Email Operations and retry after configuring transport.`,
        link: `/admin/meetings?booking=${encodeURIComponent(bookingReference)}`,
      },
    }).catch(() => null);
  }

  return envelope(
    true,
    studentDelivered
      ? "Meeting request received. A receipt was sent by email."
      : "Meeting request received. Email delivery is pending; keep your reference number.",
    {
      id: meeting.id,
      reference: meeting.reference,
      status: "new",
      emailStatus: studentDelivered ? "sent" : "pending",
      calendarStatus: "not_configured",
    },
    [],
    201
  );
}
