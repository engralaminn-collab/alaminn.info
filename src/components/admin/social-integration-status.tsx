"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { AlertTriangle, ExternalLink, ShieldCheck } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  state: string;
  implementation: string;
  officialApi: string;
  blocker: string | null;
  nextStep: string;
};
type Payload = { integrations: Integration[] };

export function SocialIntegrationStatus({ platform }: { platform?: "facebook" | "instagram" | "linkedin" }) {
  const [items, setItems] = useState<Integration[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Payload>("/api/v1/admin/integrations")
      .then((response) => {
        const social = response.data.integrations.filter((item) => ["facebook", "instagram", "linkedin"].includes(item.id));
        setItems(platform ? social.filter((item) => item.id === platform) : social);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load social integration status."));
  }, [platform]);

  if (error) return <ErrorState message={error} />;
  const title = platform
    ? ({ facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" } as const)[platform]
    : "Social Media";

  return (
    <div>
      <PageHeader title={title} subtitle="Official API status and implementation blockers; no simulated connection or publishing data" />
      <div className="mb-5 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p>Only official Meta Graph and LinkedIn APIs will be used. Password collection, scraping, and browser automation are prohibited.</p></div>
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}><CardContent className="p-5"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{item.name}</h2><Badge variant="outline">{item.state.replaceAll("_", " ")}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{item.officialApi} · {item.implementation}</p>{item.blocker && <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle className="h-4 w-4 shrink-0" />{item.blocker}</div>}<p className="mt-3 text-xs"><strong>Required next step:</strong> {item.nextStep}</p></CardContent></Card>
        ))}
      </div>
      {!platform && <div className="mt-5 flex flex-wrap gap-3 text-sm"><Link href="/admin/facebook" className="flex items-center gap-1 text-blue-700 hover:underline">Facebook details <ExternalLink className="h-3 w-3" /></Link><Link href="/admin/instagram" className="flex items-center gap-1 text-blue-700 hover:underline">Instagram details <ExternalLink className="h-3 w-3" /></Link><Link href="/admin/linkedin" className="flex items-center gap-1 text-blue-700 hover:underline">LinkedIn details <ExternalLink className="h-3 w-3" /></Link></div>}
    </div>
  );
}
