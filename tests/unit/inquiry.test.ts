import { describe, expect, it } from "vitest";
import {
  EMPTY_INQUIRY,
  buildMailto,
  buildPayload,
  interestFromQuery,
  validateInquiry,
  type InquiryFields,
} from "@/lib/inquiry";

const filled: InquiryFields = {
  name: " Jordan Smith ",
  company: "Acme Gear",
  email: "jordan@acme.com",
  interest: "gold",
  message: "Hello",
  botcheck: "",
};

describe("validateInquiry", () => {
  it("flags every required field when empty", () => {
    expect(validateInquiry(EMPTY_INQUIRY)).toEqual({
      name: "Enter your name.",
      company: "Enter your company or organization.",
      email: "Enter a valid email address.",
      interest: "Choose what you're interested in.",
    });
  });

  it("accepts a complete inquiry (message optional)", () => {
    expect(validateInquiry({ ...filled, message: "" })).toEqual({});
  });

  it("rejects a malformed email", () => {
    expect(validateInquiry({ ...filled, email: "jordan@acme" })).toEqual({
      email: "Enter a valid email address.",
    });
  });
});

describe("interestFromQuery", () => {
  it("reads a known interest id", () => {
    expect(interestFromQuery(new URLSearchParams("interest=gold"))).toBe("gold");
    expect(interestFromQuery(new URLSearchParams("interest=recruiting"))).toBe("recruiting");
  });

  it("ignores unknown or missing values", () => {
    expect(interestFromQuery(new URLSearchParams("interest=diamond"))).toBe("");
    expect(interestFromQuery(new URLSearchParams(""))).toBe("");
  });
});

describe("buildPayload", () => {
  it("builds a trimmed Web3Forms payload with a descriptive subject", () => {
    expect(buildPayload(filled, "key-123")).toEqual({
      access_key: "key-123",
      subject: "Baja sponsor inquiry — Acme Gear (Gold sponsorship)",
      from_name: "tamubaja.com",
      name: "Jordan Smith",
      email: "jordan@acme.com",
      company: "Acme Gear",
      interest: "Gold sponsorship",
      message: "Hello",
      botcheck: "",
    });
  });
});

describe("buildMailto", () => {
  it("prefills subject and body, URL-encoded", () => {
    const href = buildMailto("baja.sae.tamu@gmail.com", filled);
    expect(href.startsWith("mailto:baja.sae.tamu@gmail.com?subject=")).toBe(true);
    const params = new URLSearchParams(href.split("?")[1]);
    expect(params.get("subject")).toBe("Sponsorship inquiry — Acme Gear");
    expect(params.get("body")).toContain("Interest: Gold sponsorship");
  });
});
