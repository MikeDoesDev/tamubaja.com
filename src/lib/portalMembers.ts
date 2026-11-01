import "server-only";
import { downloadDriveFile, googleConfigured, readSheet } from "@/lib/google";
import { parseRoster, type RosterMember } from "@/lib/roster";

/**
 * Team members for the private sponsor portal, read from the private team Google Sheet.
 *
 * Nothing about members is stored in this repository (it's public). Until the sheet is connected
 * (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY and TEAM_SHEET_ID in the host's
 * environment variables), three made-up sample profiles are shown so the flow can be tested.
 */
export interface PortalMember {
  id: string;
  name: string;
  major?: string;
  classYear?: string;
  subteam?: string;
  linkedin?: string;
  hasPhoto: boolean;
  hasResume: boolean;
}

const sheetId = process.env.TEAM_SHEET_ID;
const sheetTab = process.env.TEAM_SHEET_TAB || "Roster";
export const rosterConnected = googleConfigured && Boolean(sheetId);
export const PORTAL_IS_PLACEHOLDER = !rosterConnected;

const SAMPLES: RosterMember[] = [
  { id: "sample-jordan-reyes", name: "Jordan Reyes (sample)", emails: [], major: "Mechanical Engineering", classYear: "2027", subteam: "Suspension", linkedin: "https://www.linkedin.com/", share: true, resumeFileId: "sample" },
  { id: "sample-priya-shah", name: "Priya Shah (sample)", emails: [], major: "Industrial Distribution", classYear: "2028", subteam: "Business", linkedin: "https://www.linkedin.com/", share: true, resumeFileId: "sample" },
  { id: "sample-marcus-lee", name: "Marcus Lee (sample)", emails: [], major: "Manufacturing & Mechanical Engineering Technology", classYear: "2027", subteam: "Powertrain", share: true },
];

// Re-read the sheet at most every 5 minutes, so edits show up quickly without hitting Google on every visit.
const TTL = 5 * 60 * 1000;
let cache: { at: number; roster: RosterMember[] } | undefined;

export async function getRoster(): Promise<RosterMember[]> {
  if (!rosterConnected) return SAMPLES;
  if (cache && Date.now() - cache.at < TTL) return cache.roster;
  try {
    const roster = parseRoster(await readSheet(sheetId!, sheetTab));
    cache = { at: Date.now(), roster };
    return roster;
  } catch (error) {
    console.error("[sponsor portal]", error);
    // Keep serving the last good copy if Google hiccups.
    return cache?.roster ?? [];
  }
}

/** The team member signing in with this (verified) email, if they're on the sheet. */
export async function findTeamMember(email: string): Promise<RosterMember | undefined> {
  if (!rosterConnected) return undefined;
  const address = email.toLowerCase();
  return (await getRoster()).find((member) => member.emails.includes(address));
}

/** Members who said yes to sharing with sponsors, A to Z. */
export async function getPortalMembers(): Promise<PortalMember[]> {
  return (await getRoster())
    .filter((member) => member.share)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((member) => ({
      id: member.id,
      name: member.name,
      major: member.major,
      classYear: member.classYear,
      subteam: member.subteam,
      linkedin: member.linkedin,
      hasPhoto: Boolean(member.headshotFileId),
      hasResume: Boolean(member.resumeFileId),
    }));
}

async function sharedMember(id: string) {
  return (await getRoster()).find((member) => member.id === id && member.share);
}

export async function getResume(id: string): Promise<{ filename: string; body: ArrayBuffer | Uint8Array; contentType: string } | null> {
  const member = await sharedMember(id);
  if (!member?.resumeFileId) return null;
  const clean = member.name.replace(/\s*\(sample\)/, "");
  const filename = `${clean.replace(/[^A-Za-z0-9]+/g, "-")}-Resume.pdf`;
  if (!rosterConnected) {
    return { filename, contentType: "application/pdf", body: placeholderPdf([`${clean} - sample resume`, `${member.major}, Class of ${member.classYear}`, "Placeholder file for testing the sponsor portal."]) };
  }
  const file = await downloadDriveFile(member.resumeFileId);
  return file ? { filename, contentType: file.contentType, body: file.body } : null;
}

export async function getHeadshot(id: string): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const member = await sharedMember(id);
  if (!rosterConnected || !member?.headshotFileId) return null;
  const file = await downloadDriveFile(member.headshotFileId);
  return file && file.contentType.startsWith("image/") ? file : null;
}

/** A tiny one-page PDF with a few lines of text, so the download can be tested without real resumes. */
function placeholderPdf(lines: string[]): Uint8Array {
  const escape = (text: string) => text.replace(/[\\()]/g, (c) => `\\${c}`);
  const stream = ["BT", "/F1 16 Tf", "72 720 Td", "22 TL", ...lines.map((line) => `(${escape(line)}) Tj T*`), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return new TextEncoder().encode(pdf);
}
