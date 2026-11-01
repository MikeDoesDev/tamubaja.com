import "server-only";

/**
 * Members shown in the private sponsor portal.
 *
 * PLACEHOLDER DATA. These three people are made up so the sign-in flow can be tested end to end.
 * Real member details and resumes must never be committed: this repository is public. When the team
 * is ready, replace getPortalMembers() and getResume() with reads from private storage (a Google
 * Sheet + Drive folder shared with a service account, or private Vercel Blob storage), using keys
 * kept in the host's environment variables. Only members who opted in on the form should be returned.
 */
export interface PortalMember {
  id: string;
  name: string;
  major: string;
  classYear: string;
  subteam?: string;
  linkedin?: string;
  /** A same-site URL that is itself gated, never a file in public/. Empty shows the placeholder art. */
  photo?: string;
  hasResume: boolean;
}

export const PORTAL_IS_PLACEHOLDER = true;

const PLACEHOLDER_MEMBERS: PortalMember[] = [
  {
    id: "sample-jordan-reyes",
    name: "Jordan Reyes (sample)",
    major: "Mechanical Engineering",
    classYear: "2027",
    subteam: "Suspension",
    linkedin: "https://www.linkedin.com/",
    hasResume: true,
  },
  {
    id: "sample-priya-shah",
    name: "Priya Shah (sample)",
    major: "Industrial Distribution",
    classYear: "2028",
    subteam: "Business",
    linkedin: "https://www.linkedin.com/",
    hasResume: true,
  },
  {
    id: "sample-marcus-lee",
    name: "Marcus Lee (sample)",
    major: "Manufacturing & Mechanical Engineering Technology",
    classYear: "2027",
    subteam: "Powertrain",
    hasResume: false,
  },
];

export async function getPortalMembers(): Promise<PortalMember[]> {
  return PLACEHOLDER_MEMBERS;
}

export async function getResume(id: string): Promise<{ filename: string; body: Uint8Array } | null> {
  const member = PLACEHOLDER_MEMBERS.find((m) => m.id === id && m.hasResume);
  if (!member) return null;
  const clean = member.name.replace(/\s*\(sample\)/, "");
  return {
    filename: `${clean.replace(/[^A-Za-z0-9]+/g, "-")}-Resume.pdf`,
    body: placeholderPdf([`${clean} - sample resume`, `${member.major}, Class of ${member.classYear}`, "Placeholder file for testing the sponsor portal."]),
  };
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
