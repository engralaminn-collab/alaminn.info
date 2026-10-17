/**
 * Verified Career and Professional History for Al-Amin
 *
 * GOVERNANCE RULE:
 * Every career item includes verification status (VERIFIED | NEEDS_REVIEW | DRAFT | ARCHIVED),
 * evidence source, and public visibility flag.
 * Only VERIFIED or explicitly approved content appears publicly.
 */

export type VerificationStatus = "VERIFIED" | "NEEDS_REVIEW" | "DRAFT" | "ARCHIVED";

export type CareerExperience = {
  id: string;
  organization: string;
  organizationUrl?: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
  skills: string[];
  source: string;
  verificationStatus: VerificationStatus;
  visibility: "PUBLIC" | "PRIVATE";
  recognition?: {
    title: string;
    note: string;
    verificationStatus: VerificationStatus;
  }[];
};

export const VERIFIED_CAREER_DATA: CareerExperience[] = [
  {
    id: "exp-tcl-manager",
    organization: "TCL Global",
    organizationUrl: "https://tclglobal.co.uk",
    jobTitle: "Manager, Operations & Sales, Bangladesh",
    startDate: "Sep 2022",
    endDate: "Jan 2023",
    location: "Dhaka, Bangladesh",
    description:
      "Led national operations and sales execution for international student recruitment, university liaison, and branch counseling performance.",
    responsibilities: [
      "Branch team management and operational coordination across departments",
      "Sales operations supervision and counseling workflow standardisation",
      "Lead-to-visa pipeline tracking, compliance, and conversion rate governance",
      "International university partnership liaison and recruitment campaign alignment",
      "Counselor and admissions staff training, development, and KPI evaluations",
      "Daily, weekly, and monthly performance reporting to international headquarters",
      "Partnership performance analysis and market demand forecasting in Bangladesh",
    ],
    achievements: [
      "Streamlined end-to-end student recruitment workflow from inquiry to visa issuance",
      "Enhanced cross-functional reporting transparency between regional and HQ offices",
      "Trained and developed high-performing admissions and counseling teams",
    ],
    skills: [
      "Operations Management",
      "Sales Strategy",
      "University Partnerships",
      "Team Leadership",
      "Lead-to-Visa Governance",
      "Compliance",
      "Performance Analytics",
    ],
    source: "Employment Records & Official Appointment",
    verificationStatus: "VERIFIED",
    visibility: "PUBLIC",
    recognition: [
      {
        title: "Best Sales Performer / Best Seller",
        note: "Reported branch performance recognition during tenure; verified via team and sales records.",
        verificationStatus: "VERIFIED",
      },
      {
        title: "Stand-Out Performer",
        note: "Operational excellence and team execution recognition.",
        verificationStatus: "VERIFIED",
      },
    ],
  },
  {
    id: "exp-tcl-asst-senior",
    organization: "TCL Global",
    organizationUrl: "https://tclglobal.co.uk",
    jobTitle: "Assistant Senior Education Consultant",
    startDate: "Oct 2021",
    endDate: "Sep 2022",
    location: "Dhaka, Bangladesh",
    description:
      "Served as acting team lead, senior advisor, and university admissions coordinator for international higher study applicants.",
    responsibilities: [
      "Team supervision and counseling escalation management",
      "Admissions file verification, academic eligibility assessment, and compliance checks",
      "Student application strategy for UK, USA, Canada, and Australian universities",
      "University partnership engagement and institutional visit coordination",
      "Onboarding, training, and quality monitoring for junior education consultants",
      "Branch performance reporting and student conversion rate optimization",
    ],
    achievements: [
      "Maintained top-tier student application success and visa compliance rates",
      "Mentored junior education counselors in international admissions requirements",
      "Expanded partner university institutional application volumes",
    ],
    skills: [
      "Education Consulting",
      "University Admissions",
      "Team Leadership",
      "Counselor Mentorship",
      "Visa Advisory",
      "Academic Evaluation",
    ],
    source: "Employment Records & Promotion Records",
    verificationStatus: "VERIFIED",
    visibility: "PUBLIC",
  },
  {
    id: "exp-tcl-consultant",
    organization: "TCL Global",
    organizationUrl: "https://tclglobal.co.uk",
    jobTitle: "Educational Consultant",
    startDate: "Oct 2019",
    endDate: "Nov 2021",
    location: "Dhaka, Bangladesh",
    description:
      "Provided 1-on-1 higher education guidance, university course selection, application processing, and international visa support for prospective students.",
    responsibilities: [
      "Direct student counseling for undergraduate, postgraduate, and foundation programs",
      "Study-abroad destination analysis matching student budget, GPA, and career goals",
      "University and course selection across UK, USA, Australia, and European institutions",
      "Comprehensive student application support, SOP guidance, and document verification",
      "Liaison with international university admissions officers and regional representatives",
      "Pre-departure briefings, mock visa interview preparation, and financial documentation checks",
      "Operational support and file handoffs to international head office teams",
    ],
    achievements: [
      "Guided hundreds of students through successful university admissions and visa approvals",
      "Delivered personalized pre-departure orientations and mock interview coaching",
    ],
    skills: [
      "Student Counseling",
      "Study-Abroad Advisory",
      "Course Matching",
      "SOP & Documentation Review",
      "Visa Guidance",
      "University Liaison",
    ],
    source: "Employment Records",
    verificationStatus: "VERIFIED",
    visibility: "PUBLIC",
  },
  {
    id: "exp-alo-leader",
    organization: "ALO Education & Digital Ecosystems",
    organizationUrl: "https://aloeducation.com",
    jobTitle: "Education Business Strategist & Digital Systems Leader",
    startDate: "Feb 2023",
    endDate: "Present",
    isCurrent: true,
    location: "Dhaka, Bangladesh",
    description:
      "Architecting scalable student advisory pathways, digital CRM automation, study-abroad guidance workflows, and AI-enabled operations.",
    responsibilities: [
      "Designing student guidance pathways connecting personal brand authority with ALO Education support",
      "Overseeing digital transformation, CRM pipelines, and automated follow-up systems",
      "Developing institutional partnership frameworks and international student recruitment strategies",
      "Building AI-assisted communication workflows with human approval checkpoints",
      "Directing executive strategy, operations governance, and student services compliance",
    ],
    achievements: [
      "Built the end-to-end Al-Amin Digital Platform and ALO Education integration bridge",
      "Implemented stage-based CRM pipeline with multi-channel student touchpoints",
      "Pioneered governed AI assistant systems for ethical, verified study-abroad counseling",
    ],
    skills: [
      "Executive Leadership",
      "Education Business Strategy",
      "AI Systems Architecture",
      "CRM Engineering",
      "Student Journey Design",
      "Operations Governance",
    ],
    source: "Direct Venture Leadership & Verified Systems",
    verificationStatus: "VERIFIED",
    visibility: "PUBLIC",
  },
];

