"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Send, AlertCircle, CheckCircle } from "lucide-react";

export default function AdminEmailPage() {
  const smtpConfigured = !!(process.env.NEXT_PUBLIC_SMTP_STATUS || false);
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Email Center</h1><p className="text-sm text-muted-foreground mt-1">Gmail integration and email delivery management</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" />Gmail (OAuth)</CardTitle><Badge variant="outline">NOT CONNECTED</Badge></CardHeader><CardContent>
          <p className="text-xs text-muted-foreground mb-3">Connect Gmail via OAuth 2.0 to read, reply, and compose emails as engr.alaminn@gmail.com. Requires Google Cloud project with Gmail API enabled.</p>
          <Button variant="outline" size="sm" className="w-full">Connect Gmail</Button>
        </CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between pb-3"><CardTitle className="text-base flex items-center gap-2"><Send className="h-4 w-4" />SMTP / Resend</CardTitle><Badge variant={smtpConfigured ? "default" : "outline"}>{smtpConfigured ? "CONFIGURED" : "NOT CONFIGURED"}</Badge></CardHeader><CardContent>
          <p className="text-xs text-muted-foreground mb-3">Configure SMTP or Resend API key in Settings to enable email delivery. Required for booking notifications to engr.alaminn@gmail.com.</p>
          <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = "/admin/settings"}>Configure SMTP</Button>
        </CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle>Email Delivery Status</CardTitle></CardHeader><CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 border border-border rounded-lg"><span className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Booking Notifications</span><Badge variant="outline">{smtpConfigured ? "ACTIVE" : "BLOCKED"}</Badge></div>
          <div className="flex items-center justify-between p-2 border border-border rounded-lg"><span className="text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4 text-amber-500" />Student Confirmations</span><Badge variant="outline">{smtpConfigured ? "ACTIVE" : "BLOCKED"}</Badge></div>
          <div className="flex items-center justify-between p-2 border border-border rounded-lg"><span className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />In-app Notifications</span><Badge>ACTIVE</Badge></div>
          <div className="flex items-center justify-between p-2 border border-border rounded-lg"><span className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Audit Logging</span><Badge>ACTIVE</Badge></div>
        </div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Test Email</CardTitle></CardHeader><CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">Send a test email to verify SMTP/Resend configuration.</p>
        <Button variant="outline" size="sm" onClick={() => window.location.href = "/admin/settings"}>Send Test Email</Button>
      </CardContent></Card>
    </div>
  );
}
