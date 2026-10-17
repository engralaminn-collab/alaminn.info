"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Facebook, Linkedin, Instagram, Calendar, Globe, Bot, RefreshCw } from "lucide-react";

export default function AdminIntegrationsPage() {
  const integrations = [
    { name: "Gmail", icon: Mail, status: "not_connected", account: null, lastSync: null, desc: "OAuth integration for reading, replying, and composing emails" },
    { name: "Google Calendar", icon: Calendar, status: "not_connected", account: null, lastSync: null, desc: "OAuth integration for viewing and creating meetings" },
    { name: "WhatsApp Business", icon: MessageCircle, status: "not_connected", account: null, lastSync: null, desc: "Official WhatsApp Cloud API for messaging" },
    { name: "Facebook", icon: Facebook, status: "not_connected", account: null, lastSync: null, desc: "Meta Graph API for page posts and messaging" },
    { name: "LinkedIn", icon: Linkedin, status: "not_connected", account: null, lastSync: null, desc: "LinkedIn Marketing API for posts and analytics" },
    { name: "Instagram", icon: Instagram, status: "not_connected", account: null, lastSync: null, desc: "Instagram Graph API for content management" },
    { name: "Website (Articles)", icon: Globe, status: "connected", account: "alaminn.info", lastSync: new Date().toISOString(), desc: "Native content management system" },
    { name: "AI (z-ai-web-dev-sdk)", icon: Bot, status: "connected", account: "GLM-4.6", lastSync: new Date().toISOString(), desc: "AI content generation, diagrams, humanization" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Integrations</h1><p className="text-sm text-muted-foreground mt-1">Manage connected services and external integrations</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((int) => {
          const Icon = int.icon;
          const connected = int.status === "connected";
          return (
            <Card key={int.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${connected ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{int.name}</CardTitle>
                    {int.account && <p className="text-xs text-muted-foreground">{int.account}</p>}
                  </div>
                </div>
                <Badge variant={connected ? "default" : "outline"}>{connected ? "CONNECTED" : "NOT CONNECTED"}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-3">{int.desc}</p>
                {connected ? (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Last sync: {int.lastSync ? new Date(int.lastSync).toLocaleString() : "—"}</span>
                    <Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 mr-1" />Reconnect</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full">Setup Required</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
