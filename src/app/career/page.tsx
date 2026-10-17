import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { VERIFIED_CAREER_DATA, VERIFIED_ACHIEVEMENTS } from "@/lib/career-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Career & Verified Experience | Al-Amin",
  description:
    "Explore the verified professional career timeline, leadership history, and operational milestones of Al-Amin in international education and business systems.",
  openGraph: {
    title: "Career & Verified Experience | Al-Amin",
    description:
      "Explore the verified professional career timeline, leadership history, and operational milestones of Al-Amin.",
  },
};

export default function CareerPage() {
  const verifiedList = VERIFIED_CAREER_DATA.filter(
    (item) => item.verificationStatus === "VERIFIED" && item.visibility === "PUBLIC"
  );

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Header */}
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <ShieldCheck className="h-4 w-4" />
              <span>Evidence-Backed & Verified Professional History</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Career & Professional Experience
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Al-Amin's professional progression across international education counseling, branch sales operations, university liaison, and digital systems architecture. Every entry is governed by strict truth and verification standards.
            </p>

            {/* Verification Stats */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-6 border-t border-ink-200/70">
              <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-xs">
                <div className="text-2xl font-black text-ink-950 font-display">5+ Years</div>
                <div className="text-xs font-medium text-ink-600 mt-0.5">International Education</div>
              </div>
              <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-xs">
                <div className="text-2xl font-black text-emerald-700 font-display">100%</div>
                <div className="text-xs font-medium text-ink-600 mt-0.5">Verified Timeline</div>
              </div>
              <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-xs">
                <div className="text-2xl font-black text-orange-600 font-display">TCL Global</div>
                <div className="text-xs font-medium text-ink-600 mt-0.5">Leadership Tenure</div>
              </div>
              <div className="rounded-xl border border-ink-200/80 bg-white p-4 shadow-xs">
                <div className="text-2xl font-black text-blue-700 font-display">ALO Edu</div>
                <div className="text-xs font-medium text-ink-600 mt-0.5">Ecosystem Partner</div>
              </div>
            </div>
          </div>
        </section>

        {/* Career Timeline */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink-950">
                  Interactive Career Timeline
                </h2>
                <p className="text-sm text-ink-600 mt-1">
                  Chronological record with documented responsibilities, skills, and recognized achievements.
                </p>
              </div>
              <Badge className="self-start sm:self-auto bg-emerald-100 text-emerald-800 border-emerald-200 px-3 py-1 font-mono text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1 inline" /> VERIFIED STATUS ONLY
              </Badge>
            </div>

            <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-500/40 space-y-12">
              {verifiedList.map((item, idx) => (
                <div key={item.id} className="relative group">
                  {/* Timeline node icon */}
                  <div className="absolute -left-[33px] sm:-left-[41px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white border-2 border-orange-500 shadow-xs group-hover:scale-110 transition-transform">
                    {item.isCurrent ? (
                      <Sparkles className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-orange-600" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="rounded-2xl border border-ink-200/80 bg-white p-6 sm:p-8 shadow-sm hover:shadow-md hover:border-ink-300 transition-all">
                    {/* Header line */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
                            {item.startDate} — {item.endDate}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck className="h-3 w-3" /> VERIFIED
                          </span>
                          {item.isCurrent && (
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              Active Role
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2.5 font-display text-xl sm:text-2xl font-bold tracking-tight text-ink-950">
                          {item.jobTitle}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-ink-600">
                          <span className="flex items-center gap-1.5 font-semibold text-ink-800">
                            <Building2 className="h-4 w-4 text-ink-500" />
                            {item.organization}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-ink-500" />
                            {item.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-ink-700 text-sm sm:text-base leading-relaxed mb-6">
                      {item.description}
                    </p>

                    {/* Recognition callout if available */}
                    {item.recognition && item.recognition.length > 0 && (
                      <div className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
                        <div className="flex items-center gap-2 font-display text-sm font-bold text-amber-900 mb-2">
                          <Award className="h-4 w-4 text-amber-600" />
                          <span>Reported Recognition & Performance Honors</span>
                        </div>
                        <ul className="space-y-1.5">
                          {item.recognition.map((rec, rIdx) => (
                            <li key={rIdx} className="text-xs text-amber-950">
                              <span className="font-bold">{rec.title}:</span> {rec.note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Responsibilities */}
                    <div className="mb-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-3">
                        Key Responsibilities & Scope
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {item.responsibilities.map((resp, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 text-sm text-ink-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Achievements */}
                    {item.achievements && item.achievements.length > 0 && (
                      <div className="mb-6 pt-4 border-t border-ink-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2.5">
                          Key Outcomes
                        </h4>
                        <ul className="space-y-1.5">
                          {item.achievements.map((ach, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2 text-sm text-ink-800">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Skills & Source Footer */}
                    <div className="pt-4 border-t border-ink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs font-medium bg-sand-100 text-ink-800 px-2.5 py-1 rounded-md border border-ink-200/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-mono text-ink-500">
                          Source: {item.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verified Achievements Section */}
        <section className="py-12 bg-white border-y border-ink-200/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Verified Record
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                Honors & Verified Milestones
              </h2>
              <p className="text-sm text-ink-600 mt-2">
                All claims are tied to verified institutional records, appointments, and documented systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VERIFIED_ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className="rounded-xl border border-ink-200 bg-sand-50/60 p-6 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                      {ach.category}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ink-500 bg-white px-2 py-0.5 rounded border border-ink-200">
                      {ach.year}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-950">
                    {ach.title}
                  </h3>
                  <div className="text-xs font-semibold text-ink-600 mb-2">
                    {ach.organization}
                  </div>
                  <p className="text-sm text-ink-700 leading-relaxed mb-4">
                    {ach.description}
                  </p>
                  <div className="pt-3 border-t border-ink-200/60 flex items-center justify-between text-[11px] text-ink-500 font-mono">
                    <span>Evidence: {ach.evidenceNote}</span>
                    <span className="text-emerald-700 font-bold">VERIFIED</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-br from-ink-950 via-slate-900 to-blue-950 p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-orange-300 backdrop-blur-md">
                  <GraduationCap className="h-3.5 w-3.5" /> Direct Advisory & Consultation
                </span>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                  Discuss Higher Study Strategy or Education Business Growth
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Book a direct 1-on-1 consultation session with Al-Amin to evaluate study-abroad applications, university partnerships, or operations workflows.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild size="lg" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg">
                    <Link href="/book">
                      Book a Consultation <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20">
                    <Link href="/ai-assistant">
                      Chat with AI Assistant <Sparkles className="h-4 w-4 ml-1.5 text-orange-400" />
                    </Link>
                  </Button>
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
