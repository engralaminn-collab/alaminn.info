"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { adminFetch } from "@/components/admin/lib";
import { Wand2, Copy } from "lucide-react";

export default function AdminDiagramsPage() {
  const [description, setDescription] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [mermaid, setMermaid] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!description.trim()) { toast.error("Description required."); return; }
    setLoading(true);
    try {
      const d = await adminFetch("/api/v1/admin/ai/diagram", {
        method: "POST", body: JSON.stringify({ description, type: diagramType }),
      });
      if (d.success && d.data) { setMermaid((d.data as { mermaid?: string }).mermaid || ""); toast.success("Diagram generated."); }
      else { toast.error("Generation failed."); }
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">AI Diagram Designer</h1><p className="text-sm text-muted-foreground mt-1">Generate Mermaid diagrams from text descriptions</p></div>
      <Card><CardHeader><CardTitle className="text-base">Create Diagram</CardTitle></CardHeader><CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Diagram Type</label>
          <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" value={diagramType} onChange={(e) => setDiagramType(e.target.value)}>
            <option value="flowchart">Flowchart</option><option value="sequence">Sequence Diagram</option>
            <option value="class">Class Diagram</option><option value="state">State Diagram</option>
            <option value="er">Entity Relationship</option><option value="gantt">Gantt Chart</option>
            <option value="kanban">Kanban</option><option value="user-journey">User Journey</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Description</label>
          <textarea className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm min-h-[100px]" placeholder="Describe what the diagram should show..." value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <Button onClick={generate} disabled={loading}><Wand2 className="h-4 w-4 mr-2" />{loading ? "Generating..." : "Generate Diagram"}</Button>
      </CardContent></Card>
      {mermaid && (
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-base">Generated Diagram</CardTitle>
          <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(mermaid); toast.success("Copied."); }}><Copy className="h-3 w-3 mr-1" />Copy</Button></div>
        </CardHeader><CardContent>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto whitespace-pre-wrap font-mono">{mermaid}</pre>
          <p className="text-xs text-muted-foreground mt-2">Paste this code into any Mermaid renderer (mermaid.live, GitHub, etc.) to view the diagram.</p>
        </CardContent></Card>
      )}
    </div>
  );
}
