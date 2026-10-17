"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { toast } from "sonner";
import { AlertTriangle, Check, ClipboardCopy, Download, ExternalLink, Loader2, Megaphone, ShieldCheck } from "lucide-react";

type CampaignType = {
  id: string;
  label: string;
  workflow: string;
  deliverable: string;
  checks: string[];
};

const CAMPAIGN_TYPES: CampaignType[] = [
  { id: "campaign-plan", label: "Integrated campaign plan", workflow: "marketing-campaign-plan", deliverable: "A channel-by-channel plan with positioning, sequence, measurement, risks, and review gates.", checks: ["One audience and one primary outcome", "UTM naming included", "No unsupported result claims"] },
  { id: "seo", label: "SEO content brief", workflow: "seo-article-draft", deliverable: "A search-intent brief and draft with internal-link and structured-data recommendations.", checks: ["Search intent is explicit", "Sources required for factual claims", "No keyword stuffing"] },
  { id: "linkedin", label: "LinkedIn authority post", workflow: "executive-linkedin-post", deliverable: "A concise executive post with hook, evidence boundary, practical insight, and response prompt.", checks: ["Sounds like Al Aminn", "No fabricated achievements", "Publishing stays manual"] },
  { id: "email", label: "Email nurture sequence", workflow: "email-campaign-draft", deliverable: "A consent-aware sequence with subject lines, body copy, spacing, CTA, and unsubscribe reminder.", checks: ["Audience has lawful consent", "Sender identity is clear", "Unsubscribe path is preserved"] },
  { id: "message", label: "WhatsApp / SMS sequence", workflow: "messaging-campaign-draft", deliverable: "A short opt-in message sequence designed for an official provider API and human approval.", checks: ["Explicit opt-in exists", "Quiet hours and frequency are set", "STOP / opt-out language included"] },
  { id: "video", label: "Video production brief", workflow: "video-script-draft", deliverable: "A production-ready script, shot list, captions, accessibility notes, and export specification—not a generated video.", checks: ["Rights for assets are documented", "Captions and transcript included", "Visual claims match evidence"] },
  { id: "lead-magnet", label: "Education lead magnet", workflow: "resource-checklist", deliverable: "A practical, evidence-bounded checklist that points readers to the Higher Study planning journey.", checks: ["No visa/admission guarantee", "Dates and fees need official-source review", "ALO Education handoff is transparent"] },
  { id: "partnership", label: "University partnership kit", workflow: "partnership-proposal", deliverable: "A proposal outline, one-page narrative, evidence checklist, and follow-up sequence.", checks: ["Roles are not overstated", "Outcomes are measurable", "Sensitive terms stay internal"] },
];

const AUDIENCES = ["Prospective students", "University partners", "Education-sector leaders", "Operations leaders", "CRM and AI decision-makers", "Newsletter subscribers"];
const CHANNELS = ["Website", "LinkedIn", "Email", "WhatsApp (opt-in only)", "SMS (opt-in only)", "YouTube / short video", "Partnership outreach"];

