"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { AlertTriangle, CheckCircle2, Loader2, RefreshCw, ShieldAlert } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  category: string;
  state: "VERIFIED" | "CONFIGURED_UNVERIFIED" | "NOT_CONFIGURED" | "NOT_IMPLEMENTED";
  implementation: "REAL" | "PARTIAL" | "NOT_IMPLEMENTED";
  officialApi: string;
  lastVerifiedAt: string | null;
  blocker: string | null;
  nextStep: string;
};

type Payload = { integrations: Integration[]; checkedAt: string };

const statusStyle: Record<Integration["state"], string> = {
  VERIFIED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CONFIGURED_UNVERIFIED: "border-amber-200 bg-amber-50 text-amber-900",
  NOT_CONFIGURED: "border-slate-200 bg-slate-50 text-slate-700",
  NOT_IMPLEMENTED: "border-red-200 bg-red-50 text-red-800",
};

export default function IntegrationsPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch<Payload>("/api/v1/admin/integrations");
      setPayload(response.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load integration status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (error && !payload) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="Integrations"
        subtitle="Truthful server-side status: configuration alone is not treated as a verified connection"
        actions={
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
            Refresh evidence
          </Button>
        }
      />

      <div className="mb-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Only official provider APIs are allowed. OAuth connect and publishing controls remain hidden until their backend, token encryption, callback validation, revocation, and provider test paths exist.
        </p>
      </div>

      {loading && !payload ? (
        <div className="flex items-center gap-2 py-16 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Checking server evidence…</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {payload?.integrations.map((integration) => (
            <Card key={integration.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{integration.category}</p>
                    <CardTitle className="mt-1 text-base">{integration.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className={statusStyle[integration.state]}>
                    {integration.state.replaceAll("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <dl className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="text-muted-foreground">Implementation</dt>
                  <dd>{integration.implementation}</dd>
                  <dt className="text-muted-foreground">Official API</dt>
                  <dd>{integration.officialApi}</dd>
                  <dt className="text-muted-foreground">Last verified</dt>
                  <dd>{integration.lastVerifiedAt ? fmtDate(integration.lastVerifiedAt) : "Never"}</dd>
                </dl>
                {integration.blocker ? (
                  <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{integration.blocker}</span>
                  </div>
                ) : (
                  <div className="flex gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Verified by a persisted successful provider event.</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground"><strong>Next:</strong> {integration.nextStep}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {payload && (
        <p className="mt-4 text-xs text-muted-foreground">Evidence checked {fmtDate(payload.checkedAt)}.</p>
      )}
    </div>
  );
}
