/**
 * ALO Education Pathway and Service Model
 *
 * Pathway:
 * AL-AMIN (Personal Brand / Strategic Advisory)
 *   ↓
 * ALO EDUCATION (Student Support Infrastructure & Counselling)
 *   ↓
 * STUDENT SUCCESS (Admissions, Visa, Pre-Departure, Enrolment)
 */

export type AloService = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  highlights: string[];
  stages: string[];
  deliverables: string[];
};

export const ALO_SERVICES: AloService[] = [
  {
    id: "univ-course-selection",
    title: "University & Course Selection",
    slug: "university-course-selection",
    shortDesc: "Strategic matching based on academic background, budget, career aspirations, and post-study opportunities.",
    fullDesc:
      "We analyze your past academic transcripts, English proficiency scores, career trajectory, and financial budget to shortlist top-tier and best-fit institutions across the UK, USA, Canada, Australia, Ireland, New Zealand, and Europe.",
    icon: "Compass",
    highlights: [
      "Personalized profile assessment and eligibility audit",
      "Shortlisting high-acceptance and scholarship-eligible universities",
      "Course curriculum comparison and career outcome mapping",
      "Intake planning (Fall/September, Spring/January, Summer/May)",
    ],
    stages: ["Profile Evaluation", "Shortlisting", "Course Alignment", "Final Selection"],
    deliverables: [
      "Personalized university comparison matrix",
      "Minimum entry requirement checklist",
      "Tuition fee and living cost breakdown",
    ],
  },
  {
    id: "application-assistance",
    title: "Application Assistance & Documentation",
    slug: "application-assistance",
    shortDesc: "End-to-end guidance from statement of purpose (SOP) refinement to official university submission.",
    fullDesc:
      "Every university has strict documentation guidelines. We assist students with SOP structure, academic CV formatting, letters of recommendation (LOR) strategy, transcript notarization guidance, and timely portal submissions.",
    icon: "FileCheck2",
    highlights: [
      "Statement of Purpose (SOP) and personal statement review",
      "Academic CV and portfolio formatting",
      "Letter of Recommendation (LOR) guidance",
      "Direct portal submission and application fee waiver tracking",
    ],
    stages: ["Document Preparation", "SOP Editorial Review", "Portal Submission", "Offer Tracking"],
    deliverables: [
      "Polished SOP and Academic CV",
      "Error-free university application submissions",
      "Real-time offer letter updates (Conditional & Unconditional)",
    ],
  },
  {
    id: "scholarship-guidance",
    title: "Scholarship & Funding Guidance",
    slug: "scholarship-guidance",
    shortDesc: "Identifying merit-based, country-specific, and departmental scholarships to reduce tuition burdens.",
    fullDesc:
      "Study abroad is an investment. We help identify institutional discounts, early-bird fee reductions, vice-chancellor awards, government scholarships (Chevening, Commonwealth, Fulbright, Australia Awards), and assistantships.",
    icon: "Award",
    highlights: [
      "Merit-based and need-based scholarship matching",
      "Early bird fee deduction tracking",
      "Scholarship essay and motivation letter review",
      "Financial planning and living expense budgeting",
    ],
    stages: ["Opportunity Search", "Eligibility Check", "Essay Crafting", "Application Filing"],
    deliverables: [
      "Curated scholarship eligibility report",
      "Tailored scholarship motivation essay drafts",
      "Tuition discount confirmation tracking",
    ],
  },
  {
    id: "visa-documentation",
    title: "Visa & Financial Documentation Support",
    slug: "visa-documentation",
    shortDesc: "Meticulous visa file preparation, financial proof compliance, and mock visa interview training.",
    fullDesc:
      "Visa rejection is the biggest risk for aspiring students. We ensure strict adherence to UKVI, US F-1 / DS-160, Canadian SDS / Non-SDS, and Australian Subclass 500 requirements with comprehensive financial verification and mock interview coaching.",
    icon: "ShieldCheck",
    highlights: [
      "Country-specific visa checklist and documentation audit",
      "Bank statement, solvency, and source of fund verification",
      "SOP / Statement of Intent for visa officers",
      "1-on-1 mock interview sessions with realistic scenario questions",
    ],
    stages: ["Checklist Issue", "Fund Verification", "Application Filing", "Mock Interview"],
    deliverables: [
      "Compliant visa application dossier",
      "Bank solvency verification confirmation",
      "Confidence in real Embassy / High Commission interviews",
    ],
  },
  {
    id: "pre-departure-support",
    title: "Pre-Departure & Arrival Support",
    slug: "pre-departure-support",
    shortDesc: "Accommodation search, flight booking guidance, currency exchange, and cultural briefing.",
    fullDesc:
      "Getting your visa is only the first milestone. We help students prepare for travel, secure university or private student accommodation, set up international student bank accounts, understand part-time work rights, and connect with student alumni networks.",
    icon: "Plane",
    highlights: [
      "Student accommodation search and tenancy advice",
      "Pre-departure briefing checklist (packing, health, customs)",
      "Forex and international student banking guidance",
      "Post-arrival airport pickup coordination and alumni network intro",
    ],
    stages: ["Accommodation Booking", "Travel Prep", "Pre-Departure Briefing", "Arrival Welcome"],
    deliverables: [
      "Pre-departure comprehensive handbook",
      "Confirmed accommodation booking support",
      "Alumni connection in your target destination city",
    ],
  },
  {
    id: "student-counselling",
    title: "1-on-1 Career & Student Counselling",
    slug: "student-counselling",
    shortDesc: "Honest, ethical, and tailored guidance to unlock your international potential.",
    fullDesc:
      "Whether you are dealing with study gaps, career transitions, backlogs, or budget constraints, our counseling sessions provide clarity, realistic pathways, and step-by-step action plans without false promises.",
    icon: "Users",
    highlights: [
      "Objective, ethical counseling without sales bias",
      "Study gap justification and career narrative building",
      "Options for spouse and dependent visa pathways",
      "Continuous support through every semester milestone",
    ],
    stages: ["Initial Discovery", "Gap Analysis", "Path Mapping", "Action Plan"],
    deliverables: [
      "Personalized study-abroad roadmap",
      "Target timeline with critical deadlines",
      "Direct line to senior advisors and Al-Amin's team",
    ],
  },
];

