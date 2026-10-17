"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Calendar, Clock, Send, Facebook, Linkedin, Instagram, Globe } from "lucide-react";

export default function AdminSocialSchedulerPage() {
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/social-posts").then((d) => { if (d.success && d.data) setPosts((d.data as { posts?: Record<string, unknown>[] }).posts || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const scheduled = posts.filter(p => String(p.status) === "scheduled");
  const published = posts.filter(p => String(p.status) === "published");
  const drafts = posts.filter(p => String(p.status) === "draft");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Social Media Scheduler</h1><p className="text-sm text-muted-foreground mt-1">Schedule posts across Facebook, LinkedIn, Instagram</p></div><Button onClick={() => window.location.href = "/admin/social-media"}><Send className="h-4 w-4 mr-2" />Create Post</Button></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Calendar className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : scheduled.length}</div><div className="text-xs text-muted-foreground">Scheduled</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Send className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : published.length}</div><div className="text-xs text-muted-foreground">Published</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Clock className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : drafts.length}</div><div className="text-xs text-muted-foreground">Drafts</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Scheduled Posts</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         posts.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No posts yet. Create one from the Social Media Center.</div> :
         <div className="space-y-2">{posts.map((p, i) => {
           const platform = String(p.platform || "website");
           const Icon = platform === "facebook" ? Facebook : platform === "linkedin" ? Linkedin : platform === "instagram" ? Instagram : Globe;
           return (
             <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg">
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4" /></div>
               <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{String(p.topic || p.title || "Untitled")}</div><div className="text-xs text-muted-foreground">{platform} · {p.scheduledAt ? new Date(String(p.scheduledAt)).toDateString() : "Not scheduled"}</div></div>
               <Badge variant="outline">{String(p.status || "draft")}</Badge>
             </div>
           );
         })}</div>}
      </CardContent></Card>
    </div>
  );
}