export const VERIFIED_ACHIEVEMENTS = [
  {
    id: "ach-sales-leadership",
    title: "Best Sales Performer & Stand-Out Performer Recognition",
    organization: "TCL Global",
    year: "2022 - 2023",
    category: "Executive Performance",
    description:
      "Recognized for top branch performance, sales operations leadership, and student recruitment conversion discipline.",
    verificationStatus: "VERIFIED" as VerificationStatus,
    evidenceNote: "Branch sales records and operational milestones.",
  },
  {
    id: "ach-student-advisory",
    title: "Over 5 Years of International Higher Education Counseling",
    organization: "International Education Sector",
    year: "2019 - Present",
    category: "Student Impact",
    description:
      "Expert study-abroad guidance across UK, USA, Canada, Australia, Ireland, and Europe with focus on ethical counselling and student success.",
    verificationStatus: "VERIFIED" as VerificationStatus,
    evidenceNote: "Continuous professional track record since 2019.",
  },
  {
    id: "ach-systems-architecture",
    title: "Digital Ecosystem & Governed AI Pipeline Architecture",
    organization: "Alaminn.info & ALO Education",
    year: "2023 - Present",
    category: "Digital Innovation",
    description:
      "Designed and deployed enterprise-grade Next.js, Prisma, and AI-assisted workflow engines with strict server-side RBAC and human approval gates.",
    verificationStatus: "VERIFIED" as VerificationStatus,
    evidenceNote: "Production codebase and live system architecture.",
  },
  {
    id: "ach-partnerships",
    title: "Multi-University Partnership Alignment & Liaison",
    organization: "International University Network",
    year: "2020 - Present",
    category: "Institutional Relations",
    description:
      "Structured collaboration, student recruitment drives, and academic intake planning with global university representatives.",
    verificationStatus: "VERIFIED" as VerificationStatus,
    evidenceNote: "University partnership pipeline and recruitment campaigns.",
  },
];
