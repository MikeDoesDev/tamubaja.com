export const INTERESTS = [
  { id: "platinum", label: "Platinum sponsorship" },
  { id: "gold", label: "Gold sponsorship" },
  { id: "silver", label: "Silver sponsorship" },
  { id: "bronze", label: "Bronze sponsorship" },
  { id: "inkind", label: "In-kind donation" },
  { id: "recruiting", label: "Recruiting / resume book" },
  { id: "other", label: "Other" },
] as const;

export type InterestId = (typeof INTERESTS)[number]["id"];

export interface InquiryFields {
  name: string;
  company: string;
  email: string;
  interest: InterestId | "";
  message: string;
  botcheck: string;
}

export const EMPTY_INQUIRY: InquiryFields = {
  name: "",
  company: "",
  email: "",
  interest: "",
  message: "",
  botcheck: "",
};

export type InquiryErrors = Partial<Record<"name" | "company" | "email" | "interest", string>>;

export function interestLabel(id: InterestId | ""): string {
  return INTERESTS.find((interest) => interest.id === id)?.label ?? "";
}

export function interestFromQuery(params: URLSearchParams): InterestId | "" {
  const value = params.get("interest");
  const match = INTERESTS.find((interest) => interest.id === value);
  return match ? match.id : "";
}

export function validateInquiry(fields: InquiryFields): InquiryErrors {
  const errors: InquiryErrors = {};
  if (!fields.name.trim()) errors.name = "Enter your name.";
  if (!fields.company.trim()) errors.company = "Enter your company or organization.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) errors.email = "Enter a valid email address.";
  if (!fields.interest) errors.interest = "Choose what you're interested in.";
  return errors;
}

export function buildPayload(fields: InquiryFields, accessKey: string) {
  const company = fields.company.trim();
  const interest = interestLabel(fields.interest);
  return {
    access_key: accessKey,
    subject: `Baja sponsor inquiry — ${company} (${interest})`,
    from_name: "tamubaja.com",
    name: fields.name.trim(),
    email: fields.email.trim(),
    company,
    interest,
    message: fields.message.trim(),
    botcheck: fields.botcheck,
  };
}

export function buildMailto(to: string, fields: InquiryFields): string {
  const subject = `Sponsorship inquiry — ${fields.company.trim() || "your company"}`;
  const body = [
    `Name: ${fields.name.trim()}`,
    `Company: ${fields.company.trim()}`,
    `Email: ${fields.email.trim()}`,
    `Interest: ${interestLabel(fields.interest)}`,
    "",
    fields.message.trim(),
  ].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
