"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch } from "@/components/admin/lib";
import { AlertTriangle, ArrowRight, Inbox } from "lucide-react";

type Integration = { id: string; name: string; state: string; blocker: string | null };
type Payload = { integrations: Integration[] };

export default function InboxPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch<Payload>("/api/v1/admin/integrations")
      .then((response) => setIntegrations(response.data.integrations))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load channel status."));
  }, []);

  if (error) return <ErrorState message={error} />;

  const channels = integrations.filter((item) => ["email", "whatsapp", "gmail", "facebook", "instagram", "linkedin"].includes(item.id));

  return (
    <div>
      <PageHeader title="Inbox" subtitle="Communication entry points and verified channel availability" />
      <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div><p className="font-medium">Unified message storage is not implemented.</p><p className="text-xs">This page does not fabricate conversations. Inquiries, booking records, and WhatsApp audit activity remain in their source modules until a Conversation/Message schema and official provider sync are migrated.</p></div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Channel title="Website inquiries" description="Contact submissions and CRM qualification records." href="/admin/inquiries" status="DATABASE RECORDS" />
        <Channel title="Meeting bookings" description="Booking requests, follow-up tasks, and email delivery evidence." href="/admin/bookings" status="DATABASE RECORDS" />
        <Channel title="WhatsApp activity" description="Official Cloud API audit events where configured." href="/admin/whatsapp-ai" status={channels.find((item) => item.id === "whatsapp")?.state || "CHECKING"} />
        <Channel title="Email operations" description="Redacted provider-attempt logs; this is not a mailbox." href="/admin/email" status={channels.find((item) => item.id === "email")?.state || "CHECKING"} />
      </div>
      <Card className="mt-5"><CardHeader><CardTitle className="text-base">Other channels</CardTitle></CardHeader><CardContent className="space-y-2">{channels.filter((item) => !["email", "whatsapp"].includes(item.id)).map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 border-b py-2 text-sm last:border-0"><span>{item.name}</span><span className="text-muted-foreground">{item.state.replaceAll("_", " ")}</span></div>)}</CardContent></Card>
    </div>
  );
}

function Channel({ title, description, href, status }: { title: string; description: string; href: string; status: string }) {
  return <Card><CardContent className="flex items-start gap-3 p-5"><Inbox className="mt-1 h-5 w-5 text-muted-foreground" /><div className="min-w-0 flex-1"><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p><p className="mt-2 text-xs font-medium text-slate-600">{status.replaceAll("_", " ")}</p></div><Link href={href} aria-label={`Open ${title}`}><ArrowRight className="h-5 w-5 text-blue-700" /></Link></CardContent></Card>;
}
