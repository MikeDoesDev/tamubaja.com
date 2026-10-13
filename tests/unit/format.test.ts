import { describe, expect, it } from "vitest";
import { initials, newestFirst, ordinal } from "@/lib/format";

describe("ordinal", () => {
  it.each([
    [1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [11, "11th"], [12, "12th"],
    [13, "13th"], [18, "18th"], [21, "21st"], [22, "22nd"], [33, "33rd"], [52, "52nd"],
    [101, "101st"], [111, "111th"],
  ])("%i → %s", (n, expected) => {
    expect(ordinal(n)).toBe(expected);
  });
});

describe("newestFirst", () => {
  it("sorts seasons by season label, newest first, without mutating", () => {
    const input = [{ season: "2017–18" }, { season: "2024–25" }, { season: "2019–20" }];
    expect(newestFirst(input).map((s) => s.season)).toEqual(["2024–25", "2019–20", "2017–18"]);
    expect(input[0].season).toBe("2017–18");
  });
});

describe("initials", () => {
  it("uses the first letters of the first two words", () => {
    expect(initials("Jordan Smith")).toBe("JS");
    expect(initials("ana maria lopez")).toBe("AM");
    expect(initials("Cher")).toBe("C");
  });
  it("skips a nickname in parentheses", () => {
    expect(initials("Victor (Alex) Lugo")).toBe("VL");
  });
});
