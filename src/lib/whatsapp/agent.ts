/**
 * WhatsApp AI — Agent (orchestrator)
 * ==================================
 * The core AI agent. Receives a user message, classifies intent,
 * retrieves authoritative knowledge, generates a safe response,
 * and optionally creates leads or escalates to humans.
 *
 * SAFETY GUARDRAILS (enforced in `applySafetyGuardrails`):
 *   - Never guarantees admission, visa, scholarship, employment, or
 *     immigration outcomes.
 *   - Distinguishes TARGET vs VERIFIED RESULT for employment stats.
 *   - Indicates verification date for time-sensitive info (tuition,
 *     deadlines, intakes, scholarships, requirements).
 *   - Never invents missing data — says "I don't have that information"
 *     and offers to connect with a human.
 *
 * PROVIDER BOUNDARY:
 *   No generative provider is called in this release. Responses come from
 *   deterministic rules and verified local records. Provider enablement is a
 *   separate credentialed acceptance step and must retain human approval.
 */
import { db } from "@/lib/db";
import { whatsappConfig } from "./config";
import {
  classifyIntent,
  isHumanHandoffRequest,
  type WhatsappIntent,
} from "./intents";
import {
  retrieveKnowledge,
  type KnowledgeResult,
} from "./knowledge";
import {
  createOrUpdateLead,
  escalateToHuman,
  type LeadCaptureData,
  type LeadConsentFlags,
} from "./leads";

// ─── Types ──────────────────────────────────────────────────────────────

export type AgentMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
};

export type AgentRequest = {
  /** The user's incoming message */
  message: string;
  /** The user's WhatsApp number (international format, digits only) */
  from: string;
  /** Conversation history (most recent last) */
  history?: AgentMessage[];
  /** Conversation reference token (for audit trail) */
  conversationRef?: string;
  /** Lead capture data collected so far (if any) */
  leadData?: Partial<LeadCaptureData>;
  /** Consent flags (if user has provided consent) */
  consent?: LeadConsentFlags | null;
};

export type AgentAction =
  | { type: "respond"; message: string }
  | { type: "human_handoff"; message: string; taskId: string }
  | {
      type: "lead_created";
      message: string;
      contactId: string;
      inquiryId: string;
      isExisting: boolean;
    }
  | { type: "consent_required"; message: string };

export type AgentResponse = {
  intent: WhatsappIntent;
  intentConfidence: number;
  intentMethod: "keyword" | "fallback";
  knowledge: KnowledgeResult | null;
  action: AgentAction;
  /** True if the AI identified itself in the response */
  identified: boolean;
  /** Always false in this deterministic release; retained for truthful API compatibility */
  usedLlm: boolean;
  /** Timestamp ISO */
  timestamp: string;
  /** Total processing time in ms */
  elapsedMs: number;
};

// ─── Safety guardrails (post-processing) ────────────────────────────────

const FORBIDDEN_PHRASES: { pattern: RegExp; replacement: string }[] = [
  {
    pattern: /\b(you\s+will\s+(?:definitely|surely|certainly)\s+(?:get|receive|be\s+awarded))\b/gi,
    replacement: "your profile appears to be a potential match for",
  },
  {
    pattern: /\b(guaranteed\s+(?:admission|visa|scholarship|acceptance|approval))\b/gi,
    replacement: "potential eligibility (final decision by the authority)",
  },
  {
    pattern: /\b(visa\s+will\s+(?:be\s+)?approved|visa\s+approval\s+is\s+(?:guaranteed|certain))\b/gi,
    replacement: "visa decisions are made by the relevant immigration authority",
  },
  {
    pattern: /\b(\d+%\s+of\s+(?:students|graduates)\s+are\s+employed)\b/gi,
    replacement: "target employment outcome (verify with official source)",
  },
];

/**
 * Apply safety guardrails to a generated response.
 * Replaces forbidden guarantee phrases with safe alternatives.
 * Returns the sanitized text.
 */
