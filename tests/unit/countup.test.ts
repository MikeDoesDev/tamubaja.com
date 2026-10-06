import { describe, expect, it } from "vitest";
import { easeOutExpo, formatCount, parseCountable } from "@/lib/countup";

describe("parseCountable", () => {
  it("parses plain, plus-suffixed, and dollar values", () => {
    expect(parseCountable("9")).toEqual({ prefix: "", target: 9, suffix: "" });
    expect(parseCountable("100+")).toEqual({ prefix: "", target: 100, suffix: "+" });
    expect(parseCountable("$5,000+")).toEqual({ prefix: "$", target: 5000, suffix: "+" });
  });

  it("returns null for ordinals and text so they render static", () => {
    expect(parseCountable("3rd")).toBeNull();
    expect(parseCountable("18th")).toBeNull();
    expect(parseCountable("Top 25")).toBeNull();
  });
});

describe("formatCount", () => {
  it("rounds and adds separators, prefix, and suffix", () => {
    const c = { prefix: "$", target: 5000, suffix: "+" };
    expect(formatCount(c, 4999.6)).toBe("$5,000+");
    expect(formatCount(c, 0)).toBe("$0+");
  });
});

describe("easeOutExpo", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});
