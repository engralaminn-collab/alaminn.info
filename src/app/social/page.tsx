import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Official Social Channels & Public Presence | Al-Amin",
  description:
    "Official verified social channels, profiles, and media accounts for Al-Amin and ALO Education.",
};

const OFFICIAL_CHANNELS = [
  {
    platform: "LinkedIn",
    handle: "Al-Amin (Executive & Operations)",
    url: "https://www.linkedin.com/in/al-aminn",
    badge: "Official Verified Profile",
    description: "Career milestones, higher education insights, operations frameworks, and thought leadership articles.",
    type: "Professional Network",
  },
  {
    platform: "Facebook",
    handle: "Al-Amin Official",
    url: "https://facebook.com/engr.alamin.info",
    badge: "Public Profile",
    description: "Student guidance updates, university admission announcements, and live Q&A sessions.",
    type: "Social Community",
  },
  {
    platform: "ALO Education Official",
    handle: "aloeducation.com",
    url: "https://aloeducation.com",
    badge: "Venture Gateway",
    description: "Official study-abroad advisory, destination guides, partner university list, and event registration.",
    type: "Education Organization",
  },
];

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <Share2 className="h-4 w-4" />
              <span>Official Channels</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Verified Social Presence
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Connect through official, verified communication channels. To protect against impersonation, all legitimate communications originate strictly from these sources.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {OFFICIAL_CHANNELS.map((ch, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-ink-200 bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge className="bg-sand-100 text-ink-800 border-ink-200 font-mono text-xs">
                        {ch.type}
                      </Badge>
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    </div>

                    <h2 className="font-display text-xl font-bold text-ink-950">
                      {ch.platform}
                    </h2>

                    <div className="text-xs font-semibold text-orange-600 mt-1">
                      {ch.handle}
                    </div>

                    <p className="text-sm text-ink-700 mt-3 leading-relaxed">
                      {ch.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-100">
                    <Button asChild size="sm" variant="outline" className="w-full rounded-xl bg-white hover:bg-sand-100">
                      <a href={ch.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5">
                        Visit {ch.platform} <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Anti-Impersonation Warning */}
            <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/70 p-6 sm:p-8">
              <h3 className="font-display text-base font-bold text-amber-950">
                Official Communication Policy
              </h3>
              <p className="text-xs sm:text-sm text-amber-900 mt-1 leading-relaxed">
                Al-Amin and ALO Education will never ask for payment through unauthorized personal bank accounts or unverified third-party channels. All consultations and official invoices are managed directly through <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">alaminn.info</code> and <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200">aloeducation.com</code>.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
