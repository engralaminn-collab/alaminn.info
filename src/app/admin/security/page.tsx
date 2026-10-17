"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";

type Payload = {
  controls: Record<string, boolean | number | string>;
  counts: { activeUsers: number; inactiveUsers: number; twoFactorUsers: number; failedLogins24h: number; successfulLogins24h: number; legacySecretRows: number };
  recentEvents: { id: string; action: string; resourceId: string | null; ipHash: string | null; createdAt: string }[];
  limitations: string[];
};

const LABELS: Record<string, string> = {
  signedSessionCookie: "HMAC-signed session cookie",
  httpOnly: "HTTP-only cookie",
  secureInProduction: "Secure cookie in production",
  sameSite: "SameSite policy",
  sessionDurationHours: "Session duration (hours)",
  databaseUserRevalidation: "Database user revalidation",
  serverSideRbac: "Server-side RBAC",
  loginRateLimit: "Login rate limit",
  distributedRateLimit: "Distributed rate limiter",
  twoFactorAuthentication: "TOTP two-factor capability",
  twoFactorEnabledForCurrentUser: "Two-factor protection for this account",
  crossSiteOriginValidation: "Cross-site Origin / Fetch-Metadata validation",
  csrfToken: "Dedicated CSRF token",
  authSecretConfigured: "AUTH_SECRET minimum length",
};

export default function SecurityPage() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);
  const [twoFactorBusy, setTwoFactorBusy] = useState(false);

  useEffect(() => {
    adminFetch<Payload>("/api/v1/admin/security")
      .then((response) => setPayload(response.data))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load security status."));
  }, []);

  async function twoFactorAction(action: "setup" | "verify" | "disable" | "cancel_setup") {
    setTwoFactorBusy(true);
    setTwoFactorMessage(null);
    try {
      const response = await adminFetch<{ secret?: string; otpauthUri?: string; enabled?: boolean; recoveryCodes?: string[] }>(
        "/api/v1/admin/security/two-factor",
        { method: "POST", body: JSON.stringify({ action, code: twoFactorCode }) },
      );
      setTwoFactorMessage(response.message);
      if (action === "setup" && response.data.secret && response.data.otpauthUri) {
        setTwoFactorSetup({ secret: response.data.secret, otpauthUri: response.data.otpauthUri });
      }
      if (action === "verify") {
        setRecoveryCodes(response.data.recoveryCodes || []);
        setTwoFactorSetup(null);
        setPayload((current) => current ? {
          ...current,
          controls: { ...current.controls, twoFactorEnabledForCurrentUser: true },
          counts: { ...current.counts, twoFactorUsers: current.counts.twoFactorUsers + 1 },
        } : current);
      }
      if (action === "disable") {
        setRecoveryCodes([]);
        setPayload((current) => current ? {
          ...current,
          controls: { ...current.controls, twoFactorEnabledForCurrentUser: false },
          counts: { ...current.counts, twoFactorUsers: Math.max(0, current.counts.twoFactorUsers - 1) },
        } : current);
      }
      if (action === "cancel_setup") setTwoFactorSetup(null);
      setTwoFactorCode("");
    } catch (cause) {
      setTwoFactorMessage(cause instanceof Error ? cause.message : "Two-factor action failed.");
    } finally {
      setTwoFactorBusy(false);
    }
  }

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Security" subtitle="Observed controls and explicit limitations; no compliance claims" actions={<Link href="/admin/audit-logs" className="text-sm text-blue-700 hover:underline">Open audit logs</Link>} />
      {!payload ? <p className="py-16 text-sm text-muted-foreground">Loading security posture…</p> : <>
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="Active users" value={payload.counts.activeUsers} />
          <Metric label="Inactive users" value={payload.counts.inactiveUsers} />
          <Metric label="2FA-enabled users" value={payload.counts.twoFactorUsers} />
          <Metric label="Successful logins · 24h" value={payload.counts.successfulLogins24h} />
          <Metric label="Failed logins · 24h" value={payload.counts.failedLogins24h} />
          <Metric label="Legacy secret rows" value={payload.counts.legacySecretRows} warning={payload.counts.legacySecretRows > 0} />
        </div>
        <TwoFactorCard
          enabled={Boolean(payload.controls.twoFactorEnabledForCurrentUser)}
          setup={twoFactorSetup}
          code={twoFactorCode}
          recoveryCodes={recoveryCodes}
          message={twoFactorMessage}
          busy={twoFactorBusy}
          onCodeChange={setTwoFactorCode}
          onAction={twoFactorAction}
        />
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Controls</CardTitle></CardHeader><CardContent className="space-y-2">{Object.entries(payload.controls).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-3 border-b py-2 text-sm last:border-0"><span>{LABELS[key] || key}</span><span className="flex items-center gap-1 text-right">{typeof value === "boolean" ? value ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" />Implemented</> : <><XCircle className="h-4 w-4 text-red-600" />Not implemented</> : String(value)}</span></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Known limitations</CardTitle></CardHeader><CardContent className="space-y-3">{payload.limitations.map((item) => <div key={item} className="flex gap-2 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{item}</span></div>)}</CardContent></Card>
        </div>
        <Card className="mt-5"><CardHeader><CardTitle className="text-base">Recent authentication events</CardTitle></CardHeader><CardContent className="p-0">{payload.recentEvents.length === 0 ? <p className="p-6 text-sm text-muted-foreground">No authentication audit events are recorded.</p> : <div className="divide-y">{payload.recentEvents.map((event) => <div key={event.id} className="flex flex-wrap justify-between gap-2 px-6 py-3 text-sm"><span>{event.action}</span><span className="font-mono text-xs text-muted-foreground">IP hash: {event.ipHash || "not recorded"}</span><span className="text-xs text-muted-foreground">{fmtDate(event.createdAt)}</span></div>)}</div>}</CardContent></Card>
      </>}
    </div>
  );
}

