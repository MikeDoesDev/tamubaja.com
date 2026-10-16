import { describe, expect, it } from "vitest";
import { buildDirectory } from "@/lib/directory";
import type { Team } from "@/lib/schemas";

const team: Team = {
  story: ["x"],
  leads: [{ name: "Rowan Cockrell", role: "Manufacturing Lead", major: "MMET", classYear: "2028" }],
  subteams: [
    { name: "Powertrain", description: "x", leads: [], members: [{ name: "Rowan Cockrell" }, { name: "Ann Zed", major: "MEEN" }] },
    {
      name: "Manufacturing",
      description: "x",
      leads: [{ name: "Rowan Cockrell", role: "Manufacturing Lead" }],
      members: [{ name: "Bo Adams" }],
    },
  ],
};

describe("buildDirectory", () => {
  it("lists each person once, merging subteams and titles, leads first", () => {
    const people = buildDirectory(team);
    expect(people.map((p) => p.name)).toEqual(["Rowan Cockrell", "Bo Adams", "Ann Zed"]);
    expect(people[0]).toMatchObject({ titles: ["Manufacturing Lead"], subteams: ["Powertrain", "Manufacturing"], major: "MMET" });
  });
});
