"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { FileText, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
export default function AdminContentPage() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminFetch("/api/v1/admin/articles").then((d) => { if (d.success && d.data) setArticles((d.data as { articles?: Record<string, unknown>[] }).articles || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const contentTypes = ["Article", "News", "Insight", "Project", "Social Post", "Announcement"];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Content Center</h1><p className="text-sm text-muted-foreground mt-1">Manage articles, news, insights, social posts</p></div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Content</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular">{loading ? "..." : articles.length}</div><div className="text-xs text-muted-foreground">Total Articles</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular">{loading ? "..." : articles.filter(a => a.status === "published").length}</div><div className="text-xs text-muted-foreground">Published</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-2xl font-bold tabular">{loading ? "..." : articles.filter(a => a.status === "draft").length}</div><div className="text-xs text-muted-foreground">Drafts</div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Content List</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         articles.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No content found.</div> :
         <div className="space-y-2">{articles.slice(0, 30).map((a, i) => (
           <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
             <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
             <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{String(a.title || "Untitled")}</div><div className="text-xs text-muted-foreground">{String(a.category || "general")} · {String(a.author || "Al Aminn")}</div></div>
             <Badge variant="outline">{String(a.status || "draft")}</Badge>
             <Button variant="ghost" size="icon"><Edit className="h-3 w-3" /></Button>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
