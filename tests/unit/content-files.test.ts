import { describe, expect, it } from "vitest";
import {
  getCar,
  getEvents,
  getFaq,
  getSeasons,
  getSite,
  getSponsors,
  getTeam,
  getTiers,
} from "@/lib/content";

describe("real content files", () => {
  it.each([
    ["site.yaml", getSite],
    ["sponsors.yaml", getSponsors],
    ["tiers.yaml", getTiers],
    ["seasons.yaml", getSeasons],
    ["car.yaml", getCar],
    ["team.yaml", getTeam],
    ["faq.yaml", getFaq],
    ["events.yaml", getEvents],
  ] as const)("%s is valid", (_file, load) => {
    expect(() => load()).not.toThrow();
  });

  it("never lists dollar amounts for individual sponsors", () => {
    for (const sponsor of getSponsors()) {
      expect(JSON.stringify(sponsor)).not.toMatch(/\$\s?\d/);
    }
  });
});
