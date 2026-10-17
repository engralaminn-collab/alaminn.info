"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Loader2, Save, ShieldCheck, XCircle } from "lucide-react";

type Settings = Record<string, string>;

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await adminFetch<Settings>("/api/v1/admin/settings");
    setSettings(response.data);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load()
        .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load settings."))
        .finally(() => setLoading(false));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function save() {
    setSaving(true);
    try {
      await adminFetch("/api/v1/admin/settings", {
        method: "PUT",
        body: JSON.stringify({
          "booking.notificationEmail": settings["booking.notificationEmail"] || "engr.alaminn@gmail.com",
        }),
      });
      toast.success("Booking notification setting saved.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function testEmail() {
    setTestingEmail(true);
    try {
      const response = await adminFetch<{ sent: boolean; provider: string }>(
        "/api/v1/admin/settings/test-email",
        { method: "POST", body: JSON.stringify({}) }
      );
      toast.success(response.message);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Test email failed.");
    } finally {
      setTestingEmail(false);
    }
  }

  async function purgeLegacySecrets() {
    setPurging(true);
    try {
      const response = await adminFetch<{ deleted: number }>("/api/v1/admin/settings", {
        method: "DELETE",
      });
      toast.success(response.message);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Secret cleanup failed.");
    } finally {
      setPurging(false);
    }
  }

  if (loading) return <div><PageHeader title="Settings" /><Skeleton className="h-96" /></div>;
  if (error) return <ErrorState message={error} />;

  const emailConfigured = settings["_email.configured"] === "true";
  const legacySecretRows = Number(settings["_security.legacySecretRows"] || "0");

  return (
    <div>
      <PageHeader
        title="Operational Settings"
        subtitle="Non-secret application settings and deployment-managed service status"
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            Save
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Booking notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="booking-email">Admin notification email</Label>
              <Input
                id="booking-email"
                type="email"
                value={settings["booking.notificationEmail"] || "engr.alaminn@gmail.com"}
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    "booking.notificationEmail": event.target.value,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                New meeting requests are sent here after the booking transaction is saved.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Email transport</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {emailConfigured ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="font-medium">{emailConfigured ? "Configured" : "Not configured"}</p>
                <p className="text-xs text-muted-foreground">Provider: {settings["_email.provider"]}</p>
              </div>
            </div>
            <dl className="grid grid-cols-[90px_1fr] gap-2 text-sm">
              <dt className="text-muted-foreground">From</dt>
              <dd className="break-all">{settings["_email.from"]}</dd>
              <dt className="text-muted-foreground">Reply-to</dt>
              <dd className="break-all">{settings["_email.replyTo"]}</dd>
            </dl>
            <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              SMTP passwords and provider API keys are deployment secrets. They are never accepted by or returned from this page.
            </p>
            <Button variant="outline" size="sm" onClick={testEmail} disabled={testingEmail || !emailConfigured}>
              {testingEmail ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
              Send real test email
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-4 w-4" /> Secret storage</CardTitle></CardHeader>
          <CardContent>
            {legacySecretRows > 0 ? (
              <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2 text-amber-900">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <p className="text-sm">
                    {legacySecretRows} legacy credential row{legacySecretRows === 1 ? "" : "s"} remain in the Settings table. Purge them and rotate any affected credential in its provider dashboard.
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={purgeLegacySecrets} disabled={purging}>
                  {purging ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                  Purge rows
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="h-5 w-5" /> No known provider-secret keys are stored in the Settings table.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
