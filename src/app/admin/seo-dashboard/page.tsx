"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useState } from "react";
import { toast } from "sonner";
import { Search, TrendingUp, Globe, AlertCircle, Wand2 } from "lucide-react";

export default function AdminSeoDashboardPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<{ score: number; issues: string[]; recommendations: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  async function runAudit() {
    if (!url.trim()) { toast.error("URL required."); return; }
    setLoading(true);
    try {
      const d = await adminFetch("/api/v1/admin/seo-audit", { method: "POST", body: JSON.stringify({ url }) });
      if (d.success && d.data) { setResult(d.data as { score: number; issues: string[]; recommendations: string[] }); toast.success("Audit complete."); }
      else { toast.error("Audit failed."); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">SEO Engine Audit</h1><p className="text-sm text-muted-foreground mt-1">Run AI-powered SEO audits on any URL</p></div>
      <Card><CardHeader><CardTitle className="text-base">Run SEO Audit</CardTitle></CardHeader><CardContent className="space-y-4">
        <div><label className="text-sm font-medium mb-1.5 block">URL to Audit</label>
          <input type="text" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="https://alaminn.info" value={url} onChange={(e) => setUrl(e.target.value)} /></div>
        <Button onClick={runAudit} disabled={loading}><Wand2 className="h-4 w-4 mr-2" />{loading ? "Auditing..." : "Run Audit"}</Button>
      </CardContent></Card>
      {result && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card><CardContent className="p-4"><div className="text-3xl font-bold tabular">{result.score}/100</div><div className="text-xs text-muted-foreground">SEO Score</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Issues Found ({result.issues.length})</CardTitle></CardHeader><CardContent>{result.issues.map((issue, i) => (<div key={i} className="text-xs mb-1 flex items-start gap-2"><AlertCircle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />{issue}</div>))}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Recommendations ({result.recommendations.length})</CardTitle></CardHeader><CardContent>{result.recommendations.map((rec, i) => (<div key={i} className="text-xs mb-1 flex items-start gap-2"><TrendingUp className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />{rec}</div>))}</CardContent></Card>
        </div>
      )}
    </div>
  );
}
