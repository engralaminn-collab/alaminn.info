import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { ALO_SERVICES } from "@/lib/alo-education-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Building,
  Target,
  FileCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Advisory & Consulting Services | Al-Amin & ALO Education",
  description:
    "Explore higher education counseling services, university admissions support, and executive operations consulting led by Al-Amin.",
};

const EXECUTIVE_SERVICES = [
  {
    id: "exec-operations",
    title: "Education Business Operations Architecture",
    description:
      "Design and deploy end-to-end operational operating systems, KPI governance, lead qualification pipelines, and branch management frameworks for international education firms.",
    category: "EXECUTIVE_CONSULTING",
    deliverables: [
      "Process mapping across lead-to-enrollment lifecycle",
      "Counselor performance metrics & SLA dashboards",
      "Branch & regional operating procedures",
      "Cross-functional communication protocols",
    ],
  },
  {
    id: "exec-crm-automation",
    title: "CRM Implementation & Communication Workflows",
    description:
      "Architect multichannel student management systems integrating WhatsApp Business, email sequences, Google Workspace, and admissions pipeline tracking with audit integrity.",
    category: "EXECUTIVE_CONSULTING",
    deliverables: [
      "Custom student pipeline stage configuration",
      "Automated follow-up reminders & task management",
      "WhatsApp & email templating with human approval gates",
      "Executive reporting & analytics dashboards",
    ],
  },
  {
    id: "exec-partnership",
    title: "Institutional Partnerships & University Liaison Strategy",
    description:
      "Strategic advisory on expanding university relationships, organizing successful higher education expos, managing agent networks, and maintaining high compliance standards.",
    category: "EXECUTIVE_CONSULTING",
    deliverables: [
      "University partner engagement roadmaps",
      "Education expo & spot-assessment operational planning",
      "Compliance audit frameworks & visa risk mitigation",
      "Sub-agent governance & training modules",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <Layers className="h-4 w-4" />
              <span>Higher Study Advisory & Operations Consulting</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Services & Capabilities
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Transparent, evidence-based student advisory through ALO Education alongside strategic operations and systems architecture consulting for organizations.
            </p>
          </div>
        </section>

        {/* ALO Education Student Services */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  ALO Education Services
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                  Higher Education & Student Admissions
                </h2>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-mono text-xs">
                STUDENT ADVISORY
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ALO_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-orange-600 uppercase">
                        ADMISSIONS ADVISORY
                      </span>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-ink-950">
                      {srv.title}
                    </h3>
                    <p className="text-sm text-ink-700 mt-2 leading-relaxed">
                      {srv.shortDesc}
                    </p>

                    <div className="mt-4 pt-4 border-t border-ink-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Deliverables & Scope:
                      </h4>
                      <ul className="space-y-1.5">
                        {srv.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-ink-800">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-100">
                    <Button asChild size="sm" className="w-full rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium">
                      <Link href="/book">
                        Book Consultation for This Service
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Executive Consulting Services */}
        <section className="py-16 bg-white border-y border-ink-200/60">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Operations & Scaling
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950 mt-1">
                  Executive Operations Consulting
                </h2>
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-xs">
                BUSINESS & SYSTEMS
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {EXECUTIVE_SERVICES.map((srv) => (
                <div
                  key={srv.id}
                  className="rounded-2xl border border-ink-200 bg-sand-50/50 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink-950">
                      {srv.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-700 mt-2 leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-ink-200/70">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Engagement Focus:
                      </h4>
                      <ul className="space-y-1.5">
                        {srv.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-ink-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-200/70">
                    <Button asChild size="sm" variant="outline" className="w-full rounded-xl bg-white hover:bg-sand-100">
                      <Link href="/book">
                        Inquire for Enterprise Consulting
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
              Need a Tailored Advisory Session?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-ink-700 max-w-xl mx-auto">
              Whether you are an ambitious student aiming for September 2026 intake or an education leader looking to streamline operations, we are here to assist.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                <Link href="/book">
                  Schedule Direct Session <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link href="/destinations">
                  Explore Study Destinations
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
