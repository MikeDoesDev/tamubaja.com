import { describe, expect, it } from "vitest";
import { buildCarYears } from "@/lib/cars";

describe("buildCarYears", () => {
  it("joins garage cars to seasons, keeps unraced seasons, newest first", () => {
    const years = buildCarYears(
      [
        { season: "2023–24", event: "Baja SAE Williamsport", location: "PA", overall: 18, highlights: ["4th Design"], story: [], specs: [], leads: [] },
        { season: "2022–23", event: "Baja SAE Oregon", location: "OR", overall: 44, highlights: [], story: [], specs: [], leads: [] },
      ],
      [
        { number: "51", season: "2025–26", photo: "/a.jpg", description: "x", gallery: [] },
        { number: "56", season: "2023–24", photo: "/b.jpg", description: "y", gallery: [] },
      ],
    );
    expect(years.map((y) => [y.slug, y.number, y.overall])).toEqual([
      ["2025-26", "51", undefined],
      ["2023-24", "56", 18],
      ["2022-23", undefined, 44],
    ]);
  });
});
