"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Clock, AlertCircle, CheckCircle, ListTodo } from "lucide-react";
export default function AdminFollowUpsPage() {
  const [tasks, setTasks] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminFetch("/api/v1/admin/tasks").then((d) => { if (d.success && d.data) setTasks((d.data as { tasks?: Record<string, unknown>[] }).tasks || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);
  const followUps = tasks.filter(t => String(t.title || "").toLowerCase().includes("follow up") || String(t.relatedType || "") === "meeting" || String(t.priority || "") === "high");
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Follow-ups</h1><p className="text-sm text-muted-foreground mt-1">Track follow-up tasks with due dates and priority</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Clock className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : followUps.length}</div><div className="text-xs text-muted-foreground">Pending Follow-ups</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600"><AlertCircle className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : followUps.filter(t => String(t.priority) === "high").length}</div><div className="text-xs text-muted-foreground">High Priority</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><CheckCircle className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : followUps.filter(t => String(t.status) === "done").length}</div><div className="text-xs text-muted-foreground">Completed</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="flex items-center gap-2"><ListTodo className="h-5 w-5" />Follow-up Tasks</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         followUps.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No follow-up tasks.</div> :
         <div className="space-y-2">{followUps.slice(0, 20).map((t, i) => (
           <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
             <div className="min-w-0"><div className="font-medium text-sm truncate">{String(t.title || "Untitled")}</div><div className="text-xs text-muted-foreground">{t.dueDate ? `Due: ${new Date(String(t.dueDate)).toDateString()}` : "No due date"}</div></div>
             <Badge variant={String(t.priority) === "high" ? "destructive" : "secondary"}>{String(t.priority || "medium")}</Badge>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
