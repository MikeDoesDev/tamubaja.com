import { describe, expect, it } from "vitest";
import { buildSeasonLog } from "@/lib/seasonLog";

const milestones = [
  { name: "Design review", date: "2026-10-25", phase: "Design" },
  { name: "Rolling chassis", date: "2027-02-14", phase: "Build" },
];
const events = [
  { title: "Design review", date: "2026-10-25", description: "Merged", photo: "/a.jpg", morePhotos: ["/b.jpg"], link: "https://x.com/p" },
  { title: "School visit", date: "2026-10-27", description: "Standalone", morePhotos: [] },
];

describe("buildSeasonLog", () => {
  const log = buildSeasonLog(milestones, events, new Date("2026-10-30T17:00:00Z"));

  it("folds a matching event into its milestone", () => {
    expect(log.filter((e) => e.name === "Design review")).toHaveLength(1);
    expect(log[0]).toMatchObject({ kind: "milestone", status: "done", photos: ["/a.jpg", "/b.jpg"], link: "https://x.com/p" });
  });

  it("puts other events in the phase they happened during, in date order", () => {
    expect(log.map((e) => e.name)).toEqual(["Design review", "School visit", "Rolling chassis"]);
    expect(log[1]).toMatchObject({ kind: "event", phase: "Design", status: "done" });
    expect(log[2].status).toBe("next");
  });
});