export function applySafetyGuardrails(text: string): string {
  let result = text;
  for (const rule of FORBIDDEN_PHRASES) {
    result = result.replace(rule.pattern, rule.replacement);
  }
  return result;
}

// ─── Greeting & identification ──────────────────────────────────────────

export const GREETING_MESSAGE =
  "Hi, I'm Al-Amin's AI Assistant. I can help you explore study-abroad options — universities, courses, scholarships, PhDs, supervisors, and next steps. What would you like to know?";

/**
 * Check if the user's message is a greeting (Hi, Hello, Hey, etc.).
 * If so, the agent introduces itself.
 */
function isGreeting(message: string): boolean {
  return /^\s*(hi|hello|hey|salam|assalamu|good\s+(?:morning|afternoon|evening)|start|help)\b/i.test(
    message.trim()
  );
}

// ─── Deterministic verified-rules response generator ────────────────────

/**
 * Generate a response using deterministic rules + retrieved knowledge.
 * This is the only response generator in the current release.
 */
function generateRuleBasedResponse(
  intent: WhatsappIntent,
  knowledge: KnowledgeResult | null,
  userMessage: string
): string {
  const lines: string[] = [];

  switch (intent) {
    case "HUMAN_AGENT":
    case "ALO_EDUCATION_HANDOFF":
      return (
        "I'll connect you with a human counselor right away. They'll reach out on WhatsApp within 1 business day.\n\n" +
        "If urgent, call 01716 609 554. Your reference will be shared shortly."
      );

    case "OTHER":
      if (isGreeting(userMessage)) {
        return GREETING_MESSAGE;
      }
      return (
        "I'm Al-Amin's AI Assistant. I can help with: universities, courses, scholarships, PhDs, supervisors, " +
        "destinations, eligibility, applications, and documents.\n\nWhat would you like to explore?"
      );

    case "STUDY_DESTINATION":
      if (knowledge && knowledge.countries.length > 0) {
        lines.push("Here are study destinations from our verified database:");
        for (const c of knowledge.countries.slice(0, 5)) {
          lines.push(`• ${c.flagEmoji || "📍"} ${c.name} — ${c.tuitionFeeRange || "tuition varies"}`);
        }
        if (knowledge.countries[0]?.lastVerifiedAt) {
          lines.push(`\nVerified: ${new Date(knowledge.countries[0].lastVerifiedAt).toISOString().split("T")[0]}`);
        }
        lines.push("\nWhich destination would you like to explore in detail?");
      } else {
        lines.push("I don't have destination data available right now. Would you like me to connect you with a counselor who can help?");
      }
      return lines.join("\n");

    case "UNIVERSITY_SEARCH":
      if (knowledge && knowledge.universities.length > 0) {
        lines.push("Here are universities from our verified database:");
        for (const u of knowledge.universities.slice(0, 5)) {
          lines.push(`• ${u.name}${u.country ? ` (${u.country})` : ""}`);
        }
        lines.push("\nWhich university would you like details on?");
      } else {
        lines.push("I don't have a university matching that query in my verified database.");
        lines.push("Would you like me to connect you with a counselor for personalized help?");
      }
      return lines.join("\n");

    case "COURSE_SEARCH":
      if (knowledge && knowledge.courses.length > 0) {
        lines.push("Here are courses from our verified database:");
        for (const c of knowledge.courses.slice(0, 5)) {
          const fee = c.tuitionFee ? `${c.tuitionFee} ${c.tuitionCurrency}` : "fee varies";
          lines.push(`• ${c.title} — ${c.universityName || "various"} (${c.studyLevel || "level n/a"}, ${fee})`);
        }
        lines.push("\nWhich course would you like to apply for?");
      } else {
        lines.push("I don't have a course matching that query.");
        lines.push("Try: 'MSc Computer Science UK' or 'MBA Australia'. Or ask to connect with a counselor.");
      }
      return lines.join("\n");

    case "SCHOLARSHIP_SEARCH":
      if (knowledge && knowledge.scholarships.length > 0) {
        lines.push("Here are scholarships from our verified database:");
        for (const s of knowledge.scholarships.slice(0, 5)) {
          lines.push(`• ${s.name}${s.provider ? ` (${s.provider})` : ""}${s.fundingAmount ? ` — ${s.fundingAmount}` : ""}`);
        }
        lines.push("\nDeadlines change — please verify on the official scholarship page.");
        lines.push("Would you like help applying?");
      } else {
        lines.push("I don't have a scholarship matching that query.");
        lines.push("Try: 'Chevening', 'Commonwealth', or 'fully-funded PhD'.");
      }
      return lines.join("\n");

    case "PHD_SEARCH":
      if (knowledge && knowledge.phds.length > 0) {
        lines.push("Here are PhD/research opportunities from our verified database:");
        for (const p of knowledge.phds.slice(0, 5)) {
          lines.push(`• ${p.title}${p.universityName ? ` — ${p.universityName}` : ""}`);
        }
        lines.push("\nWould you like to contact the supervisor?");
      } else {
        lines.push("I don't have a PhD project matching that query.");
        lines.push("Try: 'PhD Computer Science' or 'fully-funded PhD UK'.");
      }
      return lines.join("\n");

    case "SUPERVISOR_SEARCH":
      if (knowledge && knowledge.supervisors.length > 0) {
        lines.push("Here are supervisors from our verified database:");
        for (const s of knowledge.supervisors.slice(0, 5)) {
          const accepting = s.acceptingStudents ? "✓ accepting" : "✗ full";
          lines.push(`• ${s.name}${s.academicTitle ? `, ${s.academicTitle}` : ""} — ${s.universityName || ""} (${accepting})`);
        }
        lines.push("\nWould you like their contact details?");
      } else {
        lines.push("I don't have a supervisor matching that query.");
      }
      return lines.join("\n");

    case "ELIGIBILITY":
      return (
        "I can give a preliminary eligibility check, but final decisions are made by the university.\n\n" +
        "Please share:\n" +
        "• Your current qualification (e.g. BSc GPA)\n" +
        "• Target study level (Bachelors/Masters/PhD)\n" +
        "• English test status (IELTS/TOEFL score, or not taken)\n\n" +
        "Or I can connect you with a counselor for a detailed assessment."
      );

    case "APPLICATION":
      return (
        "Here's the general application process:\n" +
        "1. Shortlist 3-5 universities/courses\n" +
        "2. Prepare documents (transcripts, SOP, LORs, CV, passport, English test score)\n" +
        "3. Apply online via the university portal\n" +
        "4. Pay application fee (if any)\n" +
        "5. Receive offer letter → accept → pay deposit\n" +
        "6. Apply for student visa\n" +
        "7. Arrange accommodation and travel\n\n" +
        "Deadlines vary by university and intake. Want me to find specific deadlines?"
      );

    case "DOCUMENTS":
      return (
        "Common documents for study-abroad applications:\n" +
        "• Academic transcripts (attested)\n" +
        "• Degree certificates (if graduated)\n" +
        "• Statement of Purpose (SOP)\n" +
        "• 2-3 Letters of Recommendation (LORs)\n" +
        "• CV/Resume\n" +
        "• English test score (IELTS/TOEFL/PTE/Duolingo)\n" +
        "• Passport (valid 6+ months)\n" +
        "• Passport-size photos\n" +
        "• Financial evidence (bank statement)\n\n" +
        "⚠️ Never share sensitive documents through this WhatsApp chat. Use the secure portal once you're working with a counselor."
      );

    case "CONSULTATION":
      return (
        "I can connect you with a counselor for a consultation.\n\n" +
        "Would you like me to? If yes, please share:\n" +
        "• Your name\n" +
        "• Preferred destination\n" +
        "• Study level\n" +
        "I'll create a lead and a counselor will contact you within 1 business day."
      );

    case "CONTACT":
      return (
        "You can reach us:\n" +
        "• WhatsApp: 01716 609 554\n" +
        "• Website: alaminn.info/contact\n\n" +
        "Would you like a counselor to call you back?"
      );

    default:
      return (
        "I'm Al-Amin's AI Assistant. I can help with universities, courses, scholarships, PhDs, supervisors, " +
        "destinations, eligibility, applications, and documents.\n\nWhat would you like to know?"
      );
  }
}

