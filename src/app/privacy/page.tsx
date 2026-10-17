import { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Al-Amin & ALO Education",
  description: "Privacy policy, data collection standards, and compliance information for alaminn.info.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-950 mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs font-mono text-ink-500 mb-8">
            Last Updated: October 2026 • Effective Date: October 17, 2026
          </p>

          <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed space-y-6 text-ink-800">
            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">1. Data We Collect</h2>
              <p>
                When you interact with <code>alaminn.info</code>, ALO Education advisory services, or the Al-Amin AI Assistant, we may collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Contact details (name, email address, WhatsApp/phone number, country).</li>
                <li>Academic profile information (highest degree, CGPA, English proficiency scores like IELTS/PTE/TOEFL, study destination preferences).</li>
                <li>Consultation booking requests and meeting notes.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">2. How We Use Your Information</h2>
              <p>
                Your information is used strictly to provide accurate higher education counseling, schedule meetings, evaluate university eligibility, and communicate admissions updates. We do not sell or monetize personal information to unvetted third parties.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">3. AI Assistant & Student Profiling</h2>
              <p>
                The Al-Amin AI Assistant analyzes conversation context to provide relevant admission benchmarks and auto-draft counseling itineraries. All recommendations are reviewed by human counselors before binding applications are submitted.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-ink-950">4. Contact & Inquiries</h2>
              <p>
                For data privacy requests or inquiries, contact us directly at <a href="mailto:alaminn.official@gmail.com" className="text-orange-600 font-medium">alaminn.official@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
