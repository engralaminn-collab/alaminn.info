"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { toast } from "sonner";
import { CheckCircle2, ExternalLink, Loader2, Save, ShieldCheck } from "lucide-react";

type Settings = Record<string, string>;
type Field = { key: string; label: string; type: "text" | "textarea"; max: number; route: string };

const FIELDS: Field[] = [
  { key: "seo.home.title", label: "Homepage — title", type: "text", max: 70, route: "/" },
  { key: "seo.home.description", label: "Homepage — description", type: "textarea", max: 180, route: "/" },
  { key: "seo.about.title", label: "About — title", type: "text", max: 70, route: "/about" },
  { key: "seo.about.description", label: "About — description", type: "textarea", max: 180, route: "/about" },
  { key: "seo.projects.title", label: "Projects — title", type: "text", max: 70, route: "/projects" },
  { key: "seo.projects.description", label: "Projects — description", type: "textarea", max: 180, route: "/projects" },
  { key: "seo.articles.title", label: "Insights — title", type: "text", max: 70, route: "/insights" },
  { key: "seo.articles.description", label: "Insights — description", type: "textarea", max: 180, route: "/insights" },
  { key: "seo.work-with-me.title", label: "Work With Me — title", type: "text", max: 70, route: "/work-with-me" },
  { key: "seo.work-with-me.description", label: "Work With Me — description", type: "textarea", max: 180, route: "/work-with-me" },
];

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const env = await adminFetch<Settings>("/api/v1/admin/seo");
        setSettings(env.data);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Failed to load metadata settings.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    try {
      const managed = Object.fromEntries(FIELDS.map((field) => [field.key, settings[field.key] || ""]));
      await adminFetch("/api/v1/admin/seo", { method: "PUT", body: JSON.stringify(managed) });
      toast.success("Metadata saved. Public pages consume these values on their next render.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div><PageHeader title="SEO" /><Skeleton className="h-96" /></div>;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        title="SEO Management"
        subtitle="Allow-listed metadata that is consumed by real public routes; blank values use checked-in fallbacks"
        actions={<Button onClick={save} disabled={saving}>{saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Save metadata</Button>}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card><CardContent className="flex gap-3 p-5"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /><div><p className="font-semibold">Runtime application is wired</p><p className="mt-1 text-xs text-muted-foreground">`generateMetadata` calls the allow-listed server helper for each route below. A database failure falls back to repository metadata instead of removing tags.</p></div></CardContent></Card>
        <Card><CardContent className="p-5"><p className="font-semibold">Generated technical SEO</p><div className="mt-3 flex flex-wrap gap-2 text-sm"><Button asChild size="sm" variant="outline"><Link href="/robots.txt" target="_blank">robots.txt <ExternalLink className="ml-1 h-3.5 w-3.5" /></Link></Button><Button asChild size="sm" variant="outline"><Link href="/sitemap.xml" target="_blank">sitemap.xml <ExternalLink className="ml-1 h-3.5 w-3.5" /></Link></Button></div><p className="mt-3 text-xs text-muted-foreground">Robots and sitemap policy remain code-reviewed source files rather than arbitrary database text.</p></CardContent></Card>
      </div>

      <div className="grid gap-4">
        {FIELDS.map((field) => {
          const value = settings[field.key] || "";
          return <Card key={field.key}>
            <CardHeader className="pb-3"><div className="flex flex-wrap items-center justify-between gap-2"><CardTitle className="text-sm">{field.label}</CardTitle><Link href={field.route} target="_blank" className="flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">{field.route} <ExternalLink className="h-3 w-3" /></Link></div></CardHeader>
            <CardContent>
              <Label htmlFor={field.key} className="sr-only">{field.label}</Label>
              {field.type === "textarea" ? <Textarea id={field.key} rows={3} maxLength={field.max} value={value} onChange={(event) => setSettings((current) => ({ ...current, [field.key]: event.target.value }))} /> : <Input id={field.key} maxLength={field.max} value={value} onChange={(event) => setSettings((current) => ({ ...current, [field.key]: event.target.value }))} />}
              <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground"><code>{field.key}</code><span className={value.length > field.max * 0.9 ? "text-amber-700" : ""}>{value.length}/{field.max}</span></div>
              {!value && <p className="mt-2 flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Checked-in fallback remains active.</p>}
            </CardContent>
          </Card>;
        })}
      </div>
    </div>
  );
}
