import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const readSource = (path: string) => readFileSync(path, "utf8");

const homepage = readSource("src/app/page.tsx");
const higherStudyLayout = readSource("src/app/higher-study/layout.tsx");
const higherStudyShell = readSource(
  "src/components/higher-study/higher-study-shell.tsx",
);
const higherStudyNavbar = readSource(
  "src/components/higher-study/higher-study-navbar.tsx",
);

describe("homepage structure regression", () => {
  it("renders the personal-brand hero exactly once", () => {
    expect(homepage.match(/<Hero\s*\/>/g)).toHaveLength(1);
  });

  it("does not prepend the removed education landing experience", () => {
    const removedComponents = [
      "EditorialHero",
      "DestinationExperience",
      "FindYourPath",
      "ServicesStory",
      "JourneyTimeline",
      "StatisticsStory",
      "AIAdvisor",
    ];

    for (const component of removedComponents) {
      expect(homepage).not.toContain(component);
    }

    expect(homepage).not.toContain("db.higherStudyUniversity.count()");
    expect(homepage).not.toContain("db.higherStudyCountry.findMany(");
  });
});

describe("Higher Study navigation regression", () => {
  it("uses HigherStudyShell without importing the main website navbar", () => {
    expect(higherStudyLayout).toContain("<HigherStudyShell>");
    expect(higherStudyShell.match(/<HigherStudyNavbar\s*\/>/g)).toHaveLength(1);
    expect(higherStudyShell).not.toContain("@/components/site/navbar");
    expect(higherStudyShell).not.toMatch(/<Navbar\s*\/>/);
  });

  it("contains one intended desktop More dropdown", () => {
    expect(higherStudyNavbar.match(/<DropdownMenuTrigger/g)).toHaveLength(1);
    expect(higherStudyNavbar).toContain("More");
    expect(higherStudyNavbar).toContain("MORE_HS_NAV");
  });

  it("keeps all required navigation destinations and no top-16 sticky bar", () => {
    const requiredLinks = [
      "/higher-study/global-universities",
      "/higher-study/course-finder",
      "/higher-study/scholarships",
      "/higher-study/destinations",
      "/higher-study/phd-research",
      "/higher-study/supervisors",
      "/higher-study/study-resources",
      "/higher-study/compare",
      "/higher-study/apply",
    ];

    for (const href of requiredLinks) {
      expect(higherStudyNavbar).toContain(href);
    }

    expect(higherStudyNavbar).not.toMatch(/sticky\s+top-16|top-16\s+sticky/);
  });
});
