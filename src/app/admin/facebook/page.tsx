"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Facebook, MessageCircle, Image as ImageIcon, BarChart3 } from "lucide-react";
export default function AdminFacebookPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Facebook</h1><p className="text-sm text-muted-foreground mt-1">Meta Graph API integration for Facebook Page management</p></div>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base flex items-center gap-2"><Facebook className="h-4 w-4" />Facebook Page</CardTitle><Badge variant="outline">NOT CONNECTED</Badge></CardHeader><CardContent>
        <p className="text-xs text-muted-foreground mb-3">Connect your Facebook Page via Meta Graph API to manage posts, comments, messages, and analytics. Requires Meta Business App with pages_manage_posts, pages_read_engagement, and pages_messaging permissions.</p>
        <Button variant="outline" size="sm" className="w-full">Connect Facebook Page</Button>
      </CardContent></Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><ImageIcon className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Posts</span></div><div className="text-2xl font-bold tabular">—</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><MessageCircle className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Messages</span></div><div className="text-2xl font-bold tabular">—</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><BarChart3 className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Reach</span></div><div className="text-2xl font-bold tabular">—</div></CardContent></Card>
      </div>
    </div>
  );
}
