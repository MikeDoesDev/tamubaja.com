import { z } from "zod";

// Editors often type `value: 9` or `classYear: 2027`; YAML reads those as numbers.
const stringish = z.union([z.string(), z.number()]).transform(String);
const text = stringish.pipe(z.string().trim().min(1, "can't be empty"));
// `show: yes` is a string in YAML 1.2; accept the common spellings.
const yesNo = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const word = value.trim().toLowerCase();
  if (["yes", "true", "on"].includes(word)) return true;
  if (["no", "false", "off"].includes(word)) return false;
  return value;
}, z.boolean());
// A list key left with nothing under it (`leads:`) loads as null; treat it as empty.
const list = <T extends z.ZodType>(schema: T) => z.preprocess((value) => value ?? [], schema);
const httpUrl = z
  .string()
  .regex(/^https?:\/\/\S+$/, "must be a full web address starting with https://");
const publicPath = z
  .string()
  .regex(/^\/\S+$/, "must be a file path starting with / and no spaces (for example /images/hero.jpg)");
const email = z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "must be an email address");
const isoDate = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be a date written as YYYY-MM-DD"),
);

export const TIER_IDS = ["bronze", "silver", "gold", "platinum"] as const;
export const SPONSOR_TIERS = ["platinum", "gold", "silver", "bronze", "inkind"] as const;

export const siteSchema = z.object({
  name: text,
  tagline: text,
  description: text,
  url: httpUrl,
  email,
  socials: z.object({
    instagram: httpUrl,
    linkedin: httpUrl.optional(),
    saeBaja: httpUrl.optional(),
  }),
  packetPdf: publicPath,
  heroImage: publicPath,
  heroVideo: publicPath.optional(),
  teamPhoto: publicPath,
  logo: publicPath,
  web3formsKey: z.string(),
  // Optional banner above the header on every page (e.g. "under construction").
  notice: z.object({ show: yesNo, title: text, message: text }).optional(),
  mission: z.array(text).min(1),
  homeStats: z.array(z.object({ value: text, label: text })).min(1).max(4),
  sponsorPillars: z.array(z.object({ title: text, body: text })).min(1),
  giving: z.object({
    donateUrl: httpUrl,
    foundationUrl: httpUrl,
    accountCode: text,
    steps: z.array(text).min(1),
    checkPayableTo: text,
    checkAddress: z.array(text).min(1),
  }),
});

export const sponsorSchema = z.object({
  name: text,
  tier: z.enum(SPONSOR_TIERS),
  logo: publicPath,
  url: httpUrl,
  show: yesNo,
  // Optional: "dark" puts a white-text logo on a dark tile so it stays visible.
  tile: z
    .preprocess((value) => (typeof value === "string" ? value.trim().toLowerCase() : value), z.enum(["light", "dark"]))
    .optional(),
});
export const sponsorsSchema = z.array(sponsorSchema);

export const tiersSchema = z
  .object({
    tiers: z.array(
      z.object({
        id: z.enum(TIER_IDS),
        name: text,
        priceLabel: text,
        badgeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a hex color like #9F6A3E"),
        benefits: z.array(text).min(1),
      }),
    ),
    inKindCategories: z.array(z.object({ name: text, examples: text })).min(1),
  })
  .refine((file) => file.tiers.map((t) => t.id).join(",") === TIER_IDS.join(","), {
    message: "list the tiers exactly once each, in this order: bronze, silver, gold, platinum",
    path: ["tiers"],
  });

export const seasonsSchema = z.array(
  z.object({
    season: text,
    event: text,
    location: text,
    overall: z.number().int().positive().nullable(),
    fieldSize: z.number().int().positive().optional(),
    highlights: list(z.array(text)),
    photo: publicPath.optional(),
  }),
);

export const carSchema = z.object({
  season: text,
  name: text,
  photo: publicPath,
  summary: text,
  // Optional: the site no longer shows a spec sheet, but older files may still list specs.
  specs: list(z.array(z.object({ label: text, value: text }))),
  subsystems: z.array(z.object({ name: text, description: text, photo: publicPath.optional() })).min(1),
  // "How we build it": the steps every car goes through, in order.
  buildProcess: list(z.array(z.object({ name: text, description: text }))),
  buildSeason: text,
  milestones: z
    .array(z.object({ name: text, date: isoDate, tentative: yesNo.optional() }))
    .min(1),
});

const classYear = stringish.pipe(z.string().regex(/^\d{4}$/, "must be a 4-digit graduation year like 2027"));

const memberSchema = z.object({
  name: text,
  role: text.optional(),
  major: text.optional(),
  classYear: classYear.optional(),
  photo: publicPath.optional(),
});

export const teamSchema = z.object({
  story: z.array(text).min(1),
  leads: list(
    z.array(
      z.object({
        name: text,
        role: text,
        major: text,
        classYear,
        linkedin: httpUrl.optional(),
        photo: publicPath.optional(),
      }),
    ),
  ),
  subteams: z
    .array(
      z.object({
        name: text,
        description: text,
        // Optional longer paragraph shown when the subteam is opened.
        details: text.optional(),
        leads: list(z.array(memberSchema)),
        members: list(z.array(memberSchema)),
      }),
    )
    .min(1),
});

export const developmentSchema = z.object({
  status: text.optional(),
  intro: text,
  why: z.array(text).min(1),
  phases: z.array(z.object({ name: text, description: text })).min(1),
  applyUrl: httpUrl,
});

export const faqSchema = z.array(z.object({ q: text, a: text })).min(1);

export type Site = z.infer<typeof siteSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;
export type TiersFile = z.infer<typeof tiersSchema>;
export type Tier = TiersFile["tiers"][number];
export type Season = z.infer<typeof seasonsSchema>[number];
export type Car = z.infer<typeof carSchema>;
export type Team = z.infer<typeof teamSchema>;
export type Lead = Team["leads"][number];
export type Subteam = Team["subteams"][number];
export type Member = Subteam["members"][number];
export type Development = z.infer<typeof developmentSchema>;
export type FaqItem = z.infer<typeof faqSchema>[number];
