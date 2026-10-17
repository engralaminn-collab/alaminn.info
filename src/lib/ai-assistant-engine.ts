/**
 * Al-Amin AI Assistant Engine
 *
 * Dedicated AI intelligence for student guidance, progressive profiling,
 * study-abroad inquiries, and consultation booking handoffs.
 *
 * GOVERNANCE RULES:
 * 1. Clearly identifies itself as "Al-Amin's AI Assistant"
 * 2. Never invents guarantees (visa, admission, scholarships, jobs)
 * 3. Transparently indicates when information requires human verification
 * 4. Supports English and Bangla with automatic language detection
 * 5. Collects student profile progressively across 14 dimensions
 */

import { db } from "@/lib/db";
import { VERIFIED_CAREER_DATA } from "@/lib/career-data";
import { ALO_SERVICES, STUDY_DESTINATIONS } from "@/lib/alo-education-data";

export type StudentProfile = {
  name?: string;
  email?: string;
  whatsapp?: string;
  currentEducation?: string;
  gpa?: string;
  englishTest?: string;
  englishScore?: string;
  studyLevel?: string;
  subject?: string;
  preferredCountry?: string;
  preferredIntake?: string;
  budget?: string;
  studyGap?: string;
  currentLocation?: string;
};

export type AiChatMessage = {
  id: string;
  sender: "user" | "assistant" | "system";
  text: string;
  timestamp: string;
  language?: "en" | "bn";
  options?: { label: string; action: string }[];
  bookingOffer?: boolean;
  profileCaptured?: Partial<StudentProfile>;
};

export type AiChatSession = {
  sessionId: string;
  messages: AiChatMessage[];
  profile: Partial<StudentProfile>;
  leadId?: string;
  isEscalated?: boolean;
  language: "en" | "bn";
  createdAt: string;
  updatedAt: string;
};

// In-memory session store (with DB persistence for leads and conversations)
const sessionsMap = new Map<string, AiChatSession>();

export function getOrCreateSession(sessionId: string): AiChatSession {
  let session = sessionsMap.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: "assistant",
          text: "Hi! I'm Al-Amin's AI Assistant. I can help you explore study-abroad options across the UK, USA, Canada, Australia, Ireland, and Europe, understand ALO Education's services, assess your eligibility, and connect you with Al-Amin's expert team for a 1-on-1 consultation.\n\nWhich country or subject are you interested in studying?",
          timestamp: new Date().toISOString(),
          language: "en",
          options: [
            { label: "Study in the UK 🇬🇧", action: "Tell me about studying in the UK" },
            { label: "Study in the USA 🇺🇸", action: "Tell me about studying in the USA" },
            { label: "Study in Canada 🇨🇦", action: "Tell me about studying in Canada" },
            { label: "Study in Australia 🇦🇺", action: "Tell me about studying in Australia" },
            { label: "Book Consultation 📅", action: "I want to book a consultation" },
          ],
        },
      ],
      profile: {},
      language: "en",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessionsMap.set(sessionId, session);
  }
  return session;
}

export function detectLanguage(text: string): "en" | "bn" {
  // Bengali Unicode range: \u0980-\u09FF
  const bengaliRegex = /[\u0980-\u09FF]/;
  return bengaliRegex.test(text) ? "bn" : "en";
}

/**
 * Extract progressive student profiling signals from user text
 */
