import type { SponsorAccess } from "./schemas";

/**
 * Free email providers. Listing one of these under `domains:` would let anyone with that kind of
 * account in, so the content check rejects them; individual people go under `emails:` instead.
 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "yahoo.com",
  "ymail.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "hey.com",
  "tamu.edu",
]);

export function isFreeEmailDomain(domain: string): boolean {
  return FREE_EMAIL_DOMAINS.has(domain.trim().toLowerCase());
}

const domainOf = (email: string) => email.slice(email.lastIndexOf("@") + 1);

/**
 * The allowlist entry that lets this (already verified) email in, if any. A domain also covers its
 * subdomains, so `cat.com` lets in `someone@us.cat.com`. Entries past their `until` date don't count.
 */
export function findSponsorAccess(email: string, entries: SponsorAccess[], todayIso: string): SponsorAccess | undefined {
  const address = email.trim().toLowerCase();
  const domain = domainOf(address);
  return entries.find((entry) => {
    if (entry.until && entry.until < todayIso) return false;
    if (entry.emails.includes(address)) return true;
    if (isFreeEmailDomain(domain)) return false;
    return entry.domains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
  });
}

// Personal Microsoft accounts (Outlook.com, Hotmail, or a Microsoft account made with any email) all sign in
// through this one tenant, and Microsoft verifies their email address.
const MICROSOFT_PERSONAL_TENANT = "9188040d-6c67-4c5b-b112-36a304b66dad";

const isTrue = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

/**
 * The sign-in's email address, but only if the provider vouches that the person really owns it.
 *
 * - Google: `email_verified` must be true.
 * - Microsoft work/school accounts: an organization can type any address into a user's email field, so
 *   the email claim alone proves nothing. Microsoft's `xms_edov` claim ("email domain owner verified")
 *   is true only when that organization has proven it owns the domain. It has to be switched on in the
 *   app registration (Token configuration → Add optional claim → ID → xms_edov); without it, work
 *   accounts are refused rather than trusted.
 * - Microsoft personal accounts: Microsoft verified the address when the account was made.
 */
export function verifiedEmailFrom(provider: string | undefined, profile: Record<string, unknown> | undefined): string | null {
  const raw = profile?.email;
  if (typeof raw !== "string" || !raw.includes("@")) return null;
  const email = raw.trim().toLowerCase();
  if (provider === "google") return isTrue(profile?.email_verified) ? email : null;
  if (provider === "microsoft-entra-id") {
    if (profile?.tid === MICROSOFT_PERSONAL_TENANT) return email;
    return isTrue(profile?.xms_edov) ? email : null;
  }
  return null;
}
