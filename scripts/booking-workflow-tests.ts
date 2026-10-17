import { db } from "../src/lib/db";

const BASE = process.env.BOOKING_TEST_BASE || "http://127.0.0.1:3000";
const runId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
const email = `booking-test-${runId}@example.com`;
let meetingId: string | null = null;
let reference: string | null = null;

function fail(message: string): never {
  throw new Error(`[booking-workflow] ${message}`);
}

async function chooseSlot() {
  for (let offset = 3; offset <= 60; offset += 1) {
    const local = new Date(Date.now() + offset * 24 * 60 * 60_000);
    const date = local.toISOString().slice(0, 10);
    const scheduled = new Date(`${date}T09:00:00+06:00`);
    if (scheduled.getUTCDay() === 5) continue;
    const stored = new Date(`${date}T00:00:00+06:00`);
    const existing = await db.meetingRequest.findFirst({
      where: { requestedDate: stored, requestedTime: "09:00", status: { not: "cancelled" } },
      select: { id: true },
    });
    if (!existing) return date;
  }
  fail("No free deterministic test slot exists in the next 60 days.");
}

async function cleanup() {
  if (meetingId) {
    await db.emailDelivery.deleteMany({ where: { relatedType: "MeetingRequest", relatedId: meetingId } });
    await db.task.deleteMany({ where: { relatedType: "MeetingRequest", relatedId: meetingId } });
    await db.auditLog.deleteMany({ where: { resource: "MeetingRequest", resourceId: meetingId } });
    await db.meetingRequest.deleteMany({ where: { id: meetingId } });
  }
  if (reference) {
    await db.notification.deleteMany({ where: { link: { contains: reference } } });
    await db.analyticsEvent.deleteMany({ where: { meta: { contains: reference } } });
    await db.inquiry.deleteMany({ where: { reference: `${reference}-INQ` } });
  }
  await db.contact.deleteMany({ where: { email } });
}

async function main() {
  const health = await fetch(`${BASE}/api/health`).catch(() => null);
  if (!health?.ok) fail(`Application is not reachable at ${BASE}.`);

  const date = await chooseSlot();
  const response = await fetch(`${BASE}/api/v1/meetings`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 200 + 1)}` },
    body: JSON.stringify({
      meetingType: "education",
      requestedDate: date,
      requestedTime: "09:00",
      contactName: "Booking Workflow Test",
      contactEmail: email,
      whatsapp: "+8801700000000",
      country: "Bangladesh",
      studyLevel: "Masters",
      subject: "Computer Science",
      destination: "United Kingdom",
      intake: "September 2027",
      topic: "Automated transactional booking acceptance test",
      privacyConsent: true,
    }),
  });
  const envelope = await response.json() as {
    success?: boolean;
    message?: string;
    errors?: string[];
    data?: { id?: string; reference?: string; emailStatus?: string; calendarStatus?: string };
  };
  if (response.status !== 201 || !envelope.success || !envelope.data?.id || !envelope.data.reference) {
    fail(`Expected HTTP 201, received ${response.status}: ${JSON.stringify(envelope)}`);
  }
  meetingId = envelope.data.id;
  reference = envelope.data.reference;

  const [meeting, contact, inquiry, task, notifications, auditRows, deliveries] = await Promise.all([
    db.meetingRequest.findUnique({ where: { id: meetingId } }),
    db.contact.findUnique({ where: { email } }),
    db.inquiry.findUnique({ where: { reference: `${reference}-INQ` } }),
    db.task.findFirst({ where: { relatedType: "MeetingRequest", relatedId: meetingId } }),
    db.notification.findMany({ where: { link: { contains: reference } } }),
    db.auditLog.findMany({ where: { resource: "MeetingRequest", resourceId: meetingId } }),
    db.emailDelivery.findMany({ where: { relatedType: "MeetingRequest", relatedId: meetingId } }),
  ]);

  if (!meeting || !contact || !inquiry || !task) fail("Transactional meeting/CRM/follow-up records are incomplete.");
  if (notifications.length < 1) fail("No linked admin notification was created.");
  if (!auditRows.some((row) => row.action === "meeting.booking_created")) fail("Booking audit evidence is missing.");
  if (deliveries.length !== 2) fail(`Expected two durable email deliveries, found ${deliveries.length}.`);
  if (deliveries.some((row) => !["PENDING", "RETRYING", "SENT", "FAILED"].includes(row.status))) {
    fail("An email delivery has an invalid state.");
  }
  if (deliveries.some((row) => row.provider === "console" && row.status === "SENT")) {
    fail("A console preview was incorrectly marked SENT.");
  }
  if (envelope.data.calendarStatus !== "not_configured") fail("Calendar status fabricated a provider connection.");

  console.log("Booking workflow PASS", {
    reference,
    meeting: true,
    contact: true,
    inquiry: true,
    followUpTask: true,
    notifications: notifications.length,
    auditRows: auditRows.length,
    durableDeliveries: deliveries.map((row) => ({ status: row.status, provider: row.provider, attempts: row.attempts })),
    apiEmailStatus: envelope.data.emailStatus,
    calendarStatus: envelope.data.calendarStatus,
  });
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup().catch((error) => console.error("[booking-workflow] cleanup failed", error));
    await db.$disconnect();
  });