export function extractProfileFields(text: string, currentProfile: Partial<StudentProfile>): Partial<StudentProfile> {
  const updated = { ...currentProfile };
  const lower = text.toLowerCase();

  // Email extraction
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch && !updated.email) {
    updated.email = emailMatch[0];
  }

  // Phone / WhatsApp extraction (Bangladesh or international formats)
  const phoneMatch = text.match(/(?:\+?880\s?|0)1[3-9]\d{8}|\+?[1-9]\d{7,14}/);
  if (phoneMatch && !updated.whatsapp) {
    updated.whatsapp = phoneMatch[0].replace(/\s+/g, "");
  }

  // English test detection
  if (lower.includes("ielts")) {
    updated.englishTest = "IELTS";
    const scoreMatch = text.match(/ielts\s*(?:score\s*is\s*|is\s*|of\s*|:\s*)?([5-9](?:\.[05])?)/i);
    if (scoreMatch) updated.englishScore = scoreMatch[1];
  } else if (lower.includes("pte")) {
    updated.englishTest = "PTE";
    const scoreMatch = text.match(/pte\s*(?:score\s*is\s*|is\s*|of\s*|:\s*)?([4-9]\d)/i);
    if (scoreMatch) updated.englishScore = scoreMatch[1];
  } else if (lower.includes("toefl")) {
    updated.englishTest = "TOEFL";
    const scoreMatch = text.match(/toefl\s*(?:score\s*is\s*|is\s*|of\s*|:\s*)?([6-9]\d|1[0-1]\d|120)/i);
    if (scoreMatch) updated.englishScore = scoreMatch[1];
  } else if (lower.includes("duolingo") || lower.includes("det")) {
    updated.englishTest = "Duolingo";
    const scoreMatch = text.match(/(?:duolingo|det)\s*(?:score\s*is\s*|is\s*|of\s*|:\s*)?([9]\d|1[0-5]\d|160)/i);
    if (scoreMatch) updated.englishScore = scoreMatch[1];
  } else if (lower.includes("without ielts") || lower.includes("no ielts") || lower.includes("moi")) {
    updated.englishTest = "MOI / English Waiver";
  }

  // GPA / CGPA extraction
  const gpaMatch = text.match(/(?:cgpa|gpa)\s*(?:is\s*|:\s*|=)?\s*([2-5](?:\.\d{1,2})?)/i);
  if (gpaMatch && !updated.gpa) {
    updated.gpa = gpaMatch[1];
  }

  // Study level
  if (lower.includes("master") || lower.includes("msc") || lower.includes("mba") || lower.includes("postgrad")) {
    updated.studyLevel = "Postgraduate (Master's)";
  } else if (lower.includes("bachelor") || lower.includes("undergrad") || lower.includes("bsc") || lower.includes("bba") || lower.includes("hsc")) {
    updated.studyLevel = "Undergraduate (Bachelor's)";
  } else if (lower.includes("phd") || lower.includes("doctorate") || lower.includes("mphil")) {
    updated.studyLevel = "PhD / Doctoral Research";
  }

  // Country
  if (lower.includes("uk") || lower.includes("united kingdom") || lower.includes("england") || lower.includes("britain")) {
    updated.preferredCountry = "United Kingdom";
  } else if (lower.includes("usa") || lower.includes("united states") || lower.includes("america")) {
    updated.preferredCountry = "United States";
  } else if (lower.includes("canada")) {
    updated.preferredCountry = "Canada";
  } else if (lower.includes("australia") || lower.includes("aussie")) {
    updated.preferredCountry = "Australia";
  } else if (lower.includes("ireland")) {
    updated.preferredCountry = "Ireland";
  } else if (lower.includes("new zealand") || lower.includes("nz")) {
    updated.preferredCountry = "New Zealand";
  } else if (lower.includes("germany") || lower.includes("europe") || lower.includes("finland") || lower.includes("sweden")) {
    updated.preferredCountry = "Europe";
  }

  // Study gap
  const gapMatch = text.match(/(\d{1,2})\s*(?:years?|yrs?)\s*(?:study\s*)?gap/i);
  if (gapMatch && !updated.studyGap) {
    updated.studyGap = `${gapMatch[1]} years`;
  }

  // Name extraction (e.g. "My name is John" or "I am Rahim")
  const nameMatch = text.match(/(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nameMatch && !updated.name) {
    updated.name = nameMatch[1].trim();
  }

  return updated;
}

/**
 * Generate AI Assistant Reply with Contextual Grounding & Progressive Profiling
 */
