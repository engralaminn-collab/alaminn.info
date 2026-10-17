"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-primitives";
import { CheckCircle2, Download, FileJson, GitBranch, RotateCcw, ShieldCheck } from "lucide-react";

type NodeKind = "actor" | "service" | "control" | "data" | "external";
type DiagramNode = {
  id: string;
  label: string;
  detail: string;
  evidence: string[];
  x: number;
  y: number;
  kind: NodeKind;
};
type DiagramEdge = { from: string; to: string; label: string; dashed?: boolean };
type Diagram = {
  id: string;
  name: string;
  description: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
};

const DIAGRAMS: Diagram[] = [
  {
    id: "runtime",
    name: "Runtime architecture",
    description: "Source-backed request, control, persistence, and provider boundaries.",
    nodes: [
      { id: "visitor", label: "Visitor / admin", detail: "Public visitors use the site and protected administrators use the Command Center.", evidence: ["src/app/page.tsx", "src/components/admin/admin-shell.tsx"], x: 40, y: 235, kind: "actor" },
      { id: "next", label: "Next.js application", detail: "The App Router renders public, Higher Study, English Learning, and private admin surfaces.", evidence: ["src/app/layout.tsx", "next.config.ts"], x: 230, y: 95, kind: "service" },
      { id: "api", label: "API routes", detail: "Versioned routes validate input and own application mutations.", evidence: ["src/app/api/v1", "src/lib/admin-api.ts"], x: 230, y: 305, kind: "service" },
      { id: "auth", label: "Auth + RBAC", detail: "Signed sessions, database-confirmed roles, permissions, and mutation-origin checks protect admin APIs.", evidence: ["src/lib/auth.ts", "src/lib/permissions.ts"], x: 440, y: 35, kind: "control" },
      { id: "prisma", label: "Prisma data layer", detail: "Prisma is the sole ORM boundary for operational records.", evidence: ["src/lib/db.ts", "prisma/schema.prisma"], x: 440, y: 235, kind: "data" },
      { id: "sqlite", label: "SQLite database", detail: "The current schema uses SQLite. Production durability and backup verification remain environment-dependent.", evidence: ["prisma/schema.prisma", "scripts/backup-db.ts"], x: 660, y: 235, kind: "data" },
      { id: "worker", label: "AI provider adapter (blocked)", detail: "No generative provider is selected or credentialed. Queued tasks remain durable evidence of intake, never fabricated output.", evidence: ["src/app/api/v1/admin/integrations/route.ts", "src/app/api/v1/admin/ai-tasks/route.ts"], x: 440, y: 430, kind: "external" },
      { id: "providers", label: "Official providers", detail: "Email, WhatsApp, and AI execution require official provider credentials. Social publishing is not implemented.", evidence: ["src/lib/email", "src/lib/whatsapp", "src/app/api/v1/admin/integrations/route.ts"], x: 660, y: 430, kind: "external" },
      { id: "approval", label: "Human approval", detail: "Generated drafts cannot be approved before a persisted result reaches awaiting-approval.", evidence: ["src/app/api/v1/admin/approvals/route.ts"], x: 840, y: 335, kind: "control" },
    ],
    edges: [
      { from: "visitor", to: "next", label: "HTTPS" },
      { from: "visitor", to: "api", label: "HTTPS / JSON" },
      { from: "next", to: "auth", label: "session check" },
      { from: "api", to: "auth", label: "permission gate" },
      { from: "api", to: "prisma", label: "validated query" },
      { from: "prisma", to: "sqlite", label: "read / write" },
      { from: "prisma", to: "worker", label: "queued task", dashed: true },
      { from: "api", to: "providers", label: "official API", dashed: true },
      { from: "worker", to: "providers", label: "model request", dashed: true },
      { from: "worker", to: "approval", label: "draft result" },
      { from: "approval", to: "prisma", label: "decision" },
    ],
  },
  {
    id: "booking",
    name: "Booking transaction",
    description: "Durable booking is separated from non-fatal external delivery attempts.",
    nodes: [
      { id: "form", label: "Meeting form", detail: "Collects slot, contact, topic, and explicit privacy consent.", evidence: ["src/components/site/schedule-meeting-modal.tsx"], x: 35, y: 235, kind: "actor" },
      { id: "endpoint", label: "Booking API", detail: "Normalizes and validates the booking request and rate-limits abuse.", evidence: ["src/app/api/v1/meetings/route.ts"], x: 225, y: 235, kind: "service" },
      { id: "checks", label: "Conflict + duplicate checks", detail: "Rejects slot conflicts and repeated contact submissions before mutation.", evidence: ["src/app/api/v1/meetings/route.ts"], x: 420, y: 90, kind: "control" },
      { id: "tx", label: "Database transaction", detail: "Creates meeting, contact/inquiry evidence, task, notification, analytics, and audit records atomically.", evidence: ["src/app/api/v1/meetings/route.ts", "prisma/schema.prisma"], x: 420, y: 335, kind: "data" },
      { id: "email", label: "Email attempt", detail: "Confirmation is attempted after the durable transaction. Failure is recorded and does not erase the booking.", evidence: ["src/lib/email/queue.ts", "src/lib/email/templates.ts"], x: 650, y: 90, kind: "external" },
      { id: "ops", label: "Command Center", detail: "Operators see the booking, follow-up task, notification, and email-attempt evidence.", evidence: ["src/app/admin/bookings/page.tsx", "src/app/api/v1/admin/dashboard/route.ts"], x: 650, y: 335, kind: "service" },
      { id: "calendar", label: "Calendar provider", detail: "External calendar event creation is not implemented and is therefore not shown as connected.", evidence: ["src/app/api/v1/admin/integrations/route.ts"], x: 840, y: 235, kind: "external" },
    ],
    edges: [
      { from: "form", to: "endpoint", label: "consented request" },
      { from: "endpoint", to: "checks", label: "validate" },
      { from: "checks", to: "tx", label: "available" },
      { from: "tx", to: "email", label: "after commit", dashed: true },
      { from: "tx", to: "ops", label: "operational records" },
      { from: "ops", to: "calendar", label: "not implemented", dashed: true },
    ],
  },
  {
    id: "ai-governance",
    name: "AI approval lifecycle",
    description: "Every model output is a draft; external communication stays human-controlled.",
    nodes: [
      { id: "requester", label: "Authorized requester", detail: "An administrator submits an objective, evidence, sensitivity, and output requirement.", evidence: ["src/app/admin/ai-assistant/page.tsx"], x: 35, y: 235, kind: "actor" },
      { id: "intake", label: "Governed task API", detail: "The API enforces permission checks and approvalRequired=true.", evidence: ["src/app/api/v1/admin/ai-tasks/route.ts"], x: 225, y: 235, kind: "control" },
      { id: "queue", label: "Queued", detail: "A durable database record is evidence of intake, not evidence that content was generated.", evidence: ["prisma/schema.prisma"], x: 425, y: 90, kind: "data" },
      { id: "processing", label: "Provider execution (blocked)", detail: "Execution can start only after an approved provider adapter and credentials are deployed; none are configured in this release.", evidence: ["src/app/api/v1/admin/integrations/route.ts"], x: 425, y: 335, kind: "external" },
      { id: "draft", label: "Awaiting approval", detail: "A non-empty persisted result is required before a decision can be recorded.", evidence: ["src/app/api/v1/admin/approvals/route.ts"], x: 650, y: 235, kind: "data" },
      { id: "review", label: "Human reviewer", detail: "A permitted reviewer can approve, reject, or request revision with an audit trail.", evidence: ["src/app/admin/approvals/page.tsx", "src/app/api/v1/admin/approvals/route.ts"], x: 840, y: 235, kind: "control" },
    ],
    edges: [
      { from: "requester", to: "intake", label: "brief" },
      { from: "intake", to: "queue", label: "create" },
      { from: "queue", to: "processing", label: "atomic claim" },
      { from: "processing", to: "draft", label: "persist result" },
      { from: "draft", to: "review", label: "review" },
      { from: "review", to: "processing", label: "revision", dashed: true },
    ],
  },
];

