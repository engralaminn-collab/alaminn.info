"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/components/admin/lib";
import { useEffect, useState } from "react";
import {
  Calendar, Users, MessageSquare, Mail, CheckCircle, Clock,
  Bot, Shield, FileText, Send,
  TrendingUp, Inbox, UserCheck, Briefcase
} from "lucide-react";

/**
 * Al-Amin Command Center — enhanced dashboard with real data.
 * Ported from ALO Labs AgentOS + Marketing OS patterns.
 *
 * Shows: Today's Meetings, New Bookings, New Leads, Unread Messages,
 * Tasks, Follow-ups, AI Activity, Content to Approve.
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    meetings: 0, bookings: 0, leads: 0, unread: 0,
    tasks: 0, followUps: 0, aiActivity: 0, approvalsPending: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Record<string, unknown>[]>([]);
  const [recentTasks, setRecentTasks] = useState<Record<string, unknown>[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      adminFetch("/api/v1/admin/dashboard"),
      adminFetch("/api/v1/admin/tasks"),
      adminFetch("/api/v1/admin/inquiries"),
    ]).then((results) => {
      if (results[0].status === "fulfilled") {
        const d = results[0].value;
        if (d.success && d.data) {
          const data = d.data as Record<string, unknown>;
          setStats((prev) => ({
            ...prev,
            meetings: (data.meetings as unknown[])?.length || 0,
            bookings: (data.inquiries as unknown[])?.length || 0,
            leads: (data.opportunities as unknown[])?.length || 0,
            tasks: (data.tasks as unknown[])?.length || 0,
            approvalsPending: (data.aiApprovals as unknown[])?.length || 0,
          }));
          setRecentBookings((data.inquiries as Record<string, unknown>[]) || []);
        }
      }
      if (results[1].status === "fulfilled") {
        const d = results[1].value;
        if (d.success && d.data) {
          const data = d.data as Record<string, unknown>;
          setRecentTasks((data.tasks as Record<string, unknown>[]) || []);
          setStats((prev) => ({ ...prev, tasks: (data.tasks as unknown[])?.length || 0 }));
        }
      }
      if (results[2].status === "fulfilled") {
        const d = results[2].value;
        if (d.success && d.data) {
          const data = d.data as Record<string, unknown>;
          setRecentInquiries((data.inquiries as Record<string, unknown>[]) || []);
        }
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = [
    { label: "Today's Meetings", value: stats.meetings, icon: Calendar, color: "from-blue-500 to-blue-600" },
    { label: "New Bookings", value: stats.bookings, icon: Users, color: "from-orange-500 to-orange-600" },
    { label: "New Leads", value: stats.leads, icon: Briefcase, color: "from-green-500 to-green-600" },
    { label: "Unread Messages", value: stats.unread, icon: MessageSquare, color: "from-purple-500 to-purple-600" },
    { label: "Tasks", value: stats.tasks, icon: CheckCircle, color: "from-indigo-500 to-indigo-600" },
    { label: "Follow-ups", value: stats.followUps, icon: Clock, color: "from-red-500 to-red-600" },
    { label: "AI Activity", value: stats.aiActivity, icon: Bot, color: "from-amber-500 to-amber-600" },
    { label: "Approvals", value: stats.approvalsPending, icon: Shield, color: "from-rose-500 to-rose-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Al-Amin Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Complete overview of your ecosystem activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.label} className="relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <p className="text-3xl font-bold mt-1 tabular">{loading ? "..." : c.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Two-column layout: Recent bookings + Recent tasks */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-orange-600" />
              Recent Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : recentBookings.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No recent bookings.</div>
            ) : (
              <div className="space-y-2">
                {recentBookings.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">
                        {String((item.contact as { fullName?: string })?.fullName || "Unknown")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {String(item.reference || item.id || "")}
                      </div>
                    </div>
                    <Badge variant="outline">{String(item.status || "new")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>
            ) : recentTasks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">No tasks.</div>
            ) : (
              <div className="space-y-2">
                {recentTasks.slice(0, 8).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{String(item.title || "Untitled task")}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.dueDate ? `Due: ${new Date(String(item.dueDate)).toDateString()}` : "No due date"}
                      </div>
                    </div>
                    <Badge variant={String(item.priority) === "high" ? "destructive" : String(item.priority) === "medium" ? "secondary" : "outline"}>
                      {String(item.priority || "medium")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm"><Calendar className="h-4 w-4 mr-2" />View Calendar</Button>
            <Button variant="outline" size="sm"><Inbox className="h-4 w-4 mr-2" />Open Inbox</Button>
            <Button variant="outline" size="sm"><Bot className="h-4 w-4 mr-2" />AI Assistant</Button>
            <Button variant="outline" size="sm"><FileText className="h-4 w-4 mr-2" />Create Content</Button>
            <Button variant="outline" size="sm"><UserCheck className="h-4 w-4 mr-2" />View Students</Button>
            <Button variant="outline" size="sm"><Shield className="h-4 w-4 mr-2" />Security</Button>
            <Button variant="outline" size="sm"><TrendingUp className="h-4 w-4 mr-2" />Analytics</Button>
            <Button variant="outline" size="sm"><Send className="h-4 w-4 mr-2" />Social Media</Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent inquiries */}
      {recentInquiries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-4 w-4 text-purple-600" />
              Recent Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentInquiries.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {String((item.contact as { fullName?: string })?.fullName || "Unknown")}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {String(item.subject || item.message || "")}
                    </div>
                  </div>
                  <Badge variant="outline">{String(item.status || "new")}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
