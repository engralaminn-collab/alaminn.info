"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Briefcase, TrendingUp, DollarSign, Target } from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/opportunities")
      .then((d) => { if (d.success && d.data) setLeads((d.data as { opportunities?: Record<string, unknown>[] }).opportunities || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stages = ["new", "qualified", "proposal-sent", "negotiation", "won", "lost"];
  const stageColors: Record<string, string> = {
    new: "border-l-blue-500", qualified: "border-l-green-500",
    "proposal-sent": "border-l-amber-500", negotiation: "border-l-purple-500",
    won: "border-l-emerald-600", lost: "border-l-red-500",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leads & Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">Sales pipeline — track deals from new to won</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Briefcase className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : leads.length}</div><div className="text-xs text-muted-foreground">Total Leads</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Target className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : leads.filter(l => l.stage === "qualified").length}</div><div className="text-xs text-muted-foreground">Qualified</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><TrendingUp className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : leads.filter(l => l.stage === "proposal-sent").length}</div><div className="text-xs text-muted-foreground">Proposals Sent</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600"><DollarSign className="h-5 w-5"/></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : leads.filter(l => l.stage === "won").length}</div><div className="text-xs text-muted-foreground">Won</div></div></CardContent></Card>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => String(l.stage) === stage);
          return (
            <div key={stage} className={`rounded-lg border border-border border-l-4 ${stageColors[stage]} p-3 min-h-[200px]`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wide capitalize">{stage.replace(/-/g, " ")}</span>
                <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
              </div>
              <div className="space-y-2">
                {stageLeads.slice(0, 5).map((lead, i) => (
                  <div key={i} className="rounded-md border border-border bg-card p-2 text-xs">
                    <div className="font-medium truncate">{String(lead.title || "Untitled")}</div>
                    <div className="text-muted-foreground mt-0.5">
                      {lead.value ? `${lead.currency || "$"} ${Number(lead.value).toLocaleString()}` : "—"}
                    </div>
                    <div className="text-muted-foreground mt-0.5 truncate">
                      {String((lead.contact as { fullName?: string })?.fullName || "No contact")}
                    </div>
                  </div>
                ))}
                {stageLeads.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No leads</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
