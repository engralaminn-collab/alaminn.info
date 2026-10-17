"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Video, Film, Plus, Play, Edit } from "lucide-react";
import { toast } from "sonner";

export default function AdminVideoStudioPage() {
  const [storyboards, setStoryboards] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    adminFetch("/api/v1/admin/storyboards").then((d) => { if (d.success && d.data) setStoryboards((d.data as { items?: Record<string, unknown>[] }).items || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function createStoryboard() {
    if (!title.trim()) { toast.error("Title required."); return; }
    try {
      await adminFetch("/api/v1/admin/storyboards", { method: "POST", body: JSON.stringify({ title }) });
      toast.success("Storyboard created.");
      setShowCreate(false); setTitle("");
      const d = await adminFetch("/api/v1/admin/storyboards");
      if (d.success && d.data) setStoryboards((d.data as { items?: Record<string, unknown>[] }).items || []);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed."); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Video Storyboard Studio</h1><p className="text-sm text-muted-foreground mt-1">Plan and create video content storyboards</p></div><Button onClick={() => setShowCreate(!showCreate)}><Plus className="h-4 w-4 mr-2" />New Storyboard</Button></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Film className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : storyboards.length}</div><div className="text-xs text-muted-foreground">Storyboards</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Video className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : storyboards.filter(s => String(s.status) === "draft").length}</div><div className="text-xs text-muted-foreground">Drafts</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Play className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : storyboards.filter(s => String(s.status) === "published").length}</div><div className="text-xs text-muted-foreground">Published</div></div></CardContent></Card>
      </div>
      {showCreate && (
        <Card><CardContent className="p-4 space-y-3">
          <div><label className="text-sm font-medium mb-1.5 block">Storyboard Title</label><input type="text" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="e.g. Study Abroad Tips Video" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <Button onClick={createStoryboard}>Create Storyboard</Button>
        </CardContent></Card>
      )}
      <Card><CardHeader><CardTitle>Storyboard List</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         storyboards.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No storyboards yet.</div> :
         <div className="space-y-2">{storyboards.map((s, i) => (
           <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
             <Film className="h-4 w-4 text-muted-foreground shrink-0" />
             <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{String(s.title || "Untitled")}</div></div>
             <Badge variant="outline">{String(s.status || "draft")}</Badge>
             <Button variant="ghost" size="icon"><Edit className="h-3 w-3" /></Button>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
