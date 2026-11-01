import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import type { z } from "zod";
import {
  carSchema,
  developmentSchema,
  eventsSchema,
  faqSchema,
  seasonsSchema,
  siteSchema,
  sponsorAccessSchema,
  sponsorsSchema,
  teamSchema,
  tiersSchema,
} from "./schemas";

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentError";
  }
}

type Issue = { path: PropertyKey[]; message: string };

export function formatIssues(file: string, issues: Issue[]): string {
  const lines = issues.map((issue) => {
    const where = issue.path.length
      ? issue.path.map((p) => (typeof p === "number" ? `item ${p + 1}` : String(p))).join(" → ")
      : "(whole file)";
    return `  • ${where}: ${issue.message}${hintFor(issue.message)}`;
  });
  return `Problem in content/${file}:\n${lines.join("\n")}`;
}

function hintFor(message: string): string {
  if (/expected boolean/.test(message)) return " (use true or false)";
  if (/expected (string|number), received/.test(message)) return " (check the value, or wrap it in quotes)";
  if (/expected array/.test(message)) return " (this should be a list: each item on its own line starting with a dash)";
  return "";
}

export function parseContent<T>(file: string, raw: string, schema: z.ZodType<T>): T {
  const hasContent = raw.split("\n").some((line) => line.trim() && !line.trim().startsWith("#"));
  if (!hasContent) {
    throw new ContentError(`Problem: content/${file} is empty. It needs at least one entry. Restore it from the file's history on GitHub.`);
  }
  let data: unknown;
  try {
    data = load(raw);
  } catch (error) {
    const detail = (error as Error).message.split("\n")[0];
    throw new ContentError(
      `Problem in content/${file}: the YAML formatting is broken (check indentation, dashes, and colons).\n  ${detail}`,
    );
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ContentError(formatIssues(file, result.error.issues));
  }
  return result.data;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

function loadFile<T>(file: string, schema: z.ZodType<T>): T {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
  return parseContent(file, raw, schema);
}

export const getSite = () => loadFile("site.yaml", siteSchema);
export const getSponsors = () => loadFile("sponsors.yaml", sponsorsSchema);
export const getTiers = () => loadFile("tiers.yaml", tiersSchema);
export const getSeasons = () => loadFile("seasons.yaml", seasonsSchema);
export const getCar = () => loadFile("car.yaml", carSchema);
export const getTeam = () => loadFile("team.yaml", teamSchema);
export const getFaq = () => loadFile("faq.yaml", faqSchema);
export const getDevelopment = () => loadFile("development.yaml", developmentSchema);
/** Companies whose people can open the private sponsor portal. */
export const getSponsorAccess = () => loadFile("sponsor-access.yaml", sponsorAccessSchema);
/** Recent events, newest first. */
export const getEvents = () => [...loadFile("events.yaml", eventsSchema)].sort((a, b) => b.date.localeCompare(a.date));