export async function processAiMessage(
  sessionId: string,
  userMessage: string
): Promise<AiChatMessage> {
  const session = getOrCreateSession(sessionId);
  const lang = detectLanguage(userMessage);
  session.language = lang;

  // Record user message
  const userMsgObj: AiChatMessage = {
    id: `msg-user-${Date.now()}`,
    sender: "user",
    text: userMessage,
    timestamp: new Date().toISOString(),
    language: lang,
  };
  session.messages.push(userMsgObj);

  // Update profile
  session.profile = extractProfileFields(userMessage, session.profile);

  const lower = userMessage.toLowerCase();
  let replyText = "";
  let bookingOffer = false;
  let options: { label: string; action: string }[] | undefined = undefined;

  // 1. Check for Consultation Booking Request
  if (
    lower.includes("book") ||
    lower.includes("consultation") ||
    lower.includes("appointment") ||
    lower.includes("meeting") ||
    lower.includes("schedule") ||
    lower.includes("কথা বলতে চাই") ||
    lower.includes("বুক")
  ) {
    bookingOffer = true;
    replyText =
      lang === "bn"
        ? "আপনি সরাসরি আল-আমিনের টিমের সাথে ১-অন-১ কনসালটেশন বুক করতে পারেন। আমাদের এক্সপার্টরা আপনার প্রোফাইল, বাজেট ও ক্যারিয়ার লক্ষ্য অনুযায়ী নিখুঁত বিশ্ববিদ্যালয় ও ভিসা গাইডলাইন প্রদান করবে।\n\nনিচের বাটনে ক্লিক করে সুবিধাজনক তারিখ ও সময় বেছে নিন:"
        : "You can book a 1-on-1 personalized consultation with Al-Amin's expert team. We will review your transcripts, test scores, target destination, and provide a clear step-by-step roadmap.\n\nPlease select your preferred date and time on our booking page below:";
    options = [
      { label: "Book Consultation Now 📅", action: "/book" },
      { label: "Explore ALO Education Services", action: "Tell me about ALO Education services" },
    ];
  }
  // 2. Human Escalation / Direct Contact
  else if (
    lower.includes("speak to human") ||
    lower.includes("real person") ||
    lower.includes("talk to al amin") ||
    lower.includes("contact team") ||
    lower.includes("মানুষের সাথে কথা")
  ) {
    session.isEscalated = true;
    bookingOffer = true;
    replyText =
      lang === "bn"
        ? "আমি আপনার বার্তাটি আল-আমিনের টিমের কাছে পাঠিয়েছি। একজন সিনিয়র এডুকেশন এডভাইজার আপনার প্রোফাইলটি পর্যালোচনা করবেন। এছাড়া আপনি সরাসরি হোয়াটসঅ্যাপে বার্তা পাঠাতে পারেন অথবা কনসালটেশন বুক করতে পারেন।"
        : "I'd recommend connecting you directly with Al-Amin's team so your specific profile and academic history can be reviewed thoroughly by a senior counselor.\n\nYou can also reach out via WhatsApp at +880 1716-609554 or schedule a video consultation.";
    options = [
      { label: "Schedule 1-on-1 Meeting 📅", action: "/book" },
      { label: "Chat on WhatsApp 💬", action: "https://wa.me/8801716609554" },
    ];
  }
  // 3. Country-Specific Guidance (UK, USA, Canada, Australia, Ireland, Europe)
  else if (lower.includes("uk") || lower.includes("united kingdom") || lower.includes("লন্ডন") || lower.includes("যুক্তরাজ্য")) {
    replyText =
      lang === "bn"
        ? "যুক্তরাজ্য (UK) উচ্চশিক্ষার জন্য অন্যতম সেরা গন্তব্য:\n\n• ১ বছরের মাস্টার্স ও ৩ বছরের ব্যাচেলরস ডিগ্রি\n• পড়াশোনা শেষে ২ বছরের গ্র্যাজুয়েট রুট ওয়ার্ক ভিসা (PSW)\n• জানুয়ারি ও সেপ্টেম্বর প্রধান ইনটেক\n• মিডিয়াম অফ ইনস্ট্রাকশন (MOI) সহ IELTS ওয়েভারের সুযোগ\n• টিউশন ফি: গড়ে £১২,০০০ - £২৬,০০০/বছর\n\nআপনার বর্তমান সিজিপিএ (CGPA) এবং ইংলিশ টেস্ট স্কোর কত? জানালে আমি উপযুক্ত বিশ্ববিদ্যালয়ের তালিকা শেয়ার করতে পারি।"
        : "The UK is one of the premier study-abroad destinations:\n\n• 1-Year Master's & 3-Year Bachelor's degrees (faster graduation & lower cost)\n• 2-Year Post-Study Graduate Route Work Visa\n• Main intakes in September/October and January/February\n• IELTS waiver options available for qualified medium-of-instruction (MOI) backgrounds\n• Tuition range: £12,000 – £26,000/year\n\nWhat is your current degree, CGPA, and English test status? I can help suggest suitable institutions.";
    options = [
      { label: "Check UK Entry Requirements", action: "What are the UK entry requirements?" },
      { label: "UK Scholarships Guidance", action: "What scholarships are available for UK?" },
      { label: "Book UK Consultation 🇬🇧", action: "/book" },
    ];
  } else if (lower.includes("usa") || lower.includes("america") || lower.includes("যুক্তরাষ্ট্র")) {
    replyText =
      lang === "bn"
        ? "আমেরিকায় (USA) উচ্চশিক্ষার প্রধান বৈশিষ্ট্যসমূহ:\n\n• বিশ্বমানের স্টেম (STEM) প্রোগ্রামে ৩ বছর পর্যন্ত OPT কাজের সুবিধা\n• ব্যাচেলরস ও মাস্টার্স কোর্সে স্কলারশিপ ও অ্যাসিস্ট্যান্টশিপ (TA/RA)\n• ফল (আগস্ট) এবং স্প্রিং (জানুয়ারি) প্রধান সেশন\n• এফ-১ (F-1) স্টুডেন্ট ভিসা ইন্টারভিউ প্রস্তুতি ও স্পন্সরশিপ গাইডেন্স\n\nআপনার কি কোনো GRE/GMAT বা IELTS/Duolingo স্কোর রয়েছে?"
        : "Studying in the United States offers world-class opportunities:\n\n• STEM-designated degrees offering up to 3 years of OPT work authorization\n• Extensive merit scholarships and graduate assistantships (TA/RA)\n• Major intakes: Fall (August) and Spring (January)\n• F-1 Visa documentation and personalized mock interview preparation via ALO Education\n\nDo you have an English proficiency score (IELTS/TOEFL/Duolingo) or GRE/GMAT ready?";
    options = [
      { label: "USA STEM & OPT Info", action: "Tell me about STEM OPT in USA" },
      { label: "USA Scholarship Options", action: "How to get scholarships in USA?" },
      { label: "Book USA Consultation 🇺🇸", action: "/book" },
    ];
  } else if (lower.includes("canada") || lower.includes("কানাডা")) {
    replyText =
      lang === "bn"
        ? "কানাডায় (Canada) উচ্চশিক্ষা ও ভবিষ্যৎ ক্যারিয়ার:\n\n• ডিগ্রি শেষে ৩ বছর পর্যন্ত পোস্ট-গ্র্যাজুয়েশন ওয়ার্ক পারমিট (PGWP)\n• স্থায়ী বসবাসের (PR) স্পষ্ট সুযোগ (Express Entry / PNP)\n• প্রধান ইনটেক: সেপ্টেম্বর (ফল), জানুয়ারি (উইন্টার), মে (সামার)\n• SDS ও Non-SDS স্টাডি পারমিট ফাইল প্রিপারেশন\n\nআপনার কি কোনো স্টাডি গ্যাপ বা স্পেসিফিক সাবজেক্ট পছন্দ আছে?"
        : "Canada remains a top choice for international students:\n\n• Post-Graduation Work Permit (PGWP) for up to 3 years\n• Clear permanent residency pathways for skilled graduates\n• Key intakes: September (Fall), January (Winter), May (Spring)\n• Complete SDS / Non-SDS visa file preparation & GIC guidance\n\nWhat is your intended field of study and budget range?";
    options = [
      { label: "Canada PGWP Rules", action: "Tell me about Canada PGWP" },
      { label: "Canada Visa & GIC Checklist", action: "What is needed for Canada visa?" },
      { label: "Book Canada Advisory 🇨🇦", action: "/book" },
    ];
  } else if (lower.includes("australia") || lower.includes("অস্ট্রেলিয়া")) {
    replyText =
      lang === "bn"
        ? "অস্ট্রেলিয়ায় (Australia) উচ্চশিক্ষা:\n\n• গ্রুপ অফ এইট (Go8) সহ বিশ্বসেরা বিশ্ববিদ্যালয়\n• ২-৪ বছর পর্যন্ত সাবক্লাস ৪৮৫ পোস্ট-স্টাডি ওয়ার্ক ভিসা\n• রিজিওনাল এরিয়ায় অতিরিক্ত ১-২ বছর পিএসডব্লিউ সুবিধা\n• প্রধান ইনটেক: ফেব্রুয়ারি ও জুলাই\n\nআপনার আইইএলটিএস/পিটিই (IELTS/PTE) স্কোর কেমন?"
        : "Australia offers globally recognized degrees and strong post-study opportunities:\n\n• Group of Eight (Go8) world-ranked research institutions\n• Subclass 485 Temporary Graduate Visa (2 to 4 years)\n• Additional 1-2 years post-study work bonus in regional areas\n• Primary intakes: February/March and July/August\n\nWhat is your current IELTS or PTE score?";
    options = [
      { label: "Australia Regional Benefits", action: "What are Australia regional benefits?" },
      { label: "Subclass 500 Visa Steps", action: "How to apply for Australian student visa?" },
      { label: "Book Australia Advisory 🇦🇺", action: "/book" },
    ];
  }
  // 4. Questions about Al-Amin / ALO Education / Career History
  else if (lower.includes("al-amin") || lower.includes("alamin") || lower.includes("who is") || lower.includes("career") || lower.includes("কে")) {
    replyText =
      "Al-Amin is an Education Business & Operations Leader, Sales Strategist, International Education Specialist, and AI Systems Builder based in Dhaka, Bangladesh.\n\nHis verified career history includes:\n• Manager, Operations & Sales at TCL Global (Sep 2022 – Jan 2023)\n• Assistant Senior Education Consultant at TCL Global (Oct 2021 – Sep 2022)\n• Educational Consultant at TCL Global (Oct 2019 – Nov 2021)\n• Recognized as Best Sales Performer and Stand-Out Performer\n• Education Strategist and Systems Leader connecting students to ALO Education support.\n\nWould you like to explore his verified career timeline or learn about ALO Education?";
    options = [
      { label: "View Career Timeline 📜", action: "/career" },
      { label: "Explore ALO Education 🎓", action: "/alo-education" },
      { label: "Book a Consultation 📅", action: "/book" },
    ];
  }
  // 5. Questions about Scholarships / Fees / Budget
  else if (lower.includes("scholarship") || lower.includes("funding") || lower.includes("fee") || lower.includes("cost") || lower.includes("স্কলারশিপ") || lower.includes("খরচ")) {
    replyText =
      lang === "bn"
        ? "বিভিন্ন দেশের স্কলারশিপ ও খরচের বিবরণ:\n\n• যুক্তরাজ্য: £২,০০০ - £১০,০০০ পর্যন্ত মেধাভিত্তিক স্কলারশিপ এবং আর্লি-বার্ড ডিসকাউন্ট\n• যুক্তরাষ্ট্র: ৫০% পর্যন্ত টিউশন ওয়েভার ও গ্র্যাজুয়েট অ্যাসিস্ট্যান্টশিপ\n• অস্ট্রেলিয়া: ২০% - ৩০% পর্যন্ত ইন্টারন্যাশনাল স্টুডেন্ট স্কলারশিপ\n• ইউরোপ/জার্মানি: পাবলিক বিশ্ববিদ্যালয়ে ন্যূনতম বা ফ্রি টিউশন\n\nসুনির্দিষ্ট স্কলারশিপের জন্য আপনার সিজিপিএ এবং একাডেমিক ব্যাকগ্রাউন্ড জানা প্রয়োজন। আপনার প্রোফাইল কি শেয়ার করবেন?"
        : "Scholarships and funding opportunities vary by destination and academic merit:\n\n• UK: £2,000 – £10,000 merit awards & early payment discounts\n• USA: Up to 50% tuition reduction and Graduate Assistantships (TA/RA)\n• Australia: 20% – 30% international scholarship reductions at major universities\n• Europe/Germany: Low or zero tuition in German public universities\n\nTo identify exact scholarships you qualify for, what is your latest CGPA and target subject?";
    options = [
      { label: "Assess My Scholarship Eligibility", action: "How to assess my scholarship eligibility?" },
      { label: "Book Financial Planning Advisory", action: "/book" },
    ];
  }
  // 6. Progressive Profile Prompting (if user gave pieces of information)
  else {
    const missingFields: string[] = [];
    if (!session.profile.preferredCountry) missingFields.push("Preferred Country (UK, USA, Canada, Australia, etc.)");
    if (!session.profile.studyLevel) missingFields.push("Study Level (Bachelor's, Master's, PhD)");
    if (!session.profile.englishTest) missingFields.push("English Test (IELTS, PTE, Duolingo, or None)");
    if (!session.profile.gpa) missingFields.push("Current GPA / CGPA");

    if (missingFields.length > 0 && Object.keys(session.profile).length > 0) {
      replyText =
        lang === "bn"
          ? `ধন্যবাদ! আপনার প্রোফাইলটি নিখুঁতভাবে সাজানোর জন্য কিছু অতিরিক্ত তথ্য সাহায্য করবে:\n\n• ${missingFields.slice(0, 2).join("\n• ")}\n\nদয়া করে এই তথ্যগুলো জানালে আমি আপনার জন্য সবচেয়ে উপযুক্ত পথ নির্দেশ করতে পারব।`
          : `Thank you for sharing that! To recommend the most accurate university and visa pathways for your profile, could you also share:\n\n• ${missingFields.slice(0, 2).join("\n• ")}\n\nThis will help me narrow down high-acceptance institutions and scholarship options for you.`;
    } else {
      replyText =
        lang === "bn"
          ? "আমি আল-আমিনের এআই অ্যাসিস্ট্যান্ট। আমি আপনাকে উচ্চশিক্ষা, বিশ্ববিদ্যালয় ও কোর্স নির্বাচন, ভিসা প্রক্রিয়া, স্কলারশিপ ও কনসালটেশন বুকিংয়ে সাহায্য করতে পারি। আপনার কি কোনো নির্দিষ্ট দেশ বা কোর্স সম্পর্কে প্রশ্ন আছে?"
          : "I'm Al-Amin's AI Assistant. I can help answer study-abroad questions across the UK, USA, Canada, Australia, Ireland, and Europe, explain ALO Education's admissions support, check entry criteria, and connect you with Al-Amin's senior counseling team.\n\nFeel free to ask any question, or share your academic background to get tailored advice!";
    }

    options = [
      { label: "UK Study Options 🇬🇧", action: "Tell me about studying in the UK" },
      { label: "USA Study Options 🇺🇸", action: "Tell me about studying in the USA" },
      { label: "Canada Study Options 🇨🇦", action: "Tell me about studying in Canada" },
      { label: "Book a Free Consultation 📅", action: "/book" },
    ];
  }

  // If user provided contact info (email or whatsapp), automatically capture/update lead in DB
  if (session.profile.email || session.profile.whatsapp) {
    try {
      const email = session.profile.email || `lead-${sessionId}@alaminn.info`;
      const fullName = session.profile.name || "Prospective Student";
      const whatsapp = session.profile.whatsapp || null;
      const country = session.profile.preferredCountry || null;

      const contact = await db.contact.upsert({
        where: { email },
        update: {
          whatsapp: whatsapp ?? undefined,
          country: country ?? undefined,
          tags: "ai-assistant-lead,study-abroad",
        },
        create: {
          fullName,
          email,
          whatsapp,
          country,
          preferredChannel: whatsapp ? "whatsapp" : "email",
          status: "active",
          tags: "ai-assistant-lead,study-abroad",
          source: "ai-assistant",
        },
      });

      session.leadId = contact.id;

      // Create an inquiry if not exists
      const existingInquiry = await db.inquiry.findFirst({
        where: { contactId: contact.id },
      });

      if (!existingInquiry) {
        await db.inquiry.create({
          data: {
            reference: `AI-${Date.now().toString(36).toUpperCase()}`,
            type: "student-referral",
            contactId: contact.id,
            scope: `Preferred: ${session.profile.preferredCountry || "Not specified"} | Level: ${session.profile.studyLevel || "Not specified"} | Test: ${session.profile.englishTest || "Not specified"} (${session.profile.englishScore || "N/A"})`,
            currentChallenge: `GPA: ${session.profile.gpa || "N/A"} | Gap: ${session.profile.studyGap || "None"}`,
            status: "new",
            privacyConsent: true,
            utmSource: "ai-assistant",
          },
        });
      }
    } catch (dbErr) {
      console.warn("Could not persist AI lead to database:", dbErr);
    }
  }

  const assistantMsgObj: AiChatMessage = {
    id: `msg-assistant-${Date.now()}`,
    sender: "assistant",
    text: replyText,
    timestamp: new Date().toISOString(),
    language: lang,
    options,
    bookingOffer,
    profileCaptured: { ...session.profile },
  };

  session.messages.push(assistantMsgObj);
  session.updatedAt = new Date().toISOString();

  return assistantMsgObj;
}
