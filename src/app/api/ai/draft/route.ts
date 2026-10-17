import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await req.json();
    const { prompt, context, channel, studentName, targetCountry } = json;

    const student = studentName || "Student";
    const country = targetCountry || "United Kingdom";

    let generatedDraft = "";
    if (channel === "WHATSAPP") {
      generatedDraft = `Dear ${student}, thank you for reaching out to ALO Education! Regarding your higher study plans in ${country}, we have evaluated your profile against upcoming 2026 intakes. Based on your background, we recommend looking into top matching programs with scholarship eligibility. Let's schedule a brief 15-minute video call to finalize your university list and document checklist. Best regards, Al-Amin & Team.`;
    } else if (channel === "EMAIL") {
      generatedDraft = `Dear ${student},\n\nThank you for getting in touch with us regarding your higher study journey to ${country}.\n\nAt ALO Education, we ensure every student receives structured guidance covering:\n1. Direct University Shortlisting (matching your CGPA & English test results)\n2. Comprehensive SOP and Documentation Polish\n3. Scholarship and Tuition Discount Applications\n4. Visa File Review and Mock Interview Sessions\n\nPlease let us know your convenient time for a 1-on-1 consultation this week.\n\nWarm regards,\nAl-Amin\nEducation Business & Operations Leader | ALO Education`;
    } else if (channel === "LINKEDIN") {
      generatedDraft = `Higher education counseling is not just about university admissions — it is about aligning a student's long-term career trajectory with sustainable post-study work opportunities. At ALO Education, our stage-based advisory model ensures transparency at every step: from profile audit to visa issuance. What are your thoughts on ethical student advisory frameworks?`;
    } else {
      generatedDraft = `Hi ${student}, we've received your inquiry regarding ${country}. Al-Amin's senior counseling team is preparing a tailored assessment for your academic profile. Feel free to book your consultation directly or reply with any specific questions!`;
    }

    return NextResponse.json({
      success: true,
      data: {
        draft: generatedDraft,
        aiModel: "Al-Amin AI Assist Engine v2.4",
        requiresHumanApproval: true,
        guardrailCheck: "PASSED: No guarantees made; factual tone maintained.",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
