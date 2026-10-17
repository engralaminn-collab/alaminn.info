"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone, Webhook, AlertCircle, Bot } from "lucide-react";

export default function AdminWhatsAppPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">WhatsApp Business</h1><p className="text-sm text-muted-foreground mt-1">Official Meta WhatsApp Cloud API integration</p></div>
      <Card><CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" />WhatsApp Cloud API</CardTitle><Badge variant="outline">NOT CONNECTED</Badge></CardHeader><CardContent>
        <p className="text-xs text-muted-foreground mb-3">Connect WhatsApp Business via Meta Cloud API. Requires WHATSAPP_API_PHONE_NUMBER_ID and WHATSAPP_API_TOKEN in environment. The AI assistant identifies itself and never impersonates Al-Amin directly.</p>
        <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/admin/settings"}>Configure WhatsApp</Button>
      </CardContent></Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Phone Number</span></div><div className="text-sm">Not configured</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Webhook className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Webhook</span></div><div className="text-sm">Not configured</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">Status</span></div><Badge variant="outline">Dev Mode</Badge></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><Bot className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-medium">AI Mode</span></div><Badge variant="outline">Dev Mode</Badge></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>WhatsApp AI Assistant</CardTitle></CardHeader><CardContent>
        <p className="text-sm text-muted-foreground">When connected, the AI assistant handles initial conversations, identifies itself as AI, and escalates to human support. Sensitive communications require human approval.</p>
      </CardContent></Card>
    </div>
  );
}
