/**
 * Turns the rows of the private team sheet into team members. Pure (no network), so it can be tested.
 *
 * The sheet's first row is headers. Columns are found by name, in any order, and extra columns are
 * ignored, so the Google Form's response sheet works as-is. Recognized headers (case doesn't matter):
 *
 *   Name                       required
 *   Email / TAMU email         the member's email
 *   Sign-in email              optional second address they sign in with (for example a personal Gmail)
 *   Major
 *   Class year / Grad year     4-digit year
 *   Subteam
 *   LinkedIn                   full profile URL
 *   Share with sponsors        Yes / No. Only "Yes" rows appear in the sponsor portal.
 *   Headshot                   Google Drive link to the photo
 *   Resume                     Google Drive link to the PDF
 *
 * Using exactly these header names is safest. Otherwise a header counts if it contains the words above,
 * so "What's your LinkedIn URL?" matches LinkedIn.
 */

export interface RosterMember {
  id: string;
  name: string;
  emails: string[];
  major?: string;
  classYear?: string;
  subteam?: string;
  linkedin?: string;
  share: boolean;
  headshotFileId?: string;
  resumeFileId?: string;
}

type Column = "name" | "email" | "signInEmail" | "major" | "classYear" | "subteam" | "linkedin" | "share" | "headshot" | "resume";

// Checked in order; the first column whose header matches wins, and each column is used once.
const MATCHERS: [Column, RegExp][] = [
  ["signInEmail", /(sign[\s-]?in|login|log[\s-]?in|personal).*e-?mail|e-?mail.*(sign[\s-]?in|login)/],
  ["email", /e-?mail/],
  ["share", /share|sponsor|opt[\s-]?in|consent/],
  ["headshot", /headshot|photo|picture/],
  ["resume", /resume|résumé|cv\b/],
  ["linkedin", /linked\s?in/],
  ["classYear", /class|grad|year/],
  ["major", /major/],
  ["subteam", /sub-?team|team/],
  ["name", /name/],
];

// Exact header names (after lowercasing) win over the looser patterns below.
const EXACT: Record<string, Column> = {
  name: "name",
  "full name": "name",
  email: "email",
  "email address": "email",
  "tamu email": "email",
  "sign-in email": "signInEmail",
  "sign in email": "signInEmail",
  major: "major",
  "class year": "classYear",
  "grad year": "classYear",
  subteam: "subteam",
  linkedin: "linkedin",
  "share with sponsors": "share",
  headshot: "headshot",
  resume: "resume",
};

function mapHeaders(header: string[]): Partial<Record<Column, number>> {
  const map: Partial<Record<Column, number>> = {};
  const used = new Set<number>();
  header.forEach((cell, index) => {
    const column = EXACT[cell.trim().toLowerCase()];
    if (column && map[column] === undefined) {
      map[column] = index;
      used.add(index);
    }
  });
  for (const [column, pattern] of MATCHERS) {
    if (map[column] !== undefined) continue;
    const index = header.findIndex((cell, i) => !used.has(i) && pattern.test(cell.trim().toLowerCase()));
    if (index >= 0) {
      map[column] = index;
      used.add(index);
    }
  }
  return map;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The file ID out of any Google Drive link (open?id=, /file/d/<id>/, uc?id=), or a bare ID. */
export function driveFileId(value: string | undefined): string | undefined {
  const text = value?.trim();
  if (!text) return undefined;
  // A Form upload column can hold several links separated by commas; use the first.
  const first = text.split(/[,\s]+/)[0];
  const match = /[?&]id=([\w-]{20,})/.exec(first) ?? /\/d\/([\w-]{20,})/.exec(first);
  if (match) return match[1];
  return /^[\w-]{20,}$/.test(first) ? first : undefined;
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");

const isYes = (value: string | undefined) => /^\s*(y|yes|true|1|i agree|agree)\b/i.test(value ?? "");

export function parseRoster(rows: string[][]): RosterMember[] {
  const [header, ...body] = rows;
  if (!header) return [];
  const col = mapHeaders(header);
  if (col.name === undefined) return [];
  const cell = (row: string[], column: Column) => {
    const index = col[column];
    const value = index === undefined ? undefined : row[index]?.trim();
    return value ? value : undefined;
  };

  // A later form response from the same person replaces their earlier one.
  const byKey = new Map<string, Omit<RosterMember, "id">>();
  for (const row of body) {
    const name = cell(row, "name");
    if (!name) continue;
    const emails = [cell(row, "email"), cell(row, "signInEmail")]
      .filter((e): e is string => Boolean(e && EMAIL.test(e)))
      .map((e) => e.toLowerCase());
    const linkedin = cell(row, "linkedin");
    const classYear = cell(row, "classYear")?.match(/\d{4}/)?.[0];
    byKey.set(emails[0] ?? name.toLowerCase(), {
      name,
      emails: [...new Set(emails)],
      major: cell(row, "major"),
      classYear,
      subteam: cell(row, "subteam"),
      linkedin: linkedin && /^https?:\/\/([\w-]+\.)?linkedin\.com\//i.test(linkedin) ? linkedin : undefined,
      share: isYes(cell(row, "share")),
      headshotFileId: driveFileId(cell(row, "headshot")),
      resumeFileId: driveFileId(cell(row, "resume")),
    });
  }

  const seen = new Map<string, number>();
  return [...byKey.values()].map((member) => {
    const base = slug(member.name) || "member";
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return { id: count > 1 ? `${base}-${count}` : base, ...member };
  });
}
