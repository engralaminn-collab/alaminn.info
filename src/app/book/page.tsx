"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  CheckCircle2,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Globe2,
  ArrowRight,
  Sparkles,
  Loader2,
  ExternalLink,
} from "lucide-react";

const MEETING_TYPES = [
  {
    id: "Higher Study Counseling (ALO Education)",
    title: "Higher Study Counseling (ALO Education)",
    duration: "30 Min",
    description: "Personalized academic evaluation, university shortlisting, and UK/USA/Canada/Australia admission roadmap.",
  },
  {
    id: "Executive Operations & Business Advisory",
    title: "Executive Operations Advisory",
    duration: "45 Min",
    description: "For education entrepreneurs and business leaders exploring CRM architecture, operating frameworks, or scaling.",
  },
  {
    id: "Institutional Partnership & University Liaison",
    title: "Institutional Partnership & Liaison",
    duration: "30 Min",
    description: "Discuss university representation, agent network collaboration, or higher education event hosting.",
  },
  {
    id: "General Inquiries & Speaking",
    title: "General Inquiries & Media",
    duration: "20 Min",
    description: "Keynotes, panel discussions, media commentary, or general inquiries.",
  },
];

const TIME_SLOTS = [
  "10:00 AM",
  "11:30 AM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "07:00 PM",
];

export default function BookPage() {
  const [selectedType, setSelectedType] = useState(MEETING_TYPES[0].id);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  });
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[2]);
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const res = await fetch("/api/public/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          whatsapp,
          meetingType: selectedType,
          requestedDate: selectedDate,
          requestedTime: selectedTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Dhaka",
          topic: topic || `Consultation on ${selectedType} for ${country}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setBookingResult(json.data);
      } else {
        alert(json.message || "Unable to complete booking. Please try again.");
      }
    } catch (err) {
      alert("Error submitting booking. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-20">
        <section className="relative overflow-hidden py-12 sm:py-16 border-b border-ink-200/60 bg-gradient-to-b from-white via-sand-50/50 to-sand-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
              <CalendarIcon className="h-4 w-4" />
              <span>Direct 1-on-1 Consultation</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-ink-950">
              Schedule a Consultation Session
            </h1>

            <p className="mt-4 text-base sm:text-lg text-ink-700 max-w-3xl leading-relaxed">
              Book a direct strategy meeting with Al-Amin to discuss higher study admissions, ALO Education pathways, or business operations.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            {bookingResult ? (
              <div className="rounded-3xl border border-emerald-300 bg-white p-8 sm:p-12 shadow-lg max-w-2xl mx-auto text-center">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>

                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono text-xs mb-3">
                  BOOKING CONFIRMED
                </Badge>

                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-ink-950">
                  Consultation Request Confirmed!
                </h2>

                <p className="text-sm text-ink-700 mt-3 leading-relaxed">
                  Thank you, <strong className="text-ink-950">{fullName}</strong>. Your session request has been registered in Al-Amin's calendar and ALO Education's priority queue.
                </p>

                <div className="mt-6 rounded-2xl border border-ink-200 bg-sand-50 p-6 text-left space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-ink-200/60">
                    <span className="text-ink-600">Booking Reference:</span>
                    <span className="font-mono font-bold text-orange-600">{bookingResult.reference}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-200/60">
                    <span className="text-ink-600">Meeting Session:</span>
                    <span className="font-semibold text-ink-900">{bookingResult.meetingType}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-ink-200/60">
                    <span className="text-ink-600">Date & Time:</span>
                    <span className="font-semibold text-ink-900">{selectedDate} at {selectedTime}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-ink-600">Calendar Invitation:</span>
                    <span className="text-emerald-700 font-semibold">Sent to {email}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Button asChild className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium">
                    <Link href="/">
                      Return to Home
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl">
                    <a
                      href="https://wa.me/8801716609554"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      Instant WhatsApp Inquiry <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-12">
                {/* Step 1: Select Meeting Type */}
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-950 mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-orange-600 text-white text-xs font-mono flex items-center justify-center">1</span>
                    Select Meeting Type
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MEETING_TYPES.map((type) => (
                      <label
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                          selectedType === type.id
                            ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20 shadow-xs"
                            : "border-ink-200 bg-white hover:border-ink-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="font-display text-base font-bold text-ink-950">
                              {type.title}
                            </h3>
                            <span className="text-xs font-mono font-semibold text-orange-600 bg-white px-2 py-0.5 rounded border border-ink-200">
                              {type.duration}
                            </span>
                          </div>
                          <p className="text-xs text-ink-600 leading-relaxed">
                            {type.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 2: Date & Time */}
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-950 mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-orange-600 text-white text-xs font-mono flex items-center justify-center">2</span>
                    Select Date & Time Slot
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-ink-200">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Preferred Date
                      </label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="rounded-xl border-ink-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-ink-500 mb-2">
                        Available Time Slot (GMT+6)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {TIME_SLOTS.map((time) => (
                          <button
                            type="button"
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                              selectedTime === time
                                ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                                : "bg-sand-50 text-ink-800 border-ink-200 hover:bg-sand-100"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Attendee Details */}
                <div>
                  <h2 className="font-display text-xl font-bold text-ink-950 mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-orange-600 text-white text-xs font-mono flex items-center justify-center">3</span>
                    Attendee Details & Context
                  </h2>

                  <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Your full name"
                          className="rounded-xl border-ink-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@domain.com"
                          className="rounded-xl border-ink-300"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">
                          WhatsApp / Phone Number
                        </label>
                        <Input
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+880 1700-000000"
                          className="rounded-xl border-ink-300"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-ink-700 mb-1">
                          Target Country / Focus
                        </label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="e.g. United Kingdom, Canada, Australia"
                          className="rounded-xl border-ink-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Specific Questions or Context for the Session
                      </label>
                      <Textarea
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Share your current academic CGPA, IELTS score, desired program, or business objective..."
                        className="rounded-xl border-ink-300 min-h-[100px]"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <span className="text-xs text-ink-500">
                        * Direct confirmation & Google Meet link sent upon submission.
                      </span>

                      <Button
                        type="submit"
                        disabled={loading || !fullName || !email}
                        size="lg"
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-md px-8"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...
                          </>
                        ) : (
                          <>Confirm Consultation Booking</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