// Generative provider execution is intentionally absent. The public assistant
// uses deterministic verified rules until an approved provider is implemented,
// credentialed, and tested with human approval controls.

// ─── Main agent entry point ─────────────────────────────────────────────

/**
 * Process an incoming WhatsApp message and produce a response.
 *
 * Flow:
 *   1. Check AI mode (PAUSED → return offline message)
 *   2. Detect human-handoff request → escalate immediately
 *   3. Classify intent
 *   4. Retrieve knowledge from verified DB
 *   5. Generate a deterministic response from verified local rules and records
 *   6. Apply safety guardrails
 *   7. Handle lead creation / consent flow if applicable
 *   8. Return AgentResponse
 */
export async function processAgentMessage(
  req: AgentRequest
): Promise<AgentResponse> {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const cfg = whatsappConfig();

  // 1. Check AI mode
  if (cfg.aiMode === "PAUSED") {
    return {
      intent: "OTHER",
      intentConfidence: 1,
      intentMethod: "keyword",
      knowledge: null,
      action: {
        type: "respond",
        message:
          "Al-Amin's AI Assistant is currently paused. Our team will respond to your message within 1 business day. For urgent queries, call 01716 609 554.",
      },
      identified: true,
      usedLlm: false,
      timestamp,
      elapsedMs: Date.now() - start,
    };
  }

  // 2. Human handoff short-circuit
  if (isHumanHandoffRequest(req.message)) {
    // For web-preview (no real WhatsApp number), skip DB task creation
    // and return the handoff message directly.
    if (req.from === "web-preview" || !req.from.match(/^\d+$/)) {
      return {
        intent: "HUMAN_AGENT",
        intentConfidence: 1,
        intentMethod: "keyword",
        knowledge: null,
        action: {
          type: "respond",
          message:
            "Al-Amin's AI Assistant: I'm connecting you with a human counselor. They'll reach out to you on WhatsApp within 1 business day.\n\n" +
            "If urgent, call 01716 609 554. You can also start a WhatsApp chat directly: " +
            "https://wa.me/8801716609554?text=I%27d%20like%20to%20speak%20with%20a%20counselor",
        },
        identified: true,
        usedLlm: false,
        timestamp,
        elapsedMs: Date.now() - start,
      };
    }
    const handoff = await escalateToHuman({
      whatsappNumber: req.from,
      reason: "User requested human agent",
      conversationRef: req.conversationRef,
    });
    return {
      intent: "HUMAN_AGENT",
      intentConfidence: 1,
      intentMethod: "keyword",
      knowledge: null,
      action: { type: "human_handoff", message: handoff.message, taskId: handoff.taskId },
      identified: true,
      usedLlm: false,
      timestamp,
      elapsedMs: Date.now() - start,
    };
  }

  // 3. Classify intent
  const classification = classifyIntent(req.message);
  const intent = classification.intent;

  // 4. Retrieve knowledge (only for intents that need DB lookups)
  const needsKnowledge = [
    "STUDY_DESTINATION",
    "UNIVERSITY_SEARCH",
    "COURSE_SEARCH",
    "SCHOLARSHIP_SEARCH",
    "PHD_SEARCH",
    "SUPERVISOR_SEARCH",
    "ELIGIBILITY",
  ].includes(intent);

  const knowledge = needsKnowledge ? await retrieveKnowledge(req.message) : null;

  // 5. Generate a deterministic response from verified local knowledge.
  // No generative-provider call is made in this release.
  const usedLlm = false;
  let responseText = generateRuleBasedResponse(intent, knowledge, req.message);

  // 6. Apply safety guardrails and make the non-human identity explicit on
  // every answer. The assistant helps Al-Amin; it never impersonates him.
  responseText = applySafetyGuardrails(responseText);
  if (!/Al-Amin[’']s AI Assistant/i.test(responseText)) {
    responseText = `Al-Amin's AI Assistant:\n${responseText}`;
  }

  // 7. Handle lead creation / consent flow
  let action: AgentAction = { type: "respond", message: responseText };

  // If user explicitly asked for consultation/counselor AND we have consent → create lead
  if (
    (intent === "CONSULTATION" || intent === "ALO_EDUCATION_HANDOFF") &&
    req.consent &&
    req.consent.privacyConsent &&
    req.consent.commsConsent &&
    req.leadData
  ) {
    try {
      const lead = await createOrUpdateLead(
        {
          whatsappNumber: req.from,
          ...req.leadData,
          conversationRef: req.conversationRef,
        },
        req.consent
      );
      action = {
        type: "lead_created",
        message: `${responseText}\n\n✅ ${lead.message}\nReference: ${lead.inquiryId.slice(-8).toUpperCase()}`,
        contactId: lead.contactId,
        inquiryId: lead.inquiryId,
        isExisting: lead.isExisting,
      };
    } catch {
      // Lead creation failed — keep the original respond action
    }
  }

  // If user wants consultation but hasn't given consent yet → ask for consent
  if (
    (intent === "CONSULTATION" || intent === "ALO_EDUCATION_HANDOFF") &&
    !req.consent
  ) {
    action = {
      type: "consent_required",
      message:
        responseText +
        "\n\n📋 Before I connect you, I need your consent:\n" +
        "• I'll store your name, WhatsApp number, and study preferences\n" +
        "• A counselor may contact you on WhatsApp\n" +
        "• You can request deletion anytime\n\n" +
        "Reply 'I agree' to proceed, or 'no thanks' to continue chatting with me.",
    };
  }

  return {
    intent,
    intentConfidence: classification.confidence,
    intentMethod: classification.method,
    knowledge,
    action,
    identified: /Al-Amin[’']s AI Assistant/i.test(responseText),
    usedLlm,
    timestamp,
    elapsedMs: Date.now() - start,
  };
}

/**
 * Get agent metrics for the admin panel.
 * Returns counts from the last 24h by default.
 */
export async function getAgentMetrics(hoursBack = 24) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const [leads, handoffs, auditLogs] = await Promise.all([
    db.inquiry.count({
      where: {
        referralSource: "ALAMINN_WHATSAPP_AI",
        createdAt: { gte: since },
      },
    }),
    db.task.count({
      where: {
        title: { contains: "WhatsApp human handoff" },
        createdAt: { gte: since },
      },
    }),
    db.auditLog.count({
      where: {
        createdAt: { gte: since },
        OR: [
          { action: "whatsapp_lead_created" },
          { action: "whatsapp_human_handoff" },
          { action: "whatsapp_message_received" },
          { action: "whatsapp_message_sent" },
          { action: "whatsapp_message_failed" },
          { action: "whatsapp_intent_detected" },
          { action: "whatsapp_api_error" },
        ],
      },
    }),
  ]);

  const apiErrors = await db.auditLog.count({
    where: {
      action: "whatsapp_api_error",
      createdAt: { gte: since },
    },
  });

  return {
    leadsCreated: leads,
    humanHandoffs: handoffs,
    totalEvents: auditLogs,
    apiErrors,
    aiConversations: auditLogs - apiErrors, // rough estimate
    // For metrics we can't compute without a dedicated events table
    messagesToday: null,
    failedMessages: apiErrors,
    averageResponseTimeMs: null,
  };
}
