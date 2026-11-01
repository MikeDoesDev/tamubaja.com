import { describe, expect, it } from "vitest";
import { parseContent } from "@/lib/content";
import { sponsorAccessSchema } from "@/lib/schemas";
import { findSponsorAccess, isFreeEmailDomain, verifiedEmailFrom } from "@/lib/sponsorAccess";

const entries = parseContent(
  "sponsor-access.yaml",
  `
- company: Caterpillar
  tier: gold
  domains: [cat.com, "@Bray.com"]
- company: Old Sponsor
  tier: bronze
  domains: [old.com]
  until: 2026-01-31
- company: Recruiter
  tier: silver
  emails: [Jane.Doe@gmail.com]
`,
  sponsorAccessSchema,
);

describe("findSponsorAccess", () => {
  it("lets in a company domain and its subdomains, ignoring case", () => {
    expect(findSponsorAccess("Someone@CAT.com", entries, "2026-11-01")?.company).toBe("Caterpillar");
    expect(findSponsorAccess("a@us.cat.com", entries, "2026-11-01")?.company).toBe("Caterpillar");
    expect(findSponsorAccess("a@bray.com", entries, "2026-11-01")?.company).toBe("Caterpillar");
  });

  it("doesn't match look-alike domains", () => {
    expect(findSponsorAccess("a@notcat.com", entries, "2026-11-01")).toBeUndefined();
    expect(findSponsorAccess("a@cat.com.evil.io", entries, "2026-11-01")).toBeUndefined();
  });

  it("drops entries past their until date", () => {
    expect(findSponsorAccess("a@old.com", entries, "2026-01-31")?.company).toBe("Old Sponsor");
    expect(findSponsorAccess("a@old.com", entries, "2026-02-01")).toBeUndefined();
  });

  it("lets in individually listed emails, but not the rest of a free provider", () => {
    expect(findSponsorAccess("jane.doe@gmail.com", entries, "2026-11-01")?.company).toBe("Recruiter");
    expect(findSponsorAccess("someone.else@gmail.com", entries, "2026-11-01")).toBeUndefined();
  });

  it("flags free email providers", () => {
    expect(isFreeEmailDomain("Gmail.com")).toBe(true);
    expect(isFreeEmailDomain("cat.com")).toBe(false);
  });
});

describe("sponsor-access.yaml schema", () => {
  it("rejects in-kind tier and entries with nobody listed", () => {
    expect(() => parseContent("sponsor-access.yaml", "- company: A\n  tier: inkind\n  domains: [a.com]\n", sponsorAccessSchema)).toThrow(/tier/);
    expect(() => parseContent("sponsor-access.yaml", "- company: A\n  tier: gold\n", sponsorAccessSchema)).toThrow(/at least one/);
    expect(() => parseContent("sponsor-access.yaml", "- company: A\n  tier: gold\n  domains: [https://a.com]\n", sponsorAccessSchema)).toThrow(/domain/);
  });
});

describe("verifiedEmailFrom", () => {
  it("trusts Google only when the email is verified", () => {
    expect(verifiedEmailFrom("google", { email: "A@Cat.com", email_verified: true })).toBe("a@cat.com");
    expect(verifiedEmailFrom("google", { email: "a@cat.com", email_verified: false })).toBeNull();
  });

  it("trusts Microsoft work accounts only with xms_edov, and personal accounts as-is", () => {
    expect(verifiedEmailFrom("microsoft-entra-id", { email: "a@cat.com", tid: "some-company-tenant" })).toBeNull();
    expect(verifiedEmailFrom("microsoft-entra-id", { email: "a@cat.com", tid: "some-company-tenant", xms_edov: true })).toBe("a@cat.com");
    expect(verifiedEmailFrom("microsoft-entra-id", { email: "a@cat.com", tid: "9188040d-6c67-4c5b-b112-36a304b66dad" })).toBe("a@cat.com");
  });

  it("refuses missing emails and unknown providers", () => {
    expect(verifiedEmailFrom("google", { email_verified: true })).toBeNull();
    expect(verifiedEmailFrom("github", { email: "a@cat.com", email_verified: true })).toBeNull();
  });
});

describe("team.yaml privacy", () => {
  it("refuses individual headshots and LinkedIns on the public site", async () => {
    const { teamSchema } = await import("@/lib/schemas");
    const yaml = (extra: string) => `story: [Hi]\nleads:\n  - name: A\n    role: PM\n    major: ME\n    classYear: "2027"\n${extra}subteams:\n  - name: Chassis\n    description: Frame\n`;
    expect(() => parseContent("team.yaml", yaml(""), teamSchema)).not.toThrow();
    expect(() => parseContent("team.yaml", yaml("    photo: /images/team/a.jpg\n"), teamSchema)).toThrow(/private team sheet/);
    expect(() => parseContent("team.yaml", yaml("    linkedin: https://linkedin.com/in/a\n"), teamSchema)).toThrow(/private team sheet/);
  });
});
