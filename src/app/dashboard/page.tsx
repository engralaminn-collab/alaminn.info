"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  Mail,
  CheckSquare,
  Sparkles,
  Share2,
  ShieldCheck,
  Settings,
  Bell,
  LogOut,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  Send,
  Loader2,
  AlertCircle,
  TrendingUp,
  FileText,
  Building2,
  Globe2,
  Phone,
  RefreshCw,
  Lock,
  Eye,
  Sliders,
  UserPlus,
} from "lucide-react";

type TabType =
  | "overview"
  | "calendar"
  | "meetings"
  | "students"
  | "whatsapp"
  | "inbox"
  | "tasks"
  | "followups"
  | "social"
  | "audit"
  | "settings";

export default function CommandCenterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New Student Modal State
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    country: "United Kingdom",
    program: "MSc International Business",
    stage: "NEW",
  });

  // New Task Modal State
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "high",
    dueDate: new Date().toISOString().split("T")[0],
  });

  // Fetch Dashboard Initial Data
  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [dashRes, stdRes, calRes, convRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/students"),
        fetch("/api/calendar"),
        fetch("/api/conversations"),
      ]);

      const [dashJson, stdJson, calJson, convJson] = await Promise.all([
        dashRes.json(),
        stdRes.json(),
        calRes.json(),
        convRes.json(),
      ]);

      if (dashJson.success) setDashboardData(dashJson.data);
      if (stdJson.success) setStudentsData(stdJson.data.students || []);
      if (calJson.success) setCalendarEvents(calJson.data.events || []);
      if (convJson.success) {
        setConversations(convJson.data.conversations || []);
        if (convJson.data.conversations?.length > 0) {
          setActiveConvId(convJson.data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.fullName || !newStudent.email) return;

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStudent),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddStudent(false);
        setNewStudent({
          fullName: "",
          email: "",
          whatsapp: "",
          country: "United Kingdom",
          program: "MSc International Business",
          stage: "NEW",
        });
        loadDashboard();
      }
    } catch (e) {
      alert("Error adding student.");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const json = await res.json();
      if (json.success) {
        setShowAddTask(false);
        setNewTask({
          title: "",
          priority: "high",
          dueDate: new Date().toISOString().split("T")[0],
        });
        loadDashboard();
      }
    } catch (e) {
      alert("Error adding task.");
    }
  };

  const handleSendMessage = async (isApprovedDraft = false, draftContent?: string) => {
    const textToSend = draftContent || replyText;
    if (!textToSend.trim() || !activeConvId) return;

    setIsSending(true);
    try {
      const currentConv = conversations.find((c) => c.id === activeConvId);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConvId,
          contactId: currentConv?.contactId,
          text: textToSend,
          channel: currentConv?.channel || "WHATSAPP",
          isApprovedAiDraft: isApprovedDraft,
        }),
      });

      const json = await res.json();
      if (json.success) {
        // Append message to UI
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === activeConvId) {
              return {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: json.data.id,
                    sender: "alamin",
                    senderName: "Al-Amin (Approved)",
                    text: textToSend,
                    timestamp: new Date().toISOString(),
                    channel: c.channel,
                  },
                ],
              };
            }
            return c;
          })
        );
        setReplyText("");
      }
    } catch (e) {
      alert("Error sending message.");
    } finally {
      setIsSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="min-h-screen bg-sand-950 text-slate-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Top Global Command Bar */}
      <header className="h-16 border-b border-sand-800 bg-sand-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-lg bg-orange-600 flex items-center justify-center font-bold text-white shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                Al-Amin Command Center
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-mono px-1.5 py-0">
                  LIVE
                </Badge>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Dhaka (UTC+6) • ALO Education Ecosystem
              </div>
            </div>
          </Link>
        </div>

        {/* Global Integrations & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Action Buttons */}
          <Button
            size="sm"
            onClick={() => setShowAddStudent(true)}
            className="rounded-lg bg-sand-800 hover:bg-sand-700 text-slate-200 border border-sand-700 text-xs hidden sm:flex items-center gap-1.5"
          >
            <UserPlus className="h-3.5 w-3.5 text-orange-400" />
            <span>Add Student</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setShowAddTask(true)}
            className="rounded-lg bg-sand-800 hover:bg-sand-700 text-slate-200 border border-sand-700 text-xs hidden sm:flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5 text-orange-400" />
            <span>New Task</span>
          </Button>

          <Button
            size="sm"
            onClick={loadDashboard}
            variant="ghost"
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-sand-800 rounded-lg"
            title="Refresh State"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-orange-400" : ""}`} />
          </Button>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="rounded-lg border-sand-700 bg-sand-800 text-xs text-slate-300 hover:bg-sand-700 hover:text-white"
          >
            <Link href="/" target="_blank">
              View Public Site <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={async () => {
              await fetch("/api/v1/auth/logout", { method: "POST" });
              router.push("/admin/login");
            }}
            variant="ghost"
            className="h-8 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
          >
            <LogOut className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Command Center Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <aside className="w-56 sm:w-64 border-r border-sand-800 bg-sand-900/60 p-3 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Operations Navigation
            </div>

            {[
              { id: "overview", label: "Overview & Mission", icon: LayoutDashboard },
              { id: "calendar", label: "Calendar & Schedule", icon: CalendarIcon },
              { id: "meetings", label: "Meeting Hub", icon: Video },
              { id: "students", label: "Students & CRM", icon: Users },
              { id: "whatsapp", label: "WhatsApp Hub", icon: MessageSquare },
              { id: "inbox", label: "Unified Inbox", icon: Mail },
              { id: "tasks", label: "Tasks & Pipeline", icon: CheckSquare },
              { id: "followups", label: "AI Follow-up Engine", icon: Sparkles },
              { id: "social", label: "Social & Content", icon: Share2 },
              { id: "audit", label: "Audit & Governance", icon: ShieldCheck },
              { id: "settings", label: "System & Integrations", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-orange-600 text-white font-semibold shadow-xs"
                      : "text-slate-300 hover:bg-sand-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick System Badge */}
          <div className="p-3 rounded-xl bg-sand-950/60 border border-sand-800/80 text-[11px] space-y-1 text-slate-400">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold">Security Engine</span>
              <span className="text-emerald-400 font-mono">ACTIVE</span>
            </div>
            <div>Google Workspace Sync: OK</div>
            <div>WhatsApp API: Connected</div>
            <div>AI Human Gate: Enforced</div>
          </div>
        </aside>

        {/* Dynamic Center Work Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-sand-950">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-8 max-w-6xl mx-auto">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  Executive Operations Overview
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Real-time admissions metrics, schedule sync, communication queue, and AI follow-up insights.
                </p>
              </div>

              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 shadow-xs">
                  <div className="text-xs font-mono uppercase text-slate-400">Active Students</div>
                  <div className="text-3xl font-black text-white font-display mt-1">
                    {dashboardData?.kpis?.activeStudents || studentsData.length || 24}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">ALO Education Pipeline</div>
                </div>

                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 shadow-xs">
                  <div className="text-xs font-mono uppercase text-slate-400">Today's Meetings</div>
                  <div className="text-3xl font-black text-orange-400 font-display mt-1">
                    {dashboardData?.kpis?.upcomingMeetingsToday ?? 3}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Google Meet Synced</div>
                </div>

                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 shadow-xs">
                  <div className="text-xs font-mono uppercase text-slate-400">Tasks Due</div>
                  <div className="text-3xl font-black text-amber-400 font-display mt-1">
                    {dashboardData?.kpis?.tasksDueCount ?? 5}
                  </div>
                  <div className="text-[11px] text-amber-300 mt-1">Requires Attention</div>
                </div>

                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 shadow-xs">
                  <div className="text-xs font-mono uppercase text-slate-400">Social Queue</div>
                  <div className="text-3xl font-black text-blue-400 font-display mt-1">
                    {dashboardData?.socialQueue?.length ?? 3}
                  </div>
                  <div className="text-[11px] text-blue-300 mt-1">Drafts & Approvals</div>
                </div>
              </div>

              {/* 2-Column Grid: Today's Schedule & AI Action Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Schedule Card */}
                <div className="p-6 rounded-2xl border border-sand-800 bg-sand-900/70 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sand-800">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-orange-400" />
                      <h2 className="font-display text-base font-bold text-white">
                        Today's Scheduled Consultations
                      </h2>
                    </div>
                    <Badge className="bg-sand-800 text-slate-300 border-sand-700 text-[10px] font-mono">
                      Asia/Dhaka
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {calendarEvents.slice(0, 3).map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3.5 rounded-xl border border-sand-800 bg-sand-950/70 flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-white">{evt.title}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="text-orange-400 font-semibold">{evt.time || "03:00 PM"}</span>
                            <span>•</span>
                            <span>{evt.contactEmail}</span>
                          </div>
                        </div>

                        <a
                          href={evt.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <Video className="h-3.5 w-3.5" />
                          <span>Join</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Follow-up Recommendations */}
                <div className="p-6 rounded-2xl border border-sand-800 bg-sand-900/70 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-sand-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-orange-400" />
                      <h2 className="font-display text-base font-bold text-white">
                        AI Follow-Up Recommendations
                      </h2>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
                      HUMAN APPROVAL REQUIRED
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl border border-sand-800 bg-sand-950/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300">Unanswered WhatsApp Inquiry</span>
                        <span className="font-mono text-[10px] text-slate-400">2h ago</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Student asked about IELTS waiver for UK MSc. Suggested draft generated.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("inbox")}
                        className="w-full rounded-lg bg-sand-800 hover:bg-sand-700 text-slate-200 text-xs"
                      >
                        Review Draft in Unified Inbox <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>

                    <div className="p-3.5 rounded-xl border border-sand-800 bg-sand-950/70 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-300">Pre-Meeting Briefing Ready</span>
                        <span className="font-mono text-[10px] text-slate-400">Scheduled for 05:00 PM</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Profile audited: BBA graduate, CGPA 3.45. Recommend 3 Russell Group universities.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab("students")}
                        className="w-full rounded-lg bg-sand-800 hover:bg-sand-700 text-slate-200 text-xs"
                      >
                        Inspect Student Profile <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALENDAR & SCHEDULE */}
          {activeTab === "calendar" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Calendar & Schedule Engine
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Google Calendar bidirectional sync, consultation slots, and direct Google Meet room links.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs font-mono">
                    Google Calendar: CONNECTED
                  </Badge>
                </div>
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] font-mono">
                          {evt.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {evt.start ? new Date(evt.start).toLocaleDateString() : "Today"}
                        </span>
                      </div>

                      <h3 className="font-display text-base font-bold text-white">
                        {evt.title}
                      </h3>

                      <p className="text-xs text-slate-300 mt-1">
                        Attendee: {evt.contactName} ({evt.contactEmail})
                      </p>

                      <div className="mt-2 text-xs text-slate-400">
                        <span className="font-semibold text-slate-200">Time:</span> {evt.time} ({evt.timezone || "Asia/Dhaka"})
                      </div>
                    </div>

                    <div className="pt-3 border-t border-sand-800 flex items-center gap-2">
                      <a
                        href={evt.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Launch Google Meet</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENTS CRM */}
          {activeTab === "students" && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Students & Inquiries CRM
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    End-to-end admissions pipeline tracking for ALO Education applicants.
                  </p>
                </div>

                <Button
                  onClick={() => setShowAddStudent(true)}
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Register New Student</span>
                </Button>
              </div>

              {/* Search & Filters */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Search by student name, email, or WhatsApp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl border-sand-800 bg-sand-900 text-xs"
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="rounded-2xl border border-sand-800 bg-sand-900/80 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-sand-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-sand-800">
                      <tr>
                        <th className="py-3 px-4">Student Name</th>
                        <th className="py-3 px-4">Target Country</th>
                        <th className="py-3 px-4">Stage</th>
                        <th className="py-3 px-4">English & GPA</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-800/60">
                      {studentsData
                        .filter(
                          (s) =>
                            s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.email.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((std) => (
                          <tr key={std.id} className="hover:bg-sand-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {std.fullName}
                            </td>
                            <td className="py-3.5 px-4">{std.country}</td>
                            <td className="py-3.5 px-4">
                              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[10px] font-mono">
                                {std.stage}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {std.englishTest} • {std.academicGpa}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              <div>{std.email}</div>
                              <div className="text-[10px] text-emerald-400">{std.whatsapp}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setActiveTab("inbox");
                                }}
                                className="rounded-lg border-sand-700 bg-sand-800 text-[11px] h-7"
                              >
                                Message
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: UNIFIED INBOX & WHATSAPP */}
          {(activeTab === "inbox" || activeTab === "whatsapp") && (
            <div className="h-full flex flex-col max-w-6xl mx-auto">
              <div className="mb-4">
                <h1 className="font-display text-2xl font-bold text-white">
                  Unified Communication Center & WhatsApp Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Manage WhatsApp, Email, Facebook, and Web inquiries with AI-assisted drafting and human approval.
                </p>
              </div>

              <div className="flex-1 rounded-2xl border border-sand-800 bg-sand-900/90 flex overflow-hidden min-h-[500px]">
                {/* Conversation List */}
                <div className="w-80 border-r border-sand-800 flex flex-col overflow-y-auto">
                  <div className="p-3 border-b border-sand-800 text-xs font-mono font-bold uppercase text-slate-400">
                    Active Conversations ({conversations.length})
                  </div>
                  <div className="divide-y divide-sand-800/60">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConvId(conv.id)}
                        className={`w-full text-left p-3.5 transition-colors ${
                          activeConvId === conv.id
                            ? "bg-sand-800"
                            : "hover:bg-sand-800/50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-xs text-white truncate">
                            {conv.contactName}
                          </span>
                          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-[9px] font-mono px-1 py-0">
                            {conv.channel}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {conv.lastMessage}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Chat Viewer */}
                {activeConversation ? (
                  <div className="flex-1 flex flex-col justify-between">
                    {/* Header */}
                    <div className="p-4 border-b border-sand-800 flex items-center justify-between bg-sand-950/60">
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          {activeConversation.contactName}
                          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                            {activeConversation.channel}
                          </Badge>
                        </div>
                        <div className="text-xs text-slate-400">
                          {activeConversation.contactEmail} • {activeConversation.contactPhone}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400">
                          Stage: {activeConversation.studentProfile?.stage || "COUNSELING"}
                        </span>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {activeConversation.messages.map((m: any) => (
                        <div
                          key={m.id}
                          className={`flex flex-col ${
                            m.sender === "student" ? "items-start" : "items-end"
                          }`}
                        >
                          <div
                            className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                              m.isDraft
                                ? "bg-amber-950/60 border border-amber-600/40 text-amber-200"
                                : m.sender === "student"
                                ? "bg-sand-800 text-slate-200"
                                : "bg-orange-600 text-white"
                            }`}
                          >
                            {m.isDraft && (
                              <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase text-amber-400 mb-1">
                                <Sparkles className="h-3 w-3" />
                                <span>AI Suggested Draft (Approval Required)</span>
                              </div>
                            )}
                            <p>{m.text}</p>
                          </div>

                          <div className="text-[10px] font-mono text-slate-500 mt-1 px-1">
                            {m.senderName} • {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>

                          {m.isDraft && (
                            <div className="mt-2 flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSendMessage(true, m.text)}
                                disabled={isSending}
                                className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approve & Dispatch
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Composer */}
                    <div className="p-3 border-t border-sand-800 bg-sand-950/60 flex items-center gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply via ${activeConversation.channel}...`}
                        className="rounded-xl border-sand-800 bg-sand-900 text-xs"
                      />
                      <Button
                        onClick={() => handleSendMessage(false)}
                        disabled={isSending || !replyText.trim()}
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-4 text-xs font-semibold"
                      >
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Select a conversation to start messaging.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: TASKS & PIPELINE */}
          {activeTab === "tasks" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-white">
                    Tasks & Action Hub
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage counseling tasks, application deadlines, and client follow-ups.
                  </p>
                </div>

                <Button
                  onClick={() => setShowAddTask(true)}
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Create Task</span>
                </Button>
              </div>

              <div className="space-y-3">
                {dashboardData?.tasksDue?.map((task: any) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl border border-sand-800 bg-sand-900/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="rounded border-sand-700 bg-sand-950 text-orange-600 focus:ring-0 h-4 w-4"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{task.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Priority: <span className="text-amber-400 uppercase font-semibold">{task.priority}</span> • Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "Today"}
                        </div>
                      </div>
                    </div>

                    <Badge className="bg-sand-800 text-slate-300 border-sand-700 text-[10px] font-mono">
                      {task.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SOCIAL & CONTENT */}
          {activeTab === "social" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  Content & Social Media Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Draft, AI review, approve, and schedule posts across LinkedIn, Facebook, and alaminn.info.
                </p>
              </div>

              <div className="space-y-4">
                {dashboardData?.socialQueue?.map((post: any) => (
                  <div
                    key={post.id}
                    className="p-6 rounded-2xl border border-sand-800 bg-sand-900/80 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-mono">
                        {post.platform}
                      </Badge>
                      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-mono">
                        STAGE: {post.stage}
                      </Badge>
                    </div>

                    <h3 className="font-display text-base font-bold text-white">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {post.content}
                    </p>

                    <div className="pt-3 border-t border-sand-800 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Scheduled: {new Date(post.scheduledFor).toLocaleDateString()}
                      </span>

                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs h-7">
                          Al-Amin Approve & Publish
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & INTEGRATIONS */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">
                  System Settings & Official Integrations
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Manage API tokens, Google Workspace credentials, and governance policies.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">Google Calendar API</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">ACTIVE</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Syncing consultation requests with alaminn.official@gmail.com
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-sand-800 bg-sand-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">WhatsApp Business API</span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">ACTIVE</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    Official webhook connected (+880 1716-609554)
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 bg-sand-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-sand-800 bg-sand-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Add New Student to CRM Pipeline
            </h2>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <Input
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="rounded-xl border-sand-700 bg-sand-950 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <Input
                  type="email"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  className="rounded-xl border-sand-700 bg-sand-950 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp</label>
                <Input
                  value={newStudent.whatsapp}
                  onChange={(e) => setNewStudent({ ...newStudent, whatsapp: e.target.value })}
                  className="rounded-xl border-sand-700 bg-sand-950 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddStudent(false)}
                  className="text-xs text-slate-400"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold">
                  Save Student
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 bg-sand-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-sand-800 bg-sand-900 p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-white">
              Create New Action Task
            </h2>
            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Audit SOP and verify scholarship eligibility"
                  className="rounded-xl border-sand-700 bg-sand-950 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAddTask(false)}
                  className="text-xs text-slate-400"
                >
                  Cancel
                </Button>
                <Button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
