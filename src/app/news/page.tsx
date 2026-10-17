import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Newspaper,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Tag,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "News, Insights & Policy Analysis | Al-Amin",
  description:
    "Authoritative articles, higher education policy analysis, admissions updates, and operations insights by Al-Amin.",
};

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const articles = await db.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <Newspaper className="h-4 w-4" />
              <span>Insights & Analysis</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              News, Articles & Executive Insights
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Perspectives on international student mobility, UK & global visa policies, admissions compliance, and education business architecture.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((art) => (
                <article
                  key={art.id}
                  className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-bold text-orange-600 uppercase bg-orange-50 px-2.5 py-0.5 rounded border border-orange-200/60">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-ink-500 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{art.readingMinutes} min read</span>
                      </div>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-bold text-ink-950 hover:text-orange-600 transition-colors">
                      <Link href={`/news/${art.slug}`}>{art.title}</Link>
                    </h2>

                    <p className="text-sm text-ink-700 mt-3 leading-relaxed">
                      {art.summary}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {(art.tags || "leadership, admissions")
                        .split(",")
                        .filter(Boolean)
                        .map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[11px] font-medium bg-sand-100 text-ink-700 px-2 py-0.5 rounded border border-ink-200/60"
                          >
                            #{tag.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {art.publishedAt?.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <Link
                      href={`/news/${art.slug}`}
                      className="font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      Read Analysis <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
