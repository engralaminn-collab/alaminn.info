"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { Bell, Calendar, Users, MessageSquare, Shield, AlertCircle } from "lucide-react";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/notifications")
      .then((d) => { if (d.success && d.data) setNotifications((d.data as { notifications?: Record<string, unknown>[] }).notifications || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const typeIcons: Record<string, typeof Bell> = {
    meeting: Calendar, inquiry: Users, message: MessageSquare, system: Shield, alert: AlertCircle,
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground mt-1">All system and booking notifications</p></div>
      <Card><CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Bell className="h-5 w-5"/></div>
        <div><div className="text-2xl font-bold tabular">{loading ? "..." : notifications.length}</div><div className="text-xs text-muted-foreground">Total Notifications</div></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Notification List</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         notifications.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No notifications.</div> :
         <div className="space-y-2">{notifications.slice(0, 30).map((n, i) => {
           const Icon = typeIcons[String(n.type)] || Bell;
           return (
             <div key={i} className={`flex items-start gap-3 p-3 border border-border rounded-lg ${String(n.read) === "false" ? "bg-orange-50/50" : ""}`}>
               <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Icon className="h-4 w-4"/></div>
               <div className="flex-1 min-w-0">
                 <div className="font-medium text-sm">{String(n.title || "Notification")}</div>
                 <div className="text-xs text-muted-foreground mt-0.5">{String(n.message || "")}</div>
               </div>
               {String(n.read) === "false" && <Badge variant="default" className="text-xs">NEW</Badge>}
             </div>
           );
         })}</div>}
      </CardContent></Card>
    </div>
  );
}
