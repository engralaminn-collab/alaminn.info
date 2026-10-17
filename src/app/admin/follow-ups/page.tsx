"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, ErrorState } from "@/components/admin/page-primitives";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: string;
  status: string;
  relatedType: string | null;
  relatedId: string | null;
  contact: { id: string; fullName: string } | null;
  assignee: { id: string; name: string; email: string } | null;
};

export default function FollowUpsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);

  useEffect(() => {
    adminFetch<Task[]>("/api/v1/admin/tasks?pageSize=100")
      .then((response) => {
        setNow(Date.now());
        setTasks(response.data.filter((task) => task.relatedType === "MeetingRequest" || /follow[ -]?up/i.test(task.title)));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Failed to load follow-ups."))
      .finally(() => setLoading(false));
  }, []);

  if (error) return <ErrorState message={error} />;
  const open = tasks.filter((task) => !["done", "cancelled"].includes(task.status));

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Tasks tied to meeting requests or explicitly identified as follow-ups" actions={<Link href="/admin/tasks" className="text-sm text-blue-700 hover:underline">Manage all tasks</Link>} />
      <Card><CardContent className="p-0">
        {loading ? <p className="p-8 text-sm text-muted-foreground">Loading follow-ups…</p> : open.length === 0 ? <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4" />No open follow-up tasks.</div> : (
          <div className="divide-y">{open.map((task) => {
            const overdue = task.dueDate ? new Date(task.dueDate).getTime() < now : false;
            return <div key={task.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{task.title}</p><Badge variant="outline">{task.priority}</Badge>{overdue && <span className="flex items-center gap-1 text-xs font-medium text-red-700"><AlertTriangle className="h-3 w-3" />Overdue</span>}</div>{task.description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{task.description}</p>}<p className="mt-1 text-xs text-muted-foreground">Contact: {task.contact?.fullName || "Not linked"} · Assignee: {task.assignee?.name || "Unassigned"}</p></div><div className="text-xs text-muted-foreground sm:text-right"><p>Due {fmtDate(task.dueDate)}</p><p className="mt-1">{task.status}</p></div></div>;
          })}</div>
        )}
      </CardContent></Card>
    </div>
  );
}
