"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Mail, Send, FileText, Users } from "lucide-react";

export default function AdminEmailBuilderPage() {
  const [stats, setStats] = useState({ contacts: 0, campaigns: 0, templates: 0, sent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/email-marketing/stats")
      .then((d) => {
        if (d.success && d.data) {
          const s = d.data as Record<string, number>;
          setStats({ contacts: s.totalContacts || 0, campaigns: s.totalCampaigns || 0, templates: 0, sent: s.totalSent || 0 });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Email Campaign Builder</h1><p className="text-sm text-muted-foreground mt-1">Design and send email marketing campaigns — $0 cost</p></div>
        <Button onClick={() => window.location.href = "/admin/email-marketing"}><Mail className="h-4 w-4 mr-2" />Open Email Marketing</Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Users className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : stats.contacts}</div><div className="text-xs text-muted-foreground">Subscribers</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><FileText className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : stats.templates}</div><div className="text-xs text-muted-foreground">Templates</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Send className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : stats.campaigns}</div><div className="text-xs text-muted-foreground">Campaigns</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"><Mail className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : stats.sent}</div><div className="text-xs text-muted-foreground">Emails Sent</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Email Builder</CardTitle></CardHeader><CardContent>
        <p className="text-sm text-muted-foreground mb-4">Create templates, manage subscribers, and send campaigns using free providers (SMTP, Brevo Free 300/day, MailerLite Free 2500/mo).</p>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/email-marketing"}>Create Campaign</Button>
      </CardContent></Card>
    </div>
  );
}
