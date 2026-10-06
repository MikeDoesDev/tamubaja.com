import { describe, expect, it } from "vitest";
import type { Sponsor } from "@/lib/schemas";
import { groupSponsors, visibleSponsors } from "@/lib/sponsors";

const s = (name: string, tier: Sponsor["tier"], show = true): Sponsor => ({
  name,
  tier,
  logo: `/sponsors/${name}.png`,
  url: `https://${name}.com`,
  show,
});

describe("groupSponsors", () => {
  it("groups visible sponsors from platinum to in-kind and drops empty tiers", () => {
    const groups = groupSponsors([s("b", "bronze"), s("p", "platinum"), s("k", "inkind"), s("g", "gold")]);
    expect(groups.map((g) => [g.label, g.sponsors.map((x) => x.name)])).toEqual([
      ["Platinum", ["p"]],
      ["Gold", ["g"]],
      ["Bronze", ["b"]],
      ["In-kind partners", ["k"]],
    ]);
  });

  it("hides sponsors with show: false", () => {
    expect(groupSponsors([s("hidden", "gold", false)])).toEqual([]);
  });

  it("keeps file order within a tier", () => {
    const groups = groupSponsors([s("z", "gold"), s("a", "gold")]);
    expect(groups[0].sponsors.map((x) => x.name)).toEqual(["z", "a"]);
  });
});

describe("visibleSponsors", () => {
  it("lists shown sponsors from platinum to in-kind for the logo strip", () => {
    const list = visibleSponsors([s("k", "inkind"), s("hidden", "gold", false), s("p", "platinum"), s("b", "bronze")]);
    expect(list.map((x) => x.name)).toEqual(["p", "b", "k"]);
  });
});
