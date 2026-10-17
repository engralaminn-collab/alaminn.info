import { Metadata } from "next";
import CareerPage from "@/app/career/page";

export const metadata: Metadata = {
  title: "Professional Experience & Career Timeline | Al-Amin",
  description:
    "Verified professional career history, employment tenure, and operational leadership of Al-Amin.",
};

export default function ExperiencePage() {
  return <CareerPage />;
}
