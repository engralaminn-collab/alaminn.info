"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Users, Mail, Send, Eye, MousePointerClick, TrendingUp, AlertCircle, FileText, ListChecks, Settings } from "lucide-react";
import { toast } from "sonner";

export default function AdminEmailMarketingPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/email-marketing/stats")
      .then((d) => { if (d.success && d.data) setStats(d.data as Record<string, number>); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Contacts", value: stats.totalContacts || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Active Subscribers", value: stats.activeSubs || 0, icon: Mail, color: "from-green-500 to-green-600" },
    { label: "Campaigns", value: stats.totalCampaigns || 0, icon: Send, color: "from-orange-500 to-orange-600" },
    { label: "Emails Sent", value: stats.totalSent || 0, icon: TrendingUp, color: "from-indigo-500 to-indigo-600" },
    { label: "Opens", value: stats.totalOpened || 0, icon: Eye, color: "from-purple-500 to-purple-600" },
    { label: "Clicks", value: stats.totalClicked || 0, icon: MousePointerClick, color: "from-rose-500 to-rose-600" },
    { label: "Delivery Rate", value: `${stats.deliveryRate || 0}%`, icon: TrendingUp, color: "from-emerald-500 to-emerald-600" },
    { label: "Bounced", value: stats.totalBounced || 0, icon: AlertCircle, color: "from-red-500 to-red-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Email Marketing</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete email marketing platform — $0 software cost, open-source</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-3xl font-bold mt-1 tabular">{loading ? "..." : c.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />Contacts</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Manage subscribers, import CSV, tag contacts</p>
            <Button variant="outline" size="sm" className="w-full">Manage Contacts</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><ListChecks className="h-4 w-4" />Lists & Segments</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Create lists, segments, tags</p>
            <Button variant="outline" size="sm" className="w-full">Manage Lists</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />Templates</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">HTML email templates with variables</p>
            <Button variant="outline" size="sm" className="w-full">Manage Templates</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" />Campaigns</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Create, schedule, send campaigns</p>
            <Button variant="outline" size="sm" className="w-full">Manage Campaigns</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Settings className="h-4 w-4" />Providers</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">SMTP, Brevo Free (300/day), MailerLite Free (2500/mo)</p>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Native (Dev)</Badge>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4" />Suppressions</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Bounced, unsubscribed, complaints</p>
            <Button variant="outline" size="sm" className="w-full">View Suppressions</Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Cost & Plan Status</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Software cost:</span> <span className="font-bold text-green-600">$0 (Open Source)</span></div>
            <div><span className="text-muted-foreground">Email delivery:</span> <span className="font-bold text-green-600">$0 (Free tier)</span></div>
            <div><span className="text-muted-foreground">Hosting:</span> <span className="font-bold">Existing server</span></div>
            <div><span className="text-muted-foreground">Domain:</span> <span className="font-bold">alaminn.info (existing)</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