export const STUDY_DESTINATIONS = [
  {
    slug: "uk",
    country: "United Kingdom",
    code: "GB",
    heroTitle: "Study in the United Kingdom",
    flag: "🇬🇧",
    highlights: [
      "1-Year Master's & 3-Year Bachelor's degrees",
      "2-Year Post-Study Work Visa (Graduate Route)",
      "No IELTS options available with high English MOI scores",
      "World-renowned Russell Group and top modern universities",
    ],
    tuitionRange: "£12,000 – £26,000 / year",
    livingCost: "£9,207 – £12,006 / year (inside/outside London)",
    intakes: ["September / October (Major)", "January / February (Secondary)", "May / June (Select)"],
    topCities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Coventry"],
    visaType: "Student Visa (formerly Tier 4)",
  },
  {
    slug: "usa",
    country: "United States",
    code: "US",
    heroTitle: "Study in the United States",
    flag: "🇺🇸",
    highlights: [
      "World-leading STEM programs with up to 3 years OPT",
      "Thousands of accredited universities and liberal arts colleges",
      "Generous merit scholarships and assistantships (TA/RA)",
      "Innovative research ecosystem and global industry ties",
    ],
    tuitionRange: "$15,000 – $45,000 / year",
    livingCost: "$10,000 – $18,000 / year",
    intakes: ["Fall / August (Major)", "Spring / January", "Summer / May"],
    topCities: ["New York", "Boston", "Chicago", "San Francisco", "Dallas", "Atlanta"],
    visaType: "F-1 Student Visa",
  },
  {
    slug: "canada",
    country: "Canada",
    code: "CA",
    heroTitle: "Study in Canada",
    flag: "🇨🇦",
    highlights: [
      "Post-Graduation Work Permit (PGWP) up to 3 years",
      "Clear permanent residency pathways (Express Entry / PNP)",
      "Affordable high-quality education in global top 100 universities",
      "Safe, multicultural, and welcoming society",
    ],
    tuitionRange: "CAD $16,000 – $38,000 / year",
    livingCost: "CAD $20,635 / year (GIC proof)",
    intakes: ["September (Fall)", "January (Winter)", "May (Spring/Summer)"],
    topCities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa"],
    visaType: "Study Permit (SDS & Non-SDS)",
  },
  {
    slug: "australia",
    country: "Australia",
    code: "AU",
    heroTitle: "Study in Australia",
    flag: "🇦🇺",
    highlights: [
      "Group of Eight (Go8) world-ranked research institutions",
      "Generous Temporary Graduate Visa (Subclass 485)",
      "Regional area bonus post-study work visa incentives",
      "High standard of living and strong part-time work wages",
    ],
    tuitionRange: "AUD $22,000 – $44,000 / year",
    livingCost: "AUD $24,505 / year",
    intakes: ["February / March (Semester 1)", "July / August (Semester 2)", "November (Trimester 3)"],
    topCities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    visaType: "Student Visa (Subclass 500)",
  },
  {
    slug: "ireland",
    country: "Ireland",
    code: "IE",
    heroTitle: "Study in Ireland",
    flag: "🇮🇪",
    highlights: [
      "European Silicon Valley with European HQs of Google, Apple, Meta",
      "2-Year Stay Back visa for Master's graduates",
      "English-speaking country in the European Union",
      "Renowned for Technology, Pharma, Finance, and Data Science",
    ],
    tuitionRange: "€10,000 – €24,000 / year",
    livingCost: "€10,000 – €14,000 / year",
    intakes: ["September (Autumn)", "January (Spring - select)"],
    topCities: ["Dublin", "Cork", "Galway", "Limerick"],
    visaType: "Stamp 2 Student Visa",
  },
  {
    slug: "new-zealand",
    country: "New Zealand",
    code: "NZ",
    heroTitle: "Study in New Zealand",
    flag: "🇳🇿",
    highlights: [
      "All 8 state universities ranked in global top 3%",
      "Post-study work rights up to 3 years",
      "High quality of life, peaceful and safe environment",
      "Hands-on practical learning and research excellence",
    ],
    tuitionRange: "NZD $22,000 – $36,000 / year",
    livingCost: "NZD $20,000 / year",
    intakes: ["February (Semester 1)", "July (Semester 2)"],
    topCities: ["Auckland", "Wellington", "Christchurch", "Dunedin"],
    visaType: "Fee Paying Student Visa",
  },
  {
    slug: "europe",
    country: "Continental Europe (Germany, Sweden, Finland, France)",
    code: "EU",
    heroTitle: "Study in Europe",
    flag: "🇪🇺",
    highlights: [
      "Low or zero tuition fees in German public universities",
      "English-taught degree programs across Schengen member states",
      "Opportunity to travel freely across 29 Schengen countries",
      "Strong industrial and technological engineering focus",
    ],
    tuitionRange: "€0 – €16,000 / year",
    livingCost: "€9,000 – €14,000 / year (Blocked account required in Germany)",
    intakes: ["September / October (Winter)", "March / April (Summer)"],
    topCities: ["Berlin", "Munich", "Stockholm", "Helsinki", "Paris", "Amsterdam"],
    visaType: "National Long-Stay Visa (Type D)",
  },
];

