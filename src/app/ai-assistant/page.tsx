"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Bot,
  User,
  Send,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Globe2,
  BookOpen,
  ArrowRight,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  profileState?: Record<string, any>;
  quickPrompts?: string[];
  suggestedAction?: string;
}

const INITIAL_PROMPTS = [
  "Assess my profile for UK Master's (Sept 2026)",
  "What are the IELTS requirements for Australia?",
  "আমি কানাডায় ব্যাচেলর করতে চাই, খরচ এবং স্কলারশিপ কেমন?",
  "Book a 1-on-1 consultation with Al-Amin",
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Hello! I am Al-Amin's AI Education & Admissions Assistant, backed by ALO Education's verified knowledge base.\n\nI can help evaluate your academic eligibility for top universities in the UK, USA, Canada, Australia, Ireland, and Europe, or help you book a direct 1-on-1 strategy session with Al-Amin.\n\nHow can I assist your study abroad plans today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickPrompts: INITIAL_PROMPTS,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sess-${Math.random().toString(36).slice(2, 10)}`);
  const [studentProfile, setStudentProfile] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/public/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId,
          studentContext: studentProfile,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const assistantMsg: Message = {
          id: `ast-${Date.now()}`,
          sender: "assistant",
          text: json.data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          profileState: json.data.profileState,
          suggestedAction: json.data.suggestedAction,
          quickPrompts: json.data.suggestedPrompts || [
            "What documents do I need to prepare?",
            "What are the scholarship chances?",
            "Schedule a 1-on-1 consultation",
          ],
        };

        if (json.data.profileState) {
          setStudentProfile(json.data.profileState);
        }

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: "assistant",
            text: "I experienced a brief connection hiccup. Please feel free to ask again or reach out directly to Al-Amin via the booking page.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "assistant",
          text: "Unable to connect right now. Please try again or book directly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 text-ink-900 flex flex-col selection:bg-orange-500 selection:text-white">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 flex flex-col">
        <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 flex-1 flex flex-col">
          {/* Header Info */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ink-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-950">
                  Al-Amin AI Admissions & Counseling Assistant
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-ink-600 mt-1">
                Transparent AI assistant powered by ALO Education verified knowledge base. Speaks English & Bangla.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-mono">
                <ShieldCheck className="h-3 w-3 mr-1 inline" /> VERIFIED AI ASSISTANT
              </Badge>
              <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
                <Link href="/book">
                  Book 1-on-1 with Al-Amin <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Main Chat Container */}
          <div className="flex-1 rounded-3xl border border-ink-200 bg-white shadow-sm flex flex-col overflow-hidden min-h-[520px]">
            {/* Disclaimer Bar */}
            <div className="bg-sand-100/80 px-4 py-2.5 border-b border-ink-200/60 text-xs text-ink-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Bot className="h-3.5 w-3.5 text-orange-600" />
                Official AI Assistant (identifies as AI; does not secretly impersonate Al-Amin)
              </span>
              <span className="font-mono text-[11px] text-ink-500">v2.4 Live</span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === "user"
                        ? "bg-ink-900 text-white"
                        : "bg-orange-600 text-white shadow-xs"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-ink-950 text-white rounded-tr-none"
                          : "bg-sand-100 text-ink-900 rounded-tl-none border border-ink-200/60"
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-400 font-mono px-1">
                      <span>{msg.sender === "user" ? "You" : "Al-Amin AI Assistant"}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Quick suggestion prompt chips if assistant message */}
                    {msg.sender === "assistant" && msg.quickPrompts && msg.quickPrompts.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {msg.quickPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSend(prompt)}
                            disabled={loading}
                            className="text-xs bg-white text-ink-800 hover:text-orange-600 hover:border-orange-300 border border-ink-200 rounded-lg px-2.5 py-1.5 transition-all text-left shadow-2xs flex items-center gap-1.5"
                          >
                            <Sparkles className="h-3 w-3 text-orange-500 shrink-0" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 max-w-xl mr-auto">
                  <div className="h-8 w-8 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-sand-100 text-ink-700 text-sm border border-ink-200/60 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                    <span>Analyzing your profile and matching university requirements...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-sand-50/70 border-t border-ink-200/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask in English or বাংলা (e.g. 'I completed BBA with CGPA 3.4. Can I apply for UK Master's?')..."
                  className="rounded-xl border-ink-300 bg-white text-sm focus-visible:ring-orange-500 py-5"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white px-5 py-5"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
