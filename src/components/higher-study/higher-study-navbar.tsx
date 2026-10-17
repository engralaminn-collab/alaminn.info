"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  BookOpen,
  Award,
  FlaskConical,
  UserSearch,
  Globe2,
  Library,
  Columns3,
  Menu,
  X,
  Send,
  ArrowLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * HigherStudyNavbar — the ONLY navigation on Higher Study pages.
 *
 * Clean, minimal design with grouped dropdowns to avoid clutter:
 *   [Al Aminn → /] | Universities | Courses | Scholarships | More ▾ | [Apply Now]
 *
 * When a visitor enters the Higher Study sub-platform, the main Alaminn.info
 * navigation (About, Expertise, Impact, Projects, Insights, Work With Me)
 * DISAPPEARS. Only the Al Aminn logo (clickable → "/") and the Higher Study
 * navigation remain.
 */
interface HsNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// Primary nav — always visible (most important items)
const PRIMARY_NAV: HsNavItem[] = [
  { label: "Universities", href: "/higher-study/global-universities", icon: Building2 },
  { label: "Courses", href: "/higher-study/course-finder", icon: BookOpen },
  { label: "Scholarships", href: "/higher-study/scholarships", icon: Award },
  { label: "Destinations", href: "/higher-study/destinations", icon: Globe2 },
];

// Secondary nav — in "More" dropdown
const SECONDARY_NAV: HsNavItem[] = [
  { label: "PhD & Research", href: "/higher-study/phd-research", icon: FlaskConical },
  { label: "Supervisors", href: "/higher-study/supervisors", icon: UserSearch },
  { label: "Resources", href: "/higher-study/study-resources", icon: Library },
  { label: "Compare", href: "/higher-study/compare", icon: Columns3 },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/higher-study") return pathname === "/higher-study";
  return pathname === href || pathname.startsWith(href + "/");
}

export function HigherStudyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close mobile menu when user clicks a nav link (no effect needed)
  const closeMobileMenu = () => {
    setMobileOpen(false);
    setMoreOpen(false);
  };

  const moreActive = SECONDARY_NAV.some((item) => isActive(pathname, item.href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-3"
      )}
    >
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between gap-4 rounded-2xl border px-4 py-2.5 transition-all duration-300",
            scrolled
              ? "glass border-blue-900/10 shadow-soft"
              : "border-transparent bg-transparent"
          )}
        >
          {/* Logo — returns to main Alaminn.info homepage */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl grad-intelligence shadow-blue">
              <ArrowLeft className="h-4 w-4 text-white transition-transform group-hover:-translate-x-0.5" />
            </span>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Higher Study
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Alaminn.info
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}

            {/* More dropdown — secondary nav items */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  moreOpen || moreActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", moreOpen && "rotate-180")} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg"
                  >
                    {SECONDARY_NAV.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(pathname, item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            active
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* CTA + mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/higher-study/apply"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-orange transition-all hover:bg-orange-700 hover:shadow-lg"
            >
              <Send className="h-3.5 w-3.5" />
              Apply Now
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden mt-2 rounded-2xl border border-border bg-popover p-2"
            >
              {[...PRIMARY_NAV, ...SECONDARY_NAV].map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/higher-study/apply"
                className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <Send className="h-4 w-4" />
                Apply Now
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