export const ALO_EDUCATION_INFO = {
  name: "ALO Education",
  website: "https://aloeducation.com",
  portalUrl: "https://aloeducation.com/apply",
  email: "counseling@aloeducation.com",
  phone: "+880 1716-609554",
  tagline: "Empowering Global Higher Education Pathways with Transparency & Integrity",
  description:
    "ALO Education is a premier higher education advisory organization guiding students through university admissions, visa compliance, scholarship acquisition, and pre-departure briefings across top global destinations.",
};

export const ADMISSION_WORKFLOW_STAGES = [
  {
    step: 1,
    title: "Initial Profile Assessment",
    description: "Holistic evaluation of academic transcripts, English proficiency (IELTS/PTE/TOEFL), career trajectory, and financial capability.",
    deliverables: "Eligibility audit, budget framework, and destination compatibility review.",
  },
  {
    step: 2,
    title: "University & Course Selection",
    description: "Curating a balanced shortlist of Reach, Match, and Safety institutions tailored to student goals and upcoming intakes.",
    deliverables: "Detailed comparison matrix with tuition fees, entry benchmarks, and deadlines.",
  },
  {
    step: 3,
    title: "SOP & Document Review",
    description: "Rigorous editorial review of Statement of Purpose, Academic CV, Reference Letters, and portfolio materials.",
    deliverables: "Polished, plagiarism-free application documentation ready for submission.",
  },
  {
    step: 4,
    title: "Application Submission",
    description: "Direct submission through official university partner portals and centralized systems with application fee monitoring.",
    deliverables: "Official submission confirmations and tracking portal access.",
  },
  {
    step: 5,
    title: "Offer & Scholarship Negotiation",
    description: "Tracking conditional and unconditional offers, negotiating merit scholarships, and CAS/I-20/CoE issuance support.",
    deliverables: "Scholarship award confirmations and unconditional acceptance processing.",
  },
  {
    step: 6,
    title: "Visa File Preparation & Mock Interview",
    description: "Comprehensive financial audit, source of funds documentation, biometric booking, and credibility mock interviews.",
    deliverables: "Complete visa dossier and personalized interview rehearsal.",
  },
  {
    step: 7,
    title: "Pre-Departure & Enrolment Support",
    description: "Guidance on student accommodation, tuition fee cross-border transfer, international travel, and university registration.",
    deliverables: "Pre-departure checklist, flight guidance, and alumni community network connection.",
  },
];

