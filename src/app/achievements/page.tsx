import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { VERIFIED_ACHIEVEMENTS } from "@/lib/career-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  FileCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Verified Achievements & Honors | Al-Amin",
  description:
    "Documented achievements, sales performance recognition, and systems milestones verified through evidence-based governance.",
};

export default function AchievementsPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <Award className="h-4 w-4" />
              <span>Evidence-Backed Recognition & Milestones</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Verified Achievements
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Every milestone and honor published here is verified against employment records, documented systems architecture, and authentic performance data.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VERIFIED_ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-xs">
                        {ach.category}
                      </Badge>
                      <span className="text-xs font-mono font-semibold text-ink-500 bg-sand-100 px-2.5 py-1 rounded-md border border-ink-200">
                        {ach.year}
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-950 mt-2">
                      {ach.title}
                    </h2>

                    <div className="text-sm font-semibold text-emerald-800 mt-1 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      {ach.organization}
                    </div>

                    <p className="text-sm sm:text-base text-ink-700 leading-relaxed mt-4">
                      {ach.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between text-xs font-mono text-ink-500">
                    <span>Evidence Note: {ach.evidenceNote}</span>
                    <span className="text-emerald-700 font-bold">STATUS: VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Verification Guarantee Banner */}
            <div className="mt-12 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 shrink-0">
                  <FileCheck2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-emerald-950">
                    Our Truth & Evidence Governance Standard
                  </h3>
                  <p className="text-sm text-emerald-900 mt-1 leading-relaxed">
                    Al-Amin's personal digital platform enforces strict content governance: we do not publish unverified statistics, inflated student counts, or fabricated client testimonials. All claims carry documented supporting evidence.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild size="sm" className="rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white">
                      <Link href="/career">
                        View Complete Career Timeline <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-lg border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50">
                      <Link href="/alo-education">
                        Explore ALO Education Gateway
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
