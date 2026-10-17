"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarDays, CheckCircle2, Download, ExternalLink, RotateCcw, ShieldCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { HigherStudyBreadcrumb } from "@/components/higher-study/breadcrumb";

const COUNTRIES = {
  uk: { name: "United Kingdom", visa: "Student visa requirements and CAS", official: "https://www.gov.uk/student-visa" },
  usa: { name: "United States", visa: "Student visa requirements and Form I-20", official: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html" },
  canada: { name: "Canada", visa: "Study permit requirements", official: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html" },
  australia: { name: "Australia", visa: "Student visa requirements and CoE", official: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500" },
  germany: { name: "Germany", visa: "Study visa requirements", official: "https://www.make-it-in-germany.com/en/visa-residence/types/studying" },
} as const;

type CountryId = keyof typeof COUNTRIES;
type Task = { id: string; phase: string; title: string; evidence: string };
type SavedPlan = {
  completed: string[];
  budget: { tuition: string; living: string; months: string; setup: string; currency: string };
  notes: string;
};

const BASE_TASKS: Task[] = [
  { id: "goal", phase: "Decide", title: "Define programme, level, location, and career objective", evidence: "One written decision statement" },
  { id: "eligibility", phase: "Research", title: "Check entry and language requirements against official university pages", evidence: "Official programme links and captured access dates" },
  { id: "shortlist", phase: "Research", title: "Compare a realistic university and programme shortlist", evidence: "Comparison saved with rationale" },
  { id: "funding", phase: "Finance", title: "Build a funding plan without relying on unconfirmed awards", evidence: "Funding sources, gaps, and contingency" },
  { id: "scholarships", phase: "Finance", title: "Verify scholarship eligibility and deadlines at the awarding source", evidence: "Official source link for each scholarship" },
  { id: "documents", phase: "Prepare", title: "Prepare transcripts, references, CV, and statement evidence", evidence: "Document checklist with current versions" },
  { id: "apply", phase: "Apply", title: "Submit through the university or authorized route and retain receipts", evidence: "Submission reference and date" },
  { id: "offer", phase: "Decide", title: "Review offer conditions, total cost, and refund terms", evidence: "Offer and terms reviewed by a human" },
  { id: "visa", phase: "Visa", title: "Verify current immigration requirements at the official government source", evidence: "Official guidance link and access date" },
  { id: "travel", phase: "Prepare", title: "Plan accommodation, insurance, travel, and arrival tasks", evidence: "Confirmed bookings and contingency plan" },
];

function downloadPlan(fileName: string, plan: unknown) {
  const href = URL.createObjectURL(new Blob([JSON.stringify(plan, null, 2)], { type: "application/json;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
}

export function StudyPlanner() {
  const [country, setCountry] = useState<CountryId>("uk");
  const [intake, setIntake] = useState("");
  const [completed, setCompleted] = useState<string[]>([]);
  const [budget, setBudget] = useState<SavedPlan["budget"]>({ tuition: "", living: "", months: "12", setup: "", currency: "GBP" });
  const [notes, setNotes] = useState("");
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const storageKey = `alaminn-study-plan:${country}:${intake || "unscheduled"}`;
  const destination = COUNTRIES[country];

  const tasks = useMemo<Task[]>(() => [
    ...BASE_TASKS.slice(0, 8),
    { id: "country-visa", phase: "Visa", title: destination.visa, evidence: `Current requirements verified at ${new URL(destination.official).hostname}` },
    ...BASE_TASKS.slice(9),
  ], [destination]);

  useEffect(() => {
    let cancelled = false;
    // Read after the effect returns so the external-store synchronization does
    // not create a synchronous effect render cascade.
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<SavedPlan>;
          setCompleted(Array.isArray(saved.completed) ? saved.completed.filter((id) => tasks.some((task) => task.id === id)) : []);
          setBudget(saved.budget ? {
            tuition: saved.budget.tuition || "",
            living: saved.budget.living || "",
            months: saved.budget.months || "12",
            setup: saved.budget.setup || "",
            currency: saved.budget.currency || "GBP",
          } : { tuition: "", living: "", months: "12", setup: "", currency: "GBP" });
          setNotes(typeof saved.notes === "string" ? saved.notes : "");
        } else {
          setCompleted([]);
          setBudget({ tuition: "", living: "", months: "12", setup: "", currency: "GBP" });
          setNotes("");
        }
      } catch {
        setCompleted([]);
        setBudget({ tuition: "", living: "", months: "12", setup: "", currency: "GBP" });
        setNotes("");
      }
      setLoadedKey(storageKey);
    });
    return () => { cancelled = true; };
  }, [storageKey, tasks]);

  useEffect(() => {
    if (loadedKey !== storageKey) return;
    window.localStorage.setItem(storageKey, JSON.stringify({ completed, budget, notes } satisfies SavedPlan));
  }, [budget, completed, loadedKey, notes, storageKey]);

  const completedCount = tasks.filter((task) => completed.includes(task.id)).length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const tuition = Math.max(0, Number(budget.tuition) || 0);
  const living = Math.max(0, Number(budget.living) || 0);
  const months = Math.min(60, Math.max(0, Number(budget.months) || 0));
  const setup = Math.max(0, Number(budget.setup) || 0);
  const total = tuition + living * months + setup;

  function toggle(id: string) {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function reset() {
    if (!window.confirm("Reset this destination and intake plan?")) return;
    window.localStorage.removeItem(storageKey);
    setCompleted([]);
    setBudget({ tuition: "", living: "", months: "12", setup: "", currency: budget.currency });
    setNotes("");
  }

  function exportPlan() {
    downloadPlan(`study-plan-${country}-${intake || "unscheduled"}.json`, {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      destination: destination.name,
      intake: intake || null,
      progress: { completed: completedCount, total: tasks.length, percent: progress },
      checklist: tasks.map((task) => ({ ...task, completed: completed.includes(task.id) })),
      budget: { ...budget, scenarioTotal: total },
      notes,
      disclaimer: "Planning aid only. Verify admissions, scholarships, immigration, costs, and deadlines with current official sources.",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 via-white to-white pb-20">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <HigherStudyBreadcrumb items={[{ label: "Private Planner" }]} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Private by default</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">Saved in this browser</span></div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink-950 sm:text-5xl">Build an evidence-led study roadmap</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-ink-600">Plan the decision, application, finance, visa, and arrival journey without creating an account. This tool does not predict admissions or visa outcomes.</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><div className="flex gap-3"><ShieldCheck className="h-5 w-5 shrink-0" /><p>No name, email, passport data, academic record, or payment data is requested. Browser storage remains on this device unless you export the JSON file.</p></div></div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-blue-700" /> Destination and intake</CardTitle></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="country">Destination</Label><Select value={country} onValueChange={(value) => setCountry(value as CountryId)}><SelectTrigger id="country"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(COUNTRIES).map(([id, item]) => <SelectItem key={id} value={id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label htmlFor="intake">Target intake month</Label><Input id="intake" type="month" value={intake} onChange={(event) => setIntake(event.target.value)} /></div>
                <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/50 p-4"><div><p className="text-sm font-semibold">{completedCount} of {tasks.length} evidence checkpoints complete</p><p className="text-xs text-muted-foreground">Progress is a planning signal—not an eligibility decision.</p></div><span className="text-2xl font-bold text-blue-800">{progress}%</span><Progress value={progress} className="basis-full" /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Application journey</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {tasks.map((task) => {
                  const checked = completed.includes(task.id);
                  return <label key={task.id} className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${checked ? "border-emerald-200 bg-emerald-50/70" : "hover:border-blue-300 hover:bg-blue-50/40"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(task.id)} className="mt-1 h-4 w-4 accent-emerald-600" />
                    <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold uppercase tracking-wide text-blue-700">{task.phase}</span>{checked && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}</span><span className={`mt-1 block font-semibold ${checked ? "text-emerald-950" : "text-ink-900"}`}>{task.title}</span><span className="mt-1 block text-xs text-muted-foreground">Evidence: {task.evidence}</span></span>
                  </label>;
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><WalletCards className="h-4 w-4" /> Budget scenario</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2"><Label htmlFor="currency">Currency</Label><Select value={budget.currency} onValueChange={(currency) => setBudget((current) => ({ ...current, currency }))}><SelectTrigger id="currency"><SelectValue /></SelectTrigger><SelectContent>{["BDT", "GBP", "USD", "CAD", "AUD", "EUR"].map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
                <BudgetInput id="tuition" label="Total tuition scenario" value={budget.tuition} onChange={(tuition) => setBudget((current) => ({ ...current, tuition }))} />
                <BudgetInput id="living" label="Living cost per month" value={budget.living} onChange={(living) => setBudget((current) => ({ ...current, living }))} />
                <BudgetInput id="months" label="Number of months" value={budget.months} onChange={(monthsValue) => setBudget((current) => ({ ...current, months: monthsValue }))} />
                <BudgetInput id="setup" label="Travel, visa, deposit, setup scenario" value={budget.setup} onChange={(setupValue) => setBudget((current) => ({ ...current, setup: setupValue }))} />
                <div className="rounded-xl bg-blue-950 p-4 text-white"><p className="text-xs uppercase tracking-wide text-blue-200">Scenario total</p><p className="mt-1 text-2xl font-bold">{budget.currency} {total.toLocaleString()}</p><p className="mt-1 text-xs text-blue-200">Your inputs only; not a quoted or verified cost.</p></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Official immigration source</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">Requirements can change. Check the government source directly and record the access date in your notes.</p><Button asChild variant="outline" className="mt-4 w-full"><a href={destination.official} target="_blank" rel="noopener noreferrer">Open official source <ExternalLink className="ml-1 h-4 w-4" /></a></Button></CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Private notes</CardTitle></CardHeader>
              <CardContent><Label htmlFor="notes" className="sr-only">Private planning notes</Label><textarea id="notes" rows={7} value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} placeholder="Record links, questions, and decisions. Do not store passport, bank, or other sensitive identity data here." className="w-full rounded-lg border bg-background p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-500" /></CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button onClick={exportPlan}><Download className="mr-1 h-4 w-4" /> Export plan JSON</Button>
              <Button variant="outline" onClick={reset}><RotateCcw className="mr-1 h-4 w-4" /> Reset this plan</Button>
              <Button asChild variant="outline"><Link href="/higher-study/apply">Request ALO Education support</Link></Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p>Planning aid only. University entry rules, fees, scholarships, deadlines, immigration rules, and provider terms must be verified with current official sources. Alaminn.info and ALO Education do not guarantee admission, funding, or visa outcomes.</p></div>
      </div>
    </div>
  );
}

function BudgetInput({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type="number" min="0" step="1" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}