function TwoFactorCard({
  enabled,
  setup,
  code,
  recoveryCodes,
  message,
  busy,
  onCodeChange,
  onAction,
}: {
  enabled: boolean;
  setup: { secret: string; otpauthUri: string } | null;
  code: string;
  recoveryCodes: string[];
  message: string | null;
  busy: boolean;
  onCodeChange: (value: string) => void;
  onAction: (action: "setup" | "verify" | "disable" | "cancel_setup") => Promise<void>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" />Authenticator two-factor protection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className={enabled ? "text-emerald-700" : "text-amber-800"}>
          {enabled ? "Enabled for this account. Every password login also requires a current authenticator or unused recovery code." : "Not enabled for this account."}
        </p>
        {!enabled && !setup && recoveryCodes.length === 0 && (
          <Button type="button" onClick={() => void onAction("setup")} disabled={busy}>Start two-factor setup</Button>
        )}
        {setup && (
          <div className="space-y-3 rounded-md border p-4">
            <p>In your authenticator app, add an account manually with this key:</p>
            <code className="block break-all rounded bg-muted p-3 font-mono text-xs" data-testid="two-factor-secret">{setup.secret}</code>
            <details><summary className="cursor-pointer text-xs text-muted-foreground">Show provisioning URI</summary><code className="mt-2 block break-all rounded bg-muted p-2 text-xs">{setup.otpauthUri}</code></details>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="two-factor-verify">Current six-digit code</Label>
              <Input id="two-factor-verify" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => onCodeChange(event.target.value)} placeholder="123456" className="font-mono" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => void onAction("verify")} disabled={busy || !code}>Verify and enable</Button>
              <Button type="button" variant="outline" onClick={() => void onAction("cancel_setup")} disabled={busy}>Cancel</Button>
            </div>
          </div>
        )}
        {recoveryCodes.length > 0 && (
          <div className="space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <p className="font-semibold">Save these one-time recovery codes now. They cannot be displayed again.</p>
            <div className="grid gap-2 sm:grid-cols-2">{recoveryCodes.map((item) => <code key={item} className="rounded bg-white p-2 font-mono">{item}</code>)}</div>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>I saved the codes</Button>
          </div>
        )}
        {enabled && recoveryCodes.length === 0 && (
          <div className="max-w-sm space-y-2 rounded-md border p-4">
            <Label htmlFor="two-factor-disable">Code required to disable</Label>
            <Input id="two-factor-disable" value={code} onChange={(event) => onCodeChange(event.target.value)} placeholder="Authenticator or recovery code" autoComplete="one-time-code" className="font-mono" />
            <Button type="button" variant="destructive" onClick={() => void onAction("disable")} disabled={busy || !code}>Disable two-factor protection</Button>
          </div>
        )}
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return <Card className={warning ? "border-amber-300" : ""}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 text-2xl font-semibold ${warning ? "text-amber-800" : ""}`}>{value}</p></CardContent></Card>;
}
