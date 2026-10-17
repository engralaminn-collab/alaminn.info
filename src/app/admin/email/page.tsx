"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";

type RecordItem = {
  id: string;
  action: string;
  resource: string;
  resourceId: string | null;
  meta: Record<string, unknown>;
  createdAt: string;
};
type Payload = {
  configured: boolean;
  provider: string;
  counts: { sent: number; failed: number; pending: number; retrying: number; records: number };
  records: RecordItem[];
};

export default function EmailOperationsPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Payload>("/api/v1/admin/email-operations")
      .then((response) => setPayload(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load email operations."));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Email Operations" subtitle="Provider configuration and redacted, persisted delivery-attempt evidence" />
      {!payload ? <p className="py-16 text-sm text-muted-foreground">Loading email evidence…</p> : (
        <>
          <div className={`mb-5 flex items-center gap-3 rounded-xl border p-4 text-sm ${payload.configured ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            {payload.configured ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <div><p className="font-medium">{payload.configured ? `${payload.provider} is configured` : "No email transport is configured"}</p><p className="text-xs">Configuration is not delivery proof. Use the records below and provider logs to verify delivery.</p></div>
            <Link href="/admin/settings" className="ml-auto text-xs font-medium underline">Settings</Link>
          </div>
          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Sent" value={payload.counts.sent} />
            <Metric label="Pending" value={payload.counts.pending} />
            <Metric label="Retrying" value={payload.counts.retrying} />
            <Metric label="Failed" value={payload.counts.failed} />
            <Metric label="Delivery records" value={payload.counts.records} />
          </div>
          <Card><CardContent className="p-0">
            {payload.records.length === 0 ? <p className="p-8 text-sm text-muted-foreground">No email delivery attempts are recorded.</p> : (
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground"><tr><th className="px-4 py-3">Event</th><th className="px-4 py-3">Template / provider</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Time</th></tr></thead><tbody className="divide-y">
                {payload.records.map((record) => <tr key={record.id}><td className="px-4 py-3"><Badge variant="outline">{record.action}</Badge></td><td className="px-4 py-3"><div>{String(record.meta.template || "—")}</div><div className="text-xs text-muted-foreground">{String(record.meta.provider || "—")}{record.meta.attempt ? ` · attempt ${String(record.meta.attempt)}` : ""}</div>{record.meta.error ? <div className="mt-1 max-w-md text-xs text-red-700">{String(record.meta.error)}</div> : null}</td><td className="px-4 py-3 font-mono text-xs text-muted-foreground">{record.resourceId || "—"}</td><td className="px-4 py-3 text-muted-foreground">{fmtDate(record.createdAt)}</td></tr>)}
              </tbody></table></div>
            )}
          </CardContent></Card>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><Mail className="h-4 w-4 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-semibold">{value}</p></div></CardContent></Card>;
}
