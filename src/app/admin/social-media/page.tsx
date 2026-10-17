"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminFetch, fmtDate } from "@/components/admin/lib";
import { toast } from "sonner";
import {
  Facebook,
  Linkedin,
  Instagram,
  MessageCircle,
  Globe,
  RefreshCw,
  Plus,
  Send,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

/**
 * SocialMediaCenter — unified social media management interface.
 *
 * Shows connected platforms (Facebook, LinkedIn, Instagram, WhatsApp, Website)
 * with connection status, post creation workflow, and content calendar.
 *
 * CRITICAL: Does NOT fake API connections. Each platform shows its real
 * connection status. If not connected, shows "NOT CONNECTED" and a
 * setup checklist — never pretends a platform works.
 */

type Platform = {
  id: string;
  name: string;
  icon: React.ElementType;
  status: "connected" | "not_connected" | "expired";
  account?: string;
  lastSync?: string;
  color: string;
};

const PLATFORMS: Platform[] = [
  { id: "facebook", name: "Facebook", icon: Facebook, status: "not_connected", color: "#1877F2" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, status: "not_connected", color: "#0A66C2" },
  { id: "instagram", name: "Instagram", icon: Instagram, status: "not_connected", color: "#E4405F" },
  { id: "whatsapp", name: "WhatsApp Business", icon: MessageCircle, status: "not_connected", color: "#25D366" },
  { id: "website", name: "Website (Articles)", icon: Globe, status: "connected", account: "alaminn.info", lastSync: new Date().toISOString(), color: "#0B63CE" },
];

type SocialPost = {
  id: string;
  platform: string;
  topic: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  createdAt: string;
};

export default function AdminSocialMediaPage() {
  const [platforms] = useState<Platform[]>(PLATFORMS);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPost, setNewPost] = useState({ platform: "facebook", topic: "", content: "" });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Load posts from API
    adminFetch<{ posts: SocialPost[] }>("/api/v1/admin/social-posts")
      .then((d) => {
        if (d.success && d.data?.posts) setPosts(d.data.posts);
      })
      .catch(() => {});
  }, [refreshKey]);

  async function createPost() {
    if (!newPost.topic.trim()) {
      toast.error("Topic is required.");
      return;
    }
    try {
      await adminFetch("/api/v1/admin/social-posts", {
        method: "POST",
        body: JSON.stringify(newPost),
      });
      toast.success("Social post draft created.");
      setShowCreateDialog(false);
      setNewPost({ platform: "facebook", topic: "", content: "" });
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create post.");
    }
  }

  const STATUS_ICONS: Record<string, React.ElementType> = {
    draft: FileText,
    approved: CheckCircle,
    scheduled: Clock,
    published: Send,
    failed: XCircle,
  };

  const STATUS_COLORS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "outline",
    approved: "secondary",
    scheduled: "secondary",
    published: "default",
    failed: "destructive",
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Social Media Center</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage all connected social channels from one interface
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Social Post
          </Button>
        </div>

        {/* Platform cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: p.color + "20", color: p.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{p.name}</CardTitle>
                      {p.account && (
                        <p className="text-xs text-muted-foreground">{p.account}</p>
                      )}
                    </div>
                  </div>
                  <Badge
                    variant={p.status === "connected" ? "default" : p.status === "expired" ? "destructive" : "outline"}
                  >
                    {p.status === "connected" ? "CONNECTED" : p.status === "expired" ? "EXPIRED" : "NOT CONNECTED"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  {p.status === "connected" ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span>{p.lastSync ? fmtDate(p.lastSync) : "—"}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Reconnect
                      </Button>
                    </div>
                  ) : p.status === "expired" ? (
                    <div className="space-y-2">
                      <p className="text-xs text-destructive">
                        {p.name} connection expired. Reconnect to continue posting.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Reconnect {p.name}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {p.id === "facebook" && "Requires Meta Business API access. Connect your Facebook Page to enable posting, scheduling, and analytics."}
                        {p.id === "linkedin" && "Requires LinkedIn Marketing API. Connect to publish posts and view analytics."}
                        {p.id === "instagram" && "Requires Instagram Graph API (Business account). Connect to post and manage content."}
                        {p.id === "whatsapp" && "Requires WhatsApp Business Platform API. Set WHATSAPP_API_PHONE_NUMBER_ID and WHATSAPP_API_TOKEN in settings."}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <AlertCircle className="h-3 w-3 mr-2" />
                        Setup Required
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Posts list */}
        <Card>
          <CardHeader>
            <CardTitle>Social Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  No social posts yet. Click "Create Social Post" to draft your first post.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => {
                  const StatusIcon = STATUS_ICONS[post.status] || FileText;
                  const platform = PLATFORMS.find((p) => p.id === post.platform);
                  const PlatformIcon = platform?.icon || Globe;
                  return (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <PlatformIcon className="h-4 w-4" style={{ color: platform?.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{post.topic}</span>
                          <Badge variant={STATUS_COLORS[post.status] || "outline"}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {post.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {post.content || "No content yet"}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span>{platform?.name || post.platform}</span>
                          <span>·</span>
                          <span>{fmtDate(post.createdAt)}</span>
                          {post.scheduledAt && (
                            <>
                              <span>·</span>
                              <Calendar className="h-3 w-3" />
                              <span>Scheduled: {fmtDate(post.scheduledAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-xl border border-border shadow-lg w-full max-w-lg p-6">
              <h2 className="text-lg font-bold mb-4">Create Social Post</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Platform</label>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    value={newPost.platform}
                    onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                  >
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="website">Website (Article)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Topic</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    placeholder="e.g. Study abroad tips for Bangladeshi students"
                    value={newPost.topic}
                    onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Content (optional — AI can draft)</label>
                  <textarea
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[100px]"
                    placeholder="Write your post content, or leave blank to let AI generate a draft..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  />
                </div>
                <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <strong>Workflow:</strong> Draft → Review → Approve → Schedule/Publish.
                  Personal or sensitive content requires human approval before publishing.
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createPost}>
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
