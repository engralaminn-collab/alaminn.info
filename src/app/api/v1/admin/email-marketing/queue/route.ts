import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { ok, fail, readJson } from "@/lib/admin-api";
import { processCampaignQueue } from "@/lib/email-marketing";
import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "contacts.create");
  if (guard.denied) return guard.response;
  const body = await readJson<Record<string, unknown>>(req);
  if (!body?.campaignId) return fail("Campaign ID required.", ["campaign_id_required"], 422);
  const campaign = await db.emailCampaign.findUnique({ where: { id: String(body.campaignId) } });
  if (!campaign) return fail("Campaign not found.", ["not_found"], 404);
  if (campaign.status === "draft" || campaign.status === "scheduled") {
    const contacts = campaign.listId
      ? await db.emailContactList.findMany({ where: { listId: campaign.listId }, select: { contact: true } })
      : await db.emailContact.findMany({ where: { status: "active" } });
    const contactList = campaign.listId ? contacts.map(c => c.contact) : contacts;
    await db.emailCampaign.update({ where: { id: campaign.id }, data: { status: "sending", startedAt: new Date(), totalRecipients: contactList.length } });
    await db.emailQueueItem.createMany({
      data: contactList.map((c: { id: string; email: string; firstName?: string | null }) => ({
        campaignId: campaign.id, contactId: c.id, contactEmail: c.email, contactName: c.firstName,
      })),
      
    });
  }
  await processCampaignQueue(String(body.campaignId), 50);
  return ok({}, "Queue processed.");
}
