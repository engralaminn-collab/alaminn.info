"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Linkedin, FileText, BarChart3 } from "lucide-react";
export default function AdminLinkedInPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">LinkedIn</h1><p className="text-sm text-muted-foreground mt-1">LinkedIn Marketing API for professional content publishing</p></div>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base flex items-center gap-2"><Linkedin className="h-4 w-4" />LinkedIn Account</CardTitle><Badge variant="outline">NOT CONNECTED</Badge></CardHeader><CardContent>
        <p className="text-xs text-muted-foreground mb-3">Connect LinkedIn via Marketing API to publish posts, view analytics, and manage professional content. Requires LinkedIn Developer app with w_member_social permission.</p>
        <Button variant="outline" size="sm" className="w-full">Connect LinkedIn</Button>
      </CardContent></Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Published Posts</span></div><div className="text-2xl font-bold tabular">—</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><BarChart3 className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Profile Views</span></div><div className="text-2xl font-bold tabular">—</div></CardContent></Card>
      </div>
    </div>
  );
}
