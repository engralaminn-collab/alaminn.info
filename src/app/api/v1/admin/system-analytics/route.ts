import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { ok } from "@/lib/admin-api";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const guard = await requirePermission(req, "dashboard.view");
  if (guard.denied) return guard.response;
  const [contacts, inquiries, meetings, tasks, articles, projects, newsletters, aiTasks, auditLogs, emailContacts, emailCampaigns, emailEvents] = await Promise.all([
    db.contact.count(), db.inquiry.count(), db.meetingRequest.count(), db.task.count(),
    db.article.count(), db.project.count(), db.newsletterSubscriber.count(),
    db.aiTask.count(), db.auditLog.count(), db.emailContact.count(),
    db.emailCampaign.count(), db.emailEvent.count(),
  ]);
  return ok({
    contacts, inquiries, meetings, tasks, articles, projects, newsletters,
    aiTasks, auditLogs, emailContacts, emailCampaigns, emailEvents,
    totalRecords: contacts + inquiries + meetings + tasks + articles + projects + newsletters + aiTasks + auditLogs + emailContacts + emailCampaigns + emailEvents,
  }, "System analytics loaded.");
}
