import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ALO_EDUCATION_INFO, ALO_SERVICES, STUDY_DESTINATIONS, ADMISSION_WORKFLOW_STAGES } from "@/lib/alo-education-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  ExternalLink,
  Globe2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  ShieldCheck,
  Compass,
  FileText,
  CalendarCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ALO Education Gateway | Al-Amin",
  description:
    "Explore ALO Education's premier higher study counseling, university admissions pathways, visa assistance, and global destination matrices led by Al-Amin.",
  openGraph: {
    title: "ALO Education Gateway | Al-Amin",
    description:
      "Global education advisory and ethical student counseling pathways with ALO Education.",
  },
};

export default function AloEducationPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-14 sm:py-20 border-b border-ink-200/60 bg-gradient-to-b from-blue-950 via-slate-900 to-ink-950 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/40 text-xs px-3 py-1 font-mono">
                Official Education Venture Gateway
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-xs px-3 py-1 font-mono">
                aloeducation.com
              </Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-4xl">
              Empowering Global Higher Education Pathways with ALO Education
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
              Led by Al-Amin, ALO Education provides transparent, ethical, and high-precision counseling for ambitious students targeting leading universities across the United Kingdom, USA, Canada, Australia, Ireland, and Europe.
            </p>

            {/* CTAs & Official Link */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg">
                <Link href="/book">
                  Book Free Study Abroad Consultation <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20">
                <a href={ALO_EDUCATION_INFO.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                  Visit aloeducation.com <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="rounded-xl text-slate-300 hover:text-white hover:bg-white/10">
                <Link href="/ai-assistant">
                  Chat with Student AI <Sparkles className="h-4 w-4 ml-1 text-orange-400" />
                </Link>
              </Button>
            </div>

            {/* Matrix Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/15">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-white">7+</div>
                <div className="text-xs text-slate-400 mt-0.5">Top Study Destinations</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-emerald-400">100%</div>
                <div className="text-xs text-slate-400 mt-0.5">Transparent Advisory</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-orange-400">7-Stage</div>
                <div className="text-xs text-slate-400 mt-0.5">Structured Admissions SOP</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-display text-blue-400">Dhaka & Global</div>
                <div className="text-xs text-slate-400 mt-0.5">Operating Footprint</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7-Stage Structured Workflow */}
        <section className="py-16 bg-white border-b border-ink-200/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                The ALO Advantage
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                7-Stage Student Success Lifecycle
              </h2>
              <p className="text-sm text-ink-600 mt-2">
                We remove confusion with a repeatable, high-touch framework that guides students from initial profile evaluation to university enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ADMISSION_WORKFLOW_STAGES.map((st) => (
                <div
                  key={st.step}
                  className="rounded-2xl border border-ink-200 bg-sand-50/50 p-6 hover:border-orange-300 hover:shadow-md transition-all relative flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="h-8 w-8 rounded-lg bg-orange-600 text-white font-mono font-bold text-sm flex items-center justify-center shadow-xs">
                        {st.step}
                      </span>
                      <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Stage {st.step}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-ink-950 mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-sm text-ink-700 leading-relaxed mb-4">
                      {st.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-ink-200/70 text-xs text-ink-600">
                    <span className="font-semibold text-ink-800">Key Deliverable:</span> {st.deliverables}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Showcase */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Advisory Services
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                  Comprehensive Student Advisory Matrices
                </h2>
              </div>
              <Button asChild variant="outline" className="self-start sm:self-auto rounded-xl">
                <Link href="/services">
                  View All Services Details <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ALO_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-sand-100 text-ink-800 border-ink-200 font-mono text-[11px]">
                      Student Advisory
                    </Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink-950">
                    {srv.title}
                  </h3>
                  <p className="text-sm text-ink-700 mt-2 leading-relaxed">
                    {srv.shortDesc}
                  </p>

                  <div className="mt-4 pt-4 border-t border-ink-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                      Included Deliverables
                    </h4>
                    <ul className="space-y-1.5">
                      {srv.deliverables.map((del, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm text-ink-800">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Study Destinations */}
        <section className="py-16 bg-white border-y border-ink-200/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Global Network
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                Explore Premier Study Destinations
              </h2>
              <p className="text-sm text-ink-600 mt-2">
                Detailed guides on intakes, post-study work rights, requirements, and top universities for Bangladeshi and international students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {STUDY_DESTINATIONS.map((dest) => (
                <div
                  key={dest.code}
                  className="rounded-2xl border border-ink-200 bg-sand-50/50 p-6 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-3xl">{dest.flag}</span>
                      <span className="text-xs font-mono font-bold text-ink-500 bg-white px-2 py-0.5 rounded border border-ink-200">
                        {dest.code}
                      </span>
                    </div>

                    <h3 className="font-display text-xl font-bold text-ink-950">
                      {dest.country}
                    </h3>
                    <p className="text-xs text-ink-600 mt-1">
                      {dest.heroTitle}
                    </p>

                    <div className="mt-4 space-y-2 text-xs text-ink-800">
                      <div>
                        <span className="font-semibold text-ink-900">Key Intakes:</span>{" "}
                        {dest.intakes.join(", ")}
                      </div>
                      <div>
                        <span className="font-semibold text-ink-900">Visa Stream:</span>{" "}
                        <span className="text-emerald-700 font-medium">{dest.visaType}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-ink-900">Tuition Range:</span>{" "}
                        {dest.tuitionRange}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-200/80">
                    <Button asChild size="sm" variant="outline" className="w-full rounded-xl bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300">
                      <Link href={`/destinations#${dest.slug}`}>
                        Explore {dest.country} Guide <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lead Intake Form CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="rounded-3xl bg-sand-900 text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                  Ready to Start?
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold mt-1">
                  Get a Free Profile Evaluation & University Recommendation
                </h2>
                <p className="text-sm text-sand-300 mt-3 leading-relaxed">
                  Submit your academic profile, preferred destination, and English proficiency score. Al-Amin and the ALO Education counseling team will formulate a personalized roadmap.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                    <Link href="/book">
                      Schedule 1-on-1 Consultation
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl border-white/20 bg-white/10 text-white hover:bg-white/20">
                    <Link href="/ai-assistant">
                      Assess Profile with AI
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
