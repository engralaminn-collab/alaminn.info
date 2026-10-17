import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ShieldCheck,
  User,
  Share2,
  ArrowRight,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
  });

  if (!article) {
    return { title: "Article Not Found | Al-Amin" };
  }

  return {
    title: `${article.title} | Al-Amin Insights`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <article className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-6">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-600 hover:text-ink-950 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to News & Insights
            </Link>
          </div>

          <header className="pb-8 border-b border-ink-200/80">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 font-mono text-xs">
                {article.category}
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-mono text-xs inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> VERIFIED ANALYSIS
              </Badge>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-ink-950 leading-tight">
              {article.title}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 leading-relaxed font-sans">
              {article.summary}
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-ink-100 text-xs text-ink-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 font-semibold text-ink-800">
                  <User className="h-4 w-4 text-orange-600" />
                  {article.author}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {article.publishedAt?.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {article.readingMinutes} min read
                </div>
              </div>
            </div>
          </header>

          {/* Article Body */}
          <div className="prose prose-slate max-w-none py-10 text-ink-800 text-base leading-relaxed space-y-6">
            {article.body.split("\n\n").map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tags & Footer */}
          <footer className="pt-8 border-t border-ink-200">
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-xs font-semibold text-ink-500">Related Tags:</span>
              {(article.tags || "leadership, admissions")
                .split(",")
                .filter(Boolean)
                .map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs bg-sand-100 text-ink-700 px-2.5 py-1 rounded-md border border-ink-200"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>

            <div className="rounded-2xl border border-ink-200 bg-sand-100/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-display text-base font-bold text-ink-950">
                  Ready to Discuss Your Higher Study Goals?
                </h4>
                <p className="text-xs sm:text-sm text-ink-600 mt-0.5">
                  Connect directly with Al-Amin or consult with ALO Education's senior team.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white shrink-0">
                <Link href="/book">
                  Book Consultation <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}
