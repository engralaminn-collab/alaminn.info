import { describe, expect, it } from "vitest";
import { classifyIntent, classifyIntentKeyword } from "@/lib/whatsapp/intents";

describe("deterministic WhatsApp/web assistant intent classification", () => {
  it("prefers an explicit destination question over a generic study-level keyword", () => {
    expect(classifyIntentKeyword("Which countries can I study in for a masters degree?")).toBe("STUDY_DESTINATION");
    expect(classifyIntentKeyword("What is the best country for my MBA?")).toBe("STUDY_DESTINATION");
  });

  it("retains specific university and course searches", () => {
    expect(classifyIntentKeyword("Find universities in the UK")).toBe("UNIVERSITY_SEARCH");
    expect(classifyIntentKeyword("Show MSc computer science courses")).toBe("COURSE_SEARCH");
  });

  it("returns an explicit deterministic fallback for ambiguous text", () => {
    expect(classifyIntent("Hello there")).toEqual({ intent: "OTHER", method: "fallback", confidence: 0.3 });
  });
});
