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
  // YouTube videos featured on the homepage ("Baja on screen"). The first one is shown largest.
  videos: list(
    z.array(
      z.object({
        youtubeId: z.string().regex(/^[\w-]{11}$/, "use the 11-character YouTube video ID"),
        title: text,
        body: text,
        poster: publicPath.optional(),
      }),
    ),
  ),
  logo: publicPath,
  web3formsKey: z.string(),
  // Optional banner above the header on every page (e.g. "under construction").
  notice: z.object({ show: yesNo, title: text, message: text }).optional(),
  mission: z.array(text).min(1),
  homeStats: z.array(z.object({ value: text, label: text })).min(1).max(4),
  sponsorPillars: z.array(z.object({ title: text, body: text, photo: publicPath.optional() })).min(1),
  giving: z.object({
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
    improvement: text.optional(),
    // Optional: a few short paragraphs telling that season's story, shown on its car page.
    story: list(z.array(text)),
    // Optional, shown on that season's car page.
    specs: list(z.array(z.object({ label: text, value: stringish.pipe(z.string().trim().min(1)) }))),
    leads: list(z.array(z.object({ name: text, role: text }))),
    // Optional: everyone on that season's team, grouped by subteam, shown on its car page.
    roster: list(z.array(z.object({ team: text, members: z.array(text).min(1) }))),
    photo: publicPath.optional(),
    // Optional: total points at competition (out of 1,000).
    points: z.number().nonnegative().optional(),
    // Optional: how many students were on the team (the roster may list fewer by name).
    teamSize: z.number().int().positive().optional(),
    // Optional: every event's result, from the official Baja SAE results. place is a number, or null
    // when SAE didn't publish one. note is a short extra like "33 laps".
    results: list(
      z.array(
        z.object({
          event: text,
          place: z.number().int().positive().nullable(),
          points: z.number().nonnegative(),
          note: text.optional(),
        }),
      ),
    ),
    // Optional: companies and organizations that sponsored this season's car.
    sponsors: list(z.array(text)),
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
  // "The garage": past cars with their race number and photo. Add `season` (matching a season in
  // seasons.yaml, e.g. "2023–24") to connect a car to its competition result.
  garage: list(
    z.array(
      z.object({
        number: stringish.pipe(z.string().trim().min(1)),
        photo: publicPath,
        description: text,
        season: text.optional(),
        livery: text.optional(),
        // More photos of the same car, shown on its page.
        gallery: list(z.array(publicPath)),
        // Optional captions for the car's photos, keyed by photo path, e.g.
        //   /images/team.jpg: The team with "#51" at SAE Rollout, April 2026
        captions: z.record(z.string(), text).optional(),
      }),
    ),
  ),
  buildSeason: text,
  milestones: z
    .array(
      z.object({
        name: text,
        date: isoDate,
        tentative: yesNo.optional(),
        // Optional: which stage of the season (Design, Build, Compete) and a photo from that milestone.
        phase: text.optional(),
        photo: publicPath.optional(),
        // Optional: a post or page about the milestone, such as the team's Instagram post.
        link: httpUrl.optional(),
        // Optional: what sponsors get at this milestone. Keep it true to tiers.yaml.
        sponsorNote: text.optional(),
        // Optional: which tiers the sponsorNote is for (shown in the sponsor portal). Leave out for every sponsor.
        forTiers: list(z.array(z.enum(TIER_IDS, { message: 'must be "bronze", "silver", "gold", or "platinum"' }))),
      }),
    )
    .min(1),
});

const classYear = stringish.pipe(z.string().regex(/^\d{4}$/, "must be a 4-digit graduation year like 2027"));

// Individual headshots, LinkedIns, and resumes are private: they live in the team Google Sheet and only
// show in the sponsor portal. This repository is public, so team.yaml refuses them.
const privateOnly = (what: string) =>
  z
    .unknown()
    .refine((value) => value === undefined, `${what} can't go on the public site. Add it to the private team sheet instead (see EDITING.md).`)
    .optional();

const memberSchema = z.object({
  name: text,
  role: text.optional(),
  major: text.optional(),
  classYear: classYear.optional(),
  photo: privateOnly("Individual headshots"),
  linkedin: privateOnly("LinkedIn links"),
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
        photo: privateOnly("Individual headshots"),
        linkedin: privateOnly("LinkedIn links"),
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
  intro: text,
  // The Texas A&M SAE development program that runs now, shared by every SAE team.
  sae: z
    .object({
      title: text,
      intro: text,
      leads: z.array(z.object({ term: text, names: z.array(text).min(1) })).min(1),
      term: text,
      sessions: z
        .array(z.object({ date: isoDate, time: text, room: text, note: text.optional() }))
        .min(1),
      note: text.optional(),
    })
    .optional(),
  paths: z.array(z.object({ name: text, who: text, description: text, points: list(z.array(text)) })).min(1),
  applySteps: z.array(text).min(1),
  applyUrl: httpUrl,
});

export const eventsSchema = z.array(
  z.object({
    title: text,
    date: isoDate,
    description: text,
    photo: publicPath.optional(),
    // Optional: up to two more photos, shown beside the main one.
    morePhotos: list(z.array(publicPath).max(2, "can show at most 2 more photos")),
    link: httpUrl.optional(),
  }),
);

// Who can open the private sponsor portal. Matching and the free-email-provider check live in sponsorAccess.ts.
const domainName = z
  .string()
  .trim()
  .toLowerCase()
  .transform((value) => value.replace(/^@/, ""))
  .pipe(z.string().regex(/^[a-z0-9-]+(\.[a-z0-9-]+)+$/, "must be a company email domain, like cat.com (no @, no https://)"));
export const sponsorAccessSchema = z.array(
  z
    .object({
      company: text,
      // Only paying tiers get portal access; in-kind gifts count at their value, so a large one uses the matching tier.
      tier: z.enum(TIER_IDS, { message: 'must be one of "bronze", "silver", "gold", "platinum"' }),
      domains: list(z.array(domainName)),
      emails: list(z.array(email.transform((value) => value.trim().toLowerCase()))),
      until: isoDate.optional(),
    })
    .refine((entry) => entry.domains.length + entry.emails.length > 0, "needs at least one entry under domains: or emails:"),
);

export const faqSchema = z.array(z.object({ q: text, a: text })).min(1);

export type Site = z.infer<typeof siteSchema>;
export type Sponsor = z.infer<typeof sponsorSchema>;
export type TiersFile = z.infer<typeof tiersSchema>;
export type Tier = TiersFile["tiers"][number];
export type Season = z.infer<typeof seasonsSchema>[number];
export type Car = z.infer<typeof carSchema>;
export type GarageCar = Car["garage"][number];
export type Team = z.infer<typeof teamSchema>;
export type Lead = Team["leads"][number];
export type Subteam = Team["subteams"][number];
export type Member = Subteam["members"][number];
export type Development = z.infer<typeof developmentSchema>;
export type Event = z.infer<typeof eventsSchema>[number];
export type FaqItem = z.infer<typeof faqSchema>[number];
export type SponsorAccess = z.infer<typeof sponsorAccessSchema>[number];
