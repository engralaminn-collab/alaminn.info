import type { Metadata } from "next";
import { buildHigherStudyMetadata } from "@/lib/higher-study/seo";
import { StudyPlanner } from "./planner-client";

export const metadata: Metadata = buildHigherStudyMetadata({
  title: "Private Study Abroad Planner",
  description: "Build a private, browser-saved study-abroad checklist and budget scenario. No admission or visa guarantees; verify requirements with official sources.",
  path: "/higher-study/planner",
  keywords: ["study abroad planner", "application checklist", "study budget planner", "higher study roadmap"],
});

export default function StudyPlannerPage() {
  return <StudyPlanner />;
}