function saveFile(name: string, value: string) {
  const href = URL.createObjectURL(new Blob([value], { type: "text/markdown;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function MarketingStudioPage() {
  const [typeId, setTypeId] = useState(CAMPAIGN_TYPES[0].id);
  const [campaignName, setCampaignName] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [objective, setObjective] = useState("");
  const [offer, setOffer] = useState("");
  const [cta, setCta] = useState("");
  const [evidence, setEvidence] = useState("");
  const [constraints, setConstraints] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const selected = CAMPAIGN_TYPES.find((type) => type.id === typeId) || CAMPAIGN_TYPES[0];

  const brief = useMemo(() => `# ${campaignName.trim() || "Untitled campaign"}\n\n## Governance\nThis is a draft brief for Al-Amin’s AI Assistant. Output must remain unpublished until an authorized human approves it. Do not invent facts, credentials, partnerships, dates, prices, deadlines, outcomes, quotations, or sources.\n\n## Deliverable\n${selected.label}: ${selected.deliverable}\n\n## Audience\n${audience}\n\n## Primary channel\n${channel}\n\n## Objective\n${objective.trim() || "Not supplied"}\n\n## Offer or core message\n${offer.trim() || "Not supplied"}\n\n## Primary call to action\n${cta.trim() || "Not supplied"}\n\n## Approved evidence and claims\n${evidence.trim() || "No approved evidence supplied. Use placeholders and explicitly request source verification."}\n\n## Constraints\n${constraints.trim() || "No additional constraints supplied."}\n\n## Required quality checks\n${selected.checks.map((check) => `- [ ] ${check}`).join("\n")}\n- [ ] Accessibility, consent, privacy, brand, and link review completed\n- [ ] Any external communication has explicit human approval\n`, [audience, campaignName, channel, constraints, cta, evidence, objective, offer, selected]);

  const ready = Boolean(campaignName.trim() && objective.trim() && offer.trim() && cta.trim());

  async function queueDraft() {
    if (!ready) {
      toast.error("Campaign name, objective, core message, and CTA are required.");
      return;
    }
    setSubmitting(true);
    try {
      await adminFetch("/api/v1/admin/ai-tasks", {
        method: "POST",
        body: JSON.stringify({
          workflow: selected.workflow,
          objective: `${selected.label}: ${objective.trim()}`,
          prompt: brief,
          sensitivity: channel.includes("Partnership") ? "confidential" : "internal",
          approvalRequired: true,
          project: campaignName.trim(),
        }),
      });
      toast.success("Draft task queued. Generation and publication are not implied; human approval remains mandatory.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not queue the draft.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(brief);
      toast.success("Brief copied.");
    } catch {
      toast.error("Clipboard access was denied. Download the brief instead.");
    }
  }

  return (
    <div>
      <PageHeader
        title="Marketing Studio"
        subtitle="Evidence-first campaign briefs routed through governed AI drafting and human approval"
        actions={<Button asChild variant="outline"><Link href="/admin/approvals">Review approvals <ExternalLink className="ml-1 h-4 w-4" /></Link></Button>}
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div><p className="font-semibold">This studio creates briefs and queues draft tasks; it does not publish, send, scrape, or render video.</p><p className="mt-1 text-xs">Email, WhatsApp, SMS, social, ads, video rendering, and external research need separately verified official provider connections. No connection is inferred from selecting a channel.</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Megaphone className="h-4 w-4" /> Campaign brief</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="campaign-type">Deliverable</Label><Select value={typeId} onValueChange={setTypeId}><SelectTrigger id="campaign-type"><SelectValue /></SelectTrigger><SelectContent>{CAMPAIGN_TYPES.map((type) => <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>)}</SelectContent></Select><p className="text-xs text-muted-foreground">{selected.deliverable}</p></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="campaign-name">Campaign name *</Label><Input id="campaign-name" value={campaignName} onChange={(event) => setCampaignName(event.target.value)} maxLength={160} placeholder="e.g. UK postgraduate planning guide" /></div>
              <div className="space-y-2"><Label htmlFor="audience">Audience</Label><Select value={audience} onValueChange={setAudience}><SelectTrigger id="audience"><SelectValue /></SelectTrigger><SelectContent>{AUDIENCES.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="channel">Primary channel</Label><Select value={channel} onValueChange={setChannel}><SelectTrigger id="channel"><SelectValue /></SelectTrigger><SelectContent>{CHANNELS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="objective">Measurable objective *</Label><Textarea id="objective" rows={2} value={objective} onChange={(event) => setObjective(event.target.value)} maxLength={500} placeholder="What should change, for whom, and how will a human measure it?" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="offer">Offer or core message *</Label><Textarea id="offer" rows={3} value={offer} onChange={(event) => setOffer(event.target.value)} maxLength={1500} placeholder="Describe the actual value without guarantees or inflated claims." /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="cta">Primary call to action *</Label><Input id="cta" value={cta} onChange={(event) => setCta(event.target.value)} maxLength={240} placeholder="e.g. Build your private study roadmap" /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="evidence">Approved evidence and sources</Label><Textarea id="evidence" rows={3} value={evidence} onChange={(event) => setEvidence(event.target.value)} maxLength={4000} placeholder="List verified facts, repository records, official URLs, or approved metrics. Empty means placeholders only." /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="constraints">Brand, legal, timing, and accessibility constraints</Label><Textarea id="constraints" rows={2} value={constraints} onChange={(event) => setConstraints(event.target.value)} maxLength={2000} placeholder="Words to avoid, due date, required disclosures, format limits…" /></div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={queueDraft} disabled={!ready || submitting}>{submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-1 h-4 w-4" />} Queue governed draft</Button>
              <Button variant="outline" onClick={copyBrief}><ClipboardCopy className="mr-1 h-4 w-4" /> Copy brief</Button>
              <Button variant="outline" onClick={() => saveFile(`${(campaignName || "campaign").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "campaign"}-brief.md`, brief)}><Download className="mr-1 h-4 w-4" /> Download .md</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Preflight checks</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selected.checks.map((item) => <div key={item} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>{item}</span></div>)}
              <div className="flex gap-2 border-t pt-3 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><span>Accessibility, consent, privacy, brand, and link review before release</span></div>
              <Badge variant={evidence.trim() ? "secondary" : "destructive"}>{evidence.trim() ? "Evidence supplied for review" : "No approved evidence supplied"}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Generated brief preview</CardTitle></CardHeader>
            <CardContent><pre className="max-h-[620px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-slate-100">{brief}</pre></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
