import { describe, expect, it } from "vitest";
import { ContentError, parseContent } from "@/lib/content";
import { carSchema, faqSchema, seasonsSchema, sponsorsSchema, teamSchema, tiersSchema } from "@/lib/schemas";

const validSponsor = `- name: GM
  tier: gold
  logo: /sponsors/gm.png
  url: https://www.gm.com
  show: true
`;

describe("parseContent", () => {
  it("returns typed data for valid YAML", () => {
    const result = parseContent("sponsors.yaml", validSponsor, sponsorsSchema);
    expect(result[0]).toEqual({
      name: "GM",
      tier: "gold",
      logo: "/sponsors/gm.png",
      url: "https://www.gm.com",
      show: true,
    });
  });

  it("explains a misspelled tier with the item number and field", () => {
    const yaml = validSponsor.replace("tier: gold", "tier: gould");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /Problem in content\/sponsors\.yaml:[\s\S]*item 1 → tier/,
    );
  });

  it("explains a missing field", () => {
    const yaml = validSponsor.replace("  logo: /sponsors/gm.png\n", "");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(/item 1 → logo/);
  });

  it("explains a web address without https://", () => {
    const yaml = validSponsor.replace("https://www.gm.com", "www.gm.com");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /must be a full web address starting with https:\/\//,
    );
  });

  it("explains broken YAML formatting", () => {
    const yaml = "- name: GM\n  tier: [gold\n";
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /YAML formatting is broken/,
    );
  });

  it("throws a ContentError so callers can tell content problems apart", () => {
    try {
      parseContent("sponsors.yaml", "- name: GM\n", sponsorsSchema);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
    }
  });

  it("accepts unquoted YAML dates in milestones", () => {
    const yaml = `season: 2025–26
name: The 2025–26 car
photo: /images/car-current.jpg
summary: A car.
specs:
  - label: Dry weight
    value: 354.4 lb
subsystems:
  - name: Chassis
    description: Steel tubes.
buildSeason: 2026–27
milestones:
  - name: Design freeze
    date: 2026-11-22
`;
    const car = parseContent("car.yaml", yaml, carSchema);
    expect(car.milestones[0].date).toBe("2026-11-22");
  });

  it("requires tiers in order from cheapest to most expensive", () => {
    const tier = (id: string) => `  - id: ${id}
    name: ${id}
    priceLabel: $1
    badgeColor: "#9F6A3E"
    benefits: [Thanks]
`;
    const yaml = `tiers:
${tier("gold")}${tier("bronze")}${tier("silver")}${tier("platinum")}inKindCategories:
  - name: Tools
    examples: Wrenches
`;
    expect(() => parseContent("tiers.yaml", yaml, tiersSchema)).toThrowError(
      /bronze, silver, gold, platinum/,
    );
  });
});

describe("forgiving edits a non-coder is likely to make", () => {
  it("accepts numbers where text is expected", () => {
    const yaml = `- season: 2024–25
  event: Baja SAE Maryland
  location: Maryland
  overall: 31
  highlights: [3rd Acceleration]
`;
    const seasons = parseContent("seasons.yaml", yaml, seasonsSchema);
    expect(seasons[0].season).toBe("2024–25");
    const stats = parseContent("team.yaml", `story: [Hi]\nleads:\n  - name: A B\n    role: PM\n    major: ME\n    classYear: 2027\nsubteams:\n  - name: Chassis\n    description: Frames\n`, teamSchema);
    expect(stats.leads[0].classYear).toBe("2027");
  });

  it("accepts yes/no for true/false", () => {
    const sponsors = parseContent("sponsors.yaml", validSponsor.replace("show: true", "show: yes"), sponsorsSchema);
    expect(sponsors[0].show).toBe(true);
  });

  it("treats an empty list as no items", () => {
    const team = parseContent("team.yaml", "story: [Hi]\nleads:\nsubteams:\n  - name: Chassis\n    description: Frames\n", teamSchema);
    expect(team.leads).toEqual([]);
  });

  it("explains an empty file instead of calling it broken formatting", () => {
    expect(() => parseContent("faq.yaml", "# only a comment\n", faqSchema)).toThrowError(/content\/faq\.yaml is empty/);
  });

  it("adds a plain-English hint for a wrong true/false value", () => {
    const yaml = validSponsor.replace("show: true", "show: maybe");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(/use true or false/);
  });
});