const COLORS: Record<NodeKind, { fill: string; stroke: string; text: string }> = {
  actor: { fill: "#fff7ed", stroke: "#ea580c", text: "#9a3412" },
  service: { fill: "#eff6ff", stroke: "#2563eb", text: "#1e3a8a" },
  control: { fill: "#f0fdf4", stroke: "#16a34a", text: "#14532d" },
  data: { fill: "#faf5ff", stroke: "#9333ea", text: "#581c87" },
  external: { fill: "#f8fafc", stroke: "#64748b", text: "#334155" },
};

function downstream(diagram: Diagram, start: string): Set<string> {
  const seen = new Set<string>([start]);
  const queue = [start];
  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of diagram.edges) {
      if (edge.from === current && !seen.has(edge.to)) {
        seen.add(edge.to);
        queue.push(edge.to);
      }
    }
  }
  return seen;
}

function download(name: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function ArchitecturePage() {
  const [diagramId, setDiagramId] = useState(DIAGRAMS[0].id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const diagram = DIAGRAMS.find((item) => item.id === diagramId) || DIAGRAMS[0];
  const selected = diagram.nodes.find((node) => node.id === selectedId) || null;
  const traced = selectedId ? downstream(diagram, selectedId) : new Set<string>();
  const nodeById = new Map(diagram.nodes.map((node) => [node.id, node]));

  function changeDiagram(value: string) {
    setDiagramId(value);
    setSelectedId(null);
  }

  function exportSvg() {
    if (!svgRef.current) return;
    const clone = svgRef.current.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    download(`${diagram.id}.svg`, new XMLSerializer().serializeToString(clone), "image/svg+xml;charset=utf-8");
  }

  function exportEvidence() {
    download(`${diagram.id}-evidence.json`, JSON.stringify({ exportedAt: new Date().toISOString(), ...diagram }, null, 2), "application/json;charset=utf-8");
  }

  return (
    <div>
      <PageHeader
        title="Architecture & Workflow Maps"
        subtitle="Interactive, source-backed diagrams — authored facts only, never live-topology claims"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportEvidence}><FileJson className="mr-1 h-4 w-4" /> Evidence JSON</Button>
            <Button onClick={exportSvg}><Download className="mr-1 h-4 w-4" /> Download SVG</Button>
          </div>
        }
      />

      <div className="mb-5 grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-[280px_1fr] md:items-center">
        <div>
          <label htmlFor="diagram" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Diagram</label>
          <Select value={diagramId} onValueChange={changeDiagram}>
            <SelectTrigger id="diagram"><SelectValue /></SelectTrigger>
            <SelectContent>{DIAGRAMS.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p>{diagram.description} Select a node to inspect evidence and trace its authored downstream relationships. Dashed lines denote external, asynchronous, revision, or unavailable boundaries—not verified runtime telemetry.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto bg-slate-50">
            <svg ref={svgRef} viewBox="0 0 1000 580" role="img" aria-labelledby="diagram-title diagram-description" className="min-h-[460px] min-w-[820px] w-full">
              <title id="diagram-title">{diagram.name}</title>
              <desc id="diagram-description">{diagram.description}</desc>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
                </marker>
              </defs>
              <rect x="12" y="12" width="976" height="556" rx="20" fill="#f8fafc" stroke="#cbd5e1" />
              <text x="35" y="48" fill="#0f172a" fontSize="20" fontWeight="700">{diagram.name}</text>
              <text x="35" y="70" fill="#64748b" fontSize="12">Source-backed application map · click a node to trace</text>

              {diagram.edges.map((edge, index) => {
                const from = nodeById.get(edge.from)!;
                const to = nodeById.get(edge.to)!;
                const x1 = from.x + 65;
                const y1 = from.y + 35;
                const x2 = to.x + 65;
                const y2 = to.y + 35;
                const active = selectedId ? traced.has(edge.from) && traced.has(edge.to) : false;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                return (
                  <g key={`${edge.from}-${edge.to}-${index}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={active ? "#ea580c" : "#64748b"} strokeWidth={active ? 2.5 : 1.5} strokeDasharray={edge.dashed ? "7 6" : undefined} markerEnd={`url(#${active ? "arrow-active" : "arrow"})`} />
                    <rect x={midX - 48} y={midY - 10} width="96" height="18" rx="8" fill="#ffffff" stroke="#e2e8f0" />
                    <text x={midX} y={midY + 3} fill={active ? "#c2410c" : "#475569"} fontSize="9" textAnchor="middle">{edge.label.slice(0, 20)}</text>
                  </g>
                );
              })}

              {diagram.nodes.map((node) => {
                const color = COLORS[node.kind];
                const active = selectedId === node.id;
                const inTrace = !selectedId || traced.has(node.id);
                const words = node.label.split(" ");
                const midpoint = Math.ceil(words.length / 2);
                const lines = words.length > 2 ? [words.slice(0, midpoint).join(" "), words.slice(midpoint).join(" ")] : [node.label];
                return (
                  <g key={node.id} role="button" tabIndex={0} aria-label={`Inspect ${node.label}`} onClick={() => setSelectedId(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(node.id); }} style={{ cursor: "pointer", opacity: inTrace ? 1 : 0.28 }}>
                    <rect x={node.x} y={node.y} width="130" height="70" rx="12" fill={active ? "#fff7ed" : color.fill} stroke={active ? "#ea580c" : color.stroke} strokeWidth={active ? 3 : 1.5} />
                    <circle cx={node.x + 16} cy={node.y + 17} r="5" fill={color.stroke} />
                    <text x={node.x + 65} y={node.y + (lines.length === 1 ? 41 : 34)} fill={color.text} fontSize="12" fontWeight="700" textAnchor="middle">
                      {lines.map((line, i) => <tspan key={line} x={node.x + 65} dy={i === 0 ? 0 : 16}>{line}</tspan>)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><GitBranch className="h-4 w-4" /> Node evidence</CardTitle></CardHeader>
          <CardContent>
            {selected ? (
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{selected.label}</h2>
                  <Badge variant="outline">{selected.kind}</Badge>
                  <Badge variant="secondary">{traced.size - 1} downstream</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selected.detail}</p>
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Repository evidence</p>
                  {selected.evidence.map((path) => <code key={path} className="block rounded-md bg-muted px-3 py-2 text-xs">{path}</code>)}
                </div>
                <Button className="mt-4" size="sm" variant="outline" onClick={() => setSelectedId(null)}><RotateCcw className="mr-1 h-3.5 w-3.5" /> Clear trace</Button>
              </div>
            ) : <p className="text-sm text-muted-foreground">Select any node in the map. Its description, repository evidence, and authored downstream path will appear here.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Legend & integrity</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(Object.keys(COLORS) as NodeKind[]).map((kind) => <div key={kind} className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ background: COLORS[kind].stroke }} /><span className="capitalize">{kind}</span></div>)}
            <div className="flex gap-2 border-t pt-3 text-xs text-muted-foreground"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /><span>Exports contain the authored diagram and evidence paths. They do not prove production deployment, uptime, or provider connectivity.</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
