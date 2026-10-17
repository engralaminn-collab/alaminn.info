"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Megaphone, Mail, Calendar, Send, FileText } from "lucide-react";
import { toast } from "sonner";

export default function AdminMarketingPage() {
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/social-posts").then((d) => { if (d.success && d.data) setPosts((d.data as { posts?: Record<string, unknown>[] }).posts || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Marketing Campaign Kit</h1><p className="text-sm text-muted-foreground mt-1">Create and manage marketing content across platforms</p></div>
        <Button onClick={() => window.location.href = "/admin/social-media"}><Megaphone className="h-4 w-4 mr-2" />Create Campaign</Button></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><FileText className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : posts.length}</div><div className="text-xs text-muted-foreground">Total Posts</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Send className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : posts.filter(p => String(p.status) === "published").length}</div><div className="text-xs text-muted-foreground">Published</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><Calendar className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : posts.filter(p => String(p.status) === "draft").length}</div><div className="text-xs text-muted-foreground">Drafts</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Campaign Posts</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         posts.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No campaigns yet. Create one to get started.</div> :
         <div className="space-y-2">{posts.slice(0, 20).map((p, i) => (
           <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
             <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
             <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{String(p.topic || p.title || "Untitled")}</div><div className="text-xs text-muted-foreground capitalize">{String(p.platform || "website")}</div></div>
             <Badge variant="outline">{String(p.status || "draft")}</Badge>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
