"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";

type Lead = {
  id: string;
  reference: string;
  type: string;
  status: string;
  currentChallenge: string | null;
  desiredOutcome: string | null;
  timeline: string | null;
  scope: string | null;
  existingSystem: string | null;
  preferredTime: string | null;
  privacyConsent: boolean;
  commsConsent: boolean;
  marketingConsent: boolean;
  createdAt: string;
  contact: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    organization: string | null;
    role: string | null;
    country: string | null;
    preferredChannel: string | null;
    source: string | null;
  };
};

type InquiriesPayload = { inquiries: Lead[]; pagination: { total: number } };
type Assessment = { score: number; present: string[]; missing: string[] };

function assess(lead: Lead): Assessment {
  const signals: { label: string; value: unknown; weight: number }[] = [
    { label: "privacy consent", value: lead.privacyConsent, weight: 10 },
    { label: "current challenge", value: lead.currentChallenge, weight: 15 },
    { label: "desired outcome", value: lead.desiredOutcome, weight: 15 },
    { label: "scope", value: lead.scope, weight: 10 },
    { label: "timeline", value: lead.timeline, weight: 10 },
    { label: "organization", value: lead.contact.organization, weight: 10 },
    { label: "role", value: lead.contact.role, weight: 5 },
    { label: "country", value: lead.contact.country, weight: 5 },
    { label: "preferred channel", value: lead.contact.preferredChannel, weight: 5 },
    { label: "existing system", value: lead.existingSystem, weight: 10 },
    { label: "contact phone", value: lead.contact.phone, weight: 5 },
  ];
  const present = signals.filter((signal) => Boolean(signal.value)).map((signal) => signal.label);
  const missing = signals.filter((signal) => !signal.value).map((signal) => signal.label);
  return { score: signals.reduce((total, signal) => total + (signal.value ? signal.weight : 0), 0), present, missing };
}

export default function LeadsPage() {
  const [payload, setPayload] = useState<InquiriesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch<InquiriesPayload>("/api/v1/admin/inquiries?pageSize=100")
      .then((response) => setPayload(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load leads."))
      .finally(() => setLoading(false));
  }, []);

  const leads = useMemo(() => (payload?.inquiries || [])
    .filter((item) => !["converted", "archived"].includes(item.status))
    .map((lead) => ({ lead, assessment: assess(lead) }))
    .sort((a, b) => b.assessment.score - a.assessment.score || new Date(b.lead.createdAt).getTime() - new Date(a.lead.createdAt).getTime()), [payload]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Lead Intelligence" subtitle="First-party inquiry completeness and consent signals—no scraping or hidden enrichment" />
      <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div><p className="font-semibold">Qualification scores describe record completeness, not a person’s worth or likelihood to buy.</p><p className="mt-1 text-xs">Scores use only fields the contact submitted or an authorized operator recorded. They do not use inferred demographics, external scraping, or automated decisions. Review context before taking action.</p></div>
      </div>
      <Card><CardContent className="p-0">
        {loading ? <p className="p-8 text-sm text-muted-foreground">Loading leads…</p> : leads.length === 0 ? (
          <p className="p-8 text-sm text-muted-foreground">No open inquiry leads are stored.</p>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[940px] text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Lead</th><th className="px-4 py-3">Intent</th><th className="px-4 py-3">Completeness</th><th className="px-4 py-3">Consent</th><th className="px-4 py-3">Next evidence</th><th className="px-4 py-3">Received</th></tr></thead>
            <tbody className="divide-y">{leads.map(({ lead, assessment }) => (
              <tr key={lead.id} className="align-top hover:bg-muted/20">
                <td className="px-4 py-4"><Link href={`/admin/inquiries?q=${encodeURIComponent(lead.reference)}`} className="font-medium text-blue-700 hover:underline">{lead.contact.fullName}</Link><div className="text-xs text-muted-foreground">{lead.contact.email}</div>{lead.contact.organization && <div className="text-xs text-muted-foreground">{lead.contact.organization}</div>}<div className="mt-1 font-mono text-[11px] text-muted-foreground">{lead.reference}</div></td>
                <td className="px-4 py-4"><div className="capitalize">{lead.type.replaceAll("-", " ")}</div><div className="mt-1 max-w-[260px] text-xs text-muted-foreground">{lead.desiredOutcome || "Outcome not provided"}{lead.timeline ? ` · ${lead.timeline}` : ""}</div><Badge variant="outline" className="mt-2">{lead.status}</Badge></td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><span className="text-lg font-bold tabular-nums">{assessment.score}</span><span className="text-xs text-muted-foreground">/ 100</span></div><div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${assessment.score >= 70 ? "bg-emerald-500" : assessment.score >= 40 ? "bg-amber-500" : "bg-slate-400"}`} style={{ width: `${assessment.score}%` }} /></div></td>
                <td className="px-4 py-4"><div className="space-y-1 text-xs"><Signal ok={lead.privacyConsent} label="Privacy" /><Signal ok={lead.commsConsent} label="Direct communications" /><Signal ok={lead.marketingConsent} label="Marketing" /></div></td>
                <td className="px-4 py-4"><p className="max-w-[220px] text-xs text-muted-foreground">{assessment.missing.length ? assessment.missing.slice(0, 3).join(", ") : "Core qualification fields present"}</p><Button asChild variant="link" size="sm" className="mt-1 h-auto p-0"><Link href={`/admin/inquiries?q=${encodeURIComponent(lead.reference)}`}>Review record <ArrowUpRight className="ml-1 h-3 w-3" /></Link></Button></td>
                <td className="px-4 py-4 text-xs text-muted-foreground">{fmtDate(lead.createdAt)}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </CardContent></Card>
    </div>
  );
}

function Signal({ ok, label }: { ok: boolean; label: string }) {
  return <div className={`flex items-center gap-1.5 ${ok ? "text-emerald-700" : "text-muted-foreground"}`}>{ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-3.5 w-3.5 rounded-full border" />}<span>{label}: {ok ? "yes" : "no"}</span></div>;
}
