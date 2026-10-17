import { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Terms of Service & Advisory Governance | Al-Amin",
  description: "Terms of service, consultation guidelines, and advisory disclaimers.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-950 mb-2">
            Terms of Service & Advisory Governance
          </h1>
          <p className="text-xs font-mono text-ink-500 mb-8">
            Last Updated: October 2026 • Effective Date: October 17, 2026
          </p>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-ink-800">
            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">1. Nature of Advisory Services</h2>
              <p>
                Al-Amin and ALO Education provide education consultancy, university admission assistance, and business operations advisory. While we strive for the highest application success rates, final admission decisions and visa grants are solely determined by respective universities and government immigration authorities (e.g. UK Visas and Immigration, IRCC, Home Affairs).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">2. No Guarantee Disclaimer</h2>
              <p>
                No counselor, AI assistant, or representative of ALO Education makes guaranteed visa issuance promises. All guidance is based on official immigration rules and institutional entry criteria.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">3. Verification of Information</h2>
              <p>
                Students and clients must provide authentic and uncompromised academic records. ALO Education reserves the right to terminate counseling services if fraudulent documents are submitted.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
