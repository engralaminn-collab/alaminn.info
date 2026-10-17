import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { STUDY_DESTINATIONS } from "@/lib/alo-education-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe2,
  GraduationCap,
  Clock,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  DollarSign,
  MapPin,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Global Study Destinations | ALO Education & Al-Amin",
  description:
    "Explore higher education opportunities, admission requirements, intakes, and post-study work rights across UK, USA, Canada, Australia, Ireland, New Zealand, and Europe.",
};

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <Globe2 className="h-4 w-4" />
              <span>International Higher Education Destinations</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Study Abroad Destinations
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Transparent, factual matrices on academic entry criteria, post-study graduate work visas, tuition estimates, and upcoming intakes for international students.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-12">
            {STUDY_DESTINATIONS.map((dest) => (
              <div
                key={dest.code}
                id={dest.slug}
                className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-10 shadow-sm hover:shadow-md transition-all scroll-mt-28"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-100">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl sm:text-5xl p-2 bg-sand-100 rounded-2xl border border-ink-200/70">
                      {dest.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                          {dest.country}
                        </h2>
                        <Badge className="bg-sand-100 text-ink-700 border-ink-200 font-mono text-xs">
                          {dest.code}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-orange-600 mt-1">
                        {dest.heroTitle}
                      </p>
                    </div>
                  </div>

                  <Button asChild className="self-start sm:self-auto rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium">
                    <Link href={`/book?destination=${encodeURIComponent(dest.country)}`}>
                      Book Counseling for {dest.country} <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Intakes & Work */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-ink-100 bg-sand-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">
                        <Clock className="h-3.5 w-3.5 text-orange-600" />
                        Upcoming Intakes
                      </div>
                      <div className="text-sm font-bold text-ink-900">
                        {dest.intakes.join(" • ")}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                        <Briefcase className="h-3.5 w-3.5 text-emerald-600" />
                        Visa Type & Stream
                      </div>
                      <div className="text-sm font-semibold text-emerald-950 leading-relaxed">
                        {dest.visaType}
                      </div>
                    </div>

                    <div className="rounded-xl border border-ink-100 bg-sand-50/70 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-500 mb-1">
                        <DollarSign className="h-3.5 w-3.5 text-orange-600" />
                        Estimated Tuition & Living Costs
                      </div>
                      <div className="text-xs sm:text-sm text-ink-800 space-y-1">
                        <p><span className="font-semibold">Tuition:</span> {dest.tuitionRange}</p>
                        <p><span className="font-semibold">Living Cost:</span> {dest.livingCost}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Key Highlights & Top Cities */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-2xs">
                      <div className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Key Strategic Highlights
                      </div>
                      <ul className="space-y-1.5">
                        {dest.highlights.map((h, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-2 text-xs sm:text-sm text-ink-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-ink-100 bg-white p-4 shadow-2xs">
                      <div className="text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Popular Student Cities
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.topCities.map((city, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-xs bg-sand-100 text-ink-800 px-2.5 py-1 rounded-md border border-ink-200"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
