import "server-only";
import { createSign } from "node:crypto";

/**
 * Minimal Google API access with a service account (a robot Google account the site signs in as).
 * The team sheet and the Drive folders it links to are shared with that account's email, view-only.
 * Keys live only in the host's environment variables, never in this public repository.
 */
const env = process.env;

export const googleConfigured = Boolean(env.GOOGLE_SERVICE_ACCOUNT_EMAIL && env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly", "https://www.googleapis.com/auth/drive.readonly"];

let cachedToken: { value: string; expires: number } | undefined;

const base64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
  const email = env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Vercel stores the key with literal "\n"s when pasted on one line; turn them back into newlines.
  const key = env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(
    JSON.stringify({ iss: email, scope: SCOPES.join(" "), aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }),
  )}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${base64url(signature)}` }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Google sign-in for the service account failed (${response.status})`);
  const json = (await response.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

/** Every row of one tab of a Google Sheet, as text. */
export async function readSheet(spreadsheetId: string, tab: string): Promise<string[][]> {
  const range = encodeURIComponent(tab);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueRenderOption=FORMATTED_VALUE`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Couldn't read the team sheet (${response.status}). Is it shared with the service account?`);
  const json = (await response.json()) as { values?: string[][] };
  return json.values ?? [];
}

/** Downloads a Drive file the service account can see. Returns null if it's missing or not shared. */
export async function downloadDriveFile(fileId: string): Promise<{ body: ArrayBuffer; contentType: string } | null> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return { body: await response.arrayBuffer(), contentType: response.headers.get("content-type") ?? "application/octet-stream" };
}
