"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wand2, Copy } from "lucide-react";
import { adminFetch } from "@/components/admin/lib";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminHumanizerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState("casual");
  const [loading, setLoading] = useState(false);

  async function humanize() {
    if (!input.trim()) { toast.error("Text required."); return; }
    setLoading(true);
    try {
      const d = await adminFetch("/api/v1/admin/ai/humanize", { method: "POST", body: JSON.stringify({ text: input, tone }) });
      if (d.success && d.data) { setOutput((d.data as { humanized?: string }).humanized || ""); toast.success("Text humanized."); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Content Humanizer</h1><p className="text-sm text-muted-foreground mt-1">Rewrite AI text to sound natural and human</p></div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Input</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><label className="text-sm font-medium mb-1.5 block">Tone</label>
            <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={tone} onChange={(e) => setTone(e.target.value)}>
              <option value="casual">Casual</option><option value="professional">Professional</option>
              <option value="friendly">Friendly</option><option value="persuasive">Persuasive</option>
            </select></div>
          <div><label className="text-sm font-medium mb-1.5 block">Text to Humanize</label>
            <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[200px]" placeholder="Paste AI-generated text here..." value={input} onChange={(e) => setInput(e.target.value)} /></div>
          <Button onClick={humanize} disabled={loading}><Wand2 className="h-4 w-4 mr-2" />{loading ? "Processing..." : "Humanize Text"}</Button>
        </CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Output</CardTitle>
          {output && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(output); toast.success("Copied."); }}><Copy className="h-3 w-3 mr-1" />Copy</Button>}</CardHeader><CardContent>
          <div className="rounded-lg bg-muted p-4 text-sm min-h-[200px] whitespace-pre-wrap">{output || "Humanized text will appear here."}</div>
        </CardContent></Card>
      </div>
    </div>
  );
}
