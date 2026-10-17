"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Users, Mail, Calendar, CheckCircle, FileText, GitBranch, Send, Bot, Shield, BarChart3, Megaphone, Eye } from "lucide-react";

export default function AdminAnalyticsDashboardPage() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/system-analytics")
      .then((d) => { if (d.success && d.data) setStats(d.data as Record<string, number>); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Contacts", value: stats.contacts || 0, icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Inquiries", value: stats.inquiries || 0, icon: Mail, color: "from-orange-500 to-orange-600" },
    { label: "Meetings", value: stats.meetings || 0, icon: Calendar, color: "from-green-500 to-green-600" },
    { label: "Tasks", value: stats.tasks || 0, icon: CheckCircle, color: "from-indigo-500 to-indigo-600" },
    { label: "Articles", value: stats.articles || 0, icon: FileText, color: "from-purple-500 to-purple-600" },
    { label: "Projects", value: stats.projects || 0, icon: GitBranch, color: "from-rose-500 to-rose-600" },
    { label: "Newsletter", value: stats.newsletters || 0, icon: Send, color: "from-amber-500 to-amber-600" },
    { label: "AI Tasks", value: stats.aiTasks || 0, icon: Bot, color: "from-cyan-500 to-cyan-600" },
    { label: "Audit Logs", value: stats.auditLogs || 0, icon: Shield, color: "from-slate-500 to-slate-600" },
    { label: "Email Contacts", value: stats.emailContacts || 0, icon: Megaphone, color: "from-emerald-500 to-emerald-600" },
    { label: "Email Campaigns", value: stats.emailCampaigns || 0, icon: BarChart3, color: "from-pink-500 to-pink-600" },
    { label: "Email Events", value: stats.emailEvents || 0, icon: Eye, color: "from-violet-500 to-violet-600" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">System Analytics Dashboard</h1><p className="text-sm text-muted-foreground mt-1">Real-time analytics across all platform modules</p></div>
      <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><div className="text-4xl font-bold tabular">{loading ? "..." : stats.totalRecords || 0}</div><div className="text-sm text-muted-foreground">Total Records Across System</div></div><BarChart3 className="h-8 w-8 text-muted-foreground" /></div></CardContent></Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => { const Icon = c.icon; return (
          <Card key={c.label} className="relative overflow-hidden"><CardContent className="pt-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">{c.label}</p><p className="text-3xl font-bold mt-1 tabular">{loading ? "..." : c.value}</p></div><div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg`}><Icon className="h-5 w-5" /></div></div></CardContent></Card>
        );})}
      </div>
    </div>
  );
}
