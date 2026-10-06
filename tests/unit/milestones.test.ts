import { describe, expect, it } from "vitest";
import { formatMilestoneDate, withStatus } from "@/lib/milestones";

const milestones = [
  { name: "Design freeze", date: "2026-11-22" },
  { name: "Initial design review 1", date: "2026-08-09" },
  { name: "Rolling chassis", date: "2027-02-14" },
  { name: "Competition", date: "2027-05-20" },
];

describe("withStatus", () => {
  it("sorts by date; past is done, first future is next, the rest upcoming", () => {
    const result = withStatus(milestones, new Date("2026-10-05T12:00:00Z"));
    expect(result.map((m) => [m.name, m.status])).toEqual([
      ["Initial design review 1", "done"],
      ["Design freeze", "next"],
      ["Rolling chassis", "upcoming"],
      ["Competition", "upcoming"],
    ]);
  });

  it("treats a milestone dated today as next", () => {
    const result = withStatus(milestones, new Date("2026-11-22T08:00:00Z"));
    expect(result.find((m) => m.name === "Design freeze")?.status).toBe("next");
  });

  it("marks everything done after the season", () => {
    const result = withStatus(milestones, new Date("2027-06-01T00:00:00Z"));
    expect(result.every((m) => m.status === "done")).toBe(true);
  });

  it("keeps extra fields like tentative", () => {
    const result = withStatus(
      [{ name: "SAE Rollout", date: "2027-04-18", tentative: true }],
      new Date("2026-10-05T00:00:00Z"),
    );
    expect(result[0]).toEqual({ name: "SAE Rollout", date: "2027-04-18", tentative: true, status: "next" });
  });
});

describe("formatMilestoneDate", () => {
  it("formats ISO dates as short US dates", () => {
    expect(formatMilestoneDate("2026-11-22")).toBe("Nov 22, 2026");
  });
});
