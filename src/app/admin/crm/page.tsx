"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Users, Briefcase, Target, DollarSign, TrendingUp } from "lucide-react";

export default function AdminCrmPage() {
  const [contacts, setContacts] = useState<Record<string, unknown>[]>([]);
  const [opportunities, setOpportunities] = useState<Record<string, unknown>[]>([]);
  const [inquiries, setInquiries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminFetch("/api/v1/admin/contacts"),
      adminFetch("/api/v1/admin/opportunities"),
      adminFetch("/api/v1/admin/inquiries"),
    ]).then((results) => {
      if (results[0].status === "fulfilled") setContacts((results[0].value.data as { contacts?: Record<string, unknown>[] })?.contacts || []);
      if (results[1].status === "fulfilled") setOpportunities((results[1].value.data as { opportunities?: Record<string, unknown>[] })?.opportunities || []);
      if (results[2].status === "fulfilled") setInquiries((results[2].value.data as { inquiries?: Record<string, unknown>[] })?.inquiries || []);
      setLoading(false);
    });
  }, []);

  const stages = ["new", "qualified", "proposal-sent", "negotiation", "won", "lost"];
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Interactive CRM Pipeline</h1><p className="text-sm text-muted-foreground mt-1">Contacts, opportunities, and inquiries in one pipeline view</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Users className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : contacts.length}</div><div className="text-xs text-muted-foreground">Contacts</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Briefcase className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : opportunities.length}</div><div className="text-xs text-muted-foreground">Opportunities</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Target className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : inquiries.length}</div><div className="text-xs text-muted-foreground">Inquiries</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"><TrendingUp className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : opportunities.filter(o => String(o.stage) === "won").length}</div><div className="text-xs text-muted-foreground">Won Deals</div></div></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage) => {
          const stageOpps = opportunities.filter(o => String(o.stage) === stage);
          return (
            <div key={stage} className="rounded-lg border border-border p-3 min-h-[200px]">
              <div className="flex items-center justify-between mb-3"><span className="text-xs font-semibold uppercase capitalize">{stage.replace(/-/g, " ")}</span><Badge variant="outline">{stageOpps.length}</Badge></div>
              <div className="space-y-2">{stageOpps.slice(0, 5).map((opp, i) => (
                <div key={i} className="rounded-md border border-border bg-card p-2 text-xs">
                  <div className="font-medium truncate">{String(opp.title || "Untitled")}</div>
                  <div className="text-muted-foreground mt-0.5">{opp.value ? `${opp.currency || "$"} ${Number(opp.value).toLocaleString()}` : "—"}</div>
                </div>
              ))}{stageOpps.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">Empty</div>}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
