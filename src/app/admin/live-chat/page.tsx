"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import { MessageCircle, Users, Clock, Bot, Send, RefreshCw } from "lucide-react";

export default function AdminLiveChatPage() {
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("/api/v1/admin/live-chat").then((d) => { if (d.success && d.data) setConversations((d.data as { conversations?: Record<string, unknown>[] }).conversations || []); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">Live Support Desk</h1><p className="text-sm text-muted-foreground mt-1">Real-time chat support for students and visitors</p></div><Button variant="outline" size="sm"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><MessageCircle className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : conversations.length}</div><div className="text-xs text-muted-foreground">Total Chats</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Users className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">{loading ? "..." : conversations.filter(c => String(c.status) === "new").length}</div><div className="text-xs text-muted-foreground">New</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><Clock className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">—</div><div className="text-xs text-muted-foreground">Avg Response</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600"><Bot className="h-5 w-5" /></div><div><div className="text-2xl font-bold tabular">—</div><div className="text-xs text-muted-foreground">AI Handled</div></div></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Conversations</CardTitle></CardHeader><CardContent>
        {loading ? <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div> :
         conversations.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No conversations yet.</div> :
         <div className="space-y-2">{conversations.map((c, i) => (
           <div key={i} className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
             <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">{String(c.name || "?").charAt(0)}</div>
             <div className="flex-1 min-w-0"><div className="font-medium text-sm">{String(c.name || "Unknown")}</div><div className="text-xs text-muted-foreground truncate">{String(c.message || "")}</div></div>
             <Badge variant="outline">{String(c.status || "new")}</Badge>
             <Button variant="ghost" size="icon"><Send className="h-3 w-3" /></Button>
           </div>
         ))}</div>}
      </CardContent></Card>
    </div>
  );
}
