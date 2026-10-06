# Texas A&M Baja SAE Sponsor Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `tamubaja.com`, a sponsor-first static website for Texas A&M Baja SAE, where all seasonal content lives in validated YAML files that non-coders can edit.

**Architecture:** Next.js App Router site, every page statically generated at build time. Server components read `/content/*.yaml` through one loader that validates with zod and throws plain-English errors. A `prebuild` validation script also checks that referenced files exist, so a bad edit fails the build and Vercel keeps serving the last good deploy. Only three client components (mobile nav, count-up stat, inquiry form); pure logic lives in `src/lib/*` and is unit-tested.

**Tech Stack:** Next.js (latest stable, App Router, TypeScript), Tailwind CSS v4, zod v4, js-yaml, Vitest, Playwright, Web3Forms (form delivery), Vercel (hosting + Web Analytics), GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-05-tamu-baja-sponsor-site-design.md` — read it before starting.

---

## Execution notes (read first)

- **Machine:** Windows 11. Run shell commands in Git Bash from the repo root `C:\Users\micha\Downloads\tamu-baja-site` (`/c/Users/micha/Downloads/tamu-baja-site`). Node.js ≥ 20 required (`node -v`).
- **Commits:** end every commit message with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` (shown as a second `-m` in each commit command).
- **Read-only sources:** never modify anything under `C:\Users\micha\OneDrive\Desktop\School Basic\BAJA\` or the team Google Drive. Copy out only.
- **Privacy:** never put sponsor dollar amounts, sponsor contact names, emails, or phone numbers in this repo. The repo may become public.
- **Accounts/purchases:** Claude does not create accounts, buy the domain, or enter credentials. Task 20 lists the steps the business lead performs.
- **Next.js version drift:** this plan targets the App Router APIs stable since Next 15. If `create-next-app` produces a newer major version and a step's code errors, check the official upgrade guide for that API before changing approach.

## File structure

```
tamu-baja-site/
├── content/                      # ALL editable content (YAML) — see EDITING.md
│   ├── site.yaml                 # name, tagline, contact, socials, stats, mission, pillars, giving
│   ├── sponsors.yaml             # logo wall entries (show: true/false)
│   ├── tiers.yaml                # Bronze→Platinum tiers + in-kind categories
│   ├── seasons.yaml              # competition history, one entry per season
│   ├── car.yaml                  # current car specs/subsystems + build milestones
│   ├── team.yaml                 # story, leads, subteams
│   └── faq.yaml                  # sponsor FAQ
├── public/
│   ├── images/                   # hero.jpg, car-current.jpg, team.jpg, logo-white.png
│   ├── sponsors/                 # sponsor logo files
│   ├── packet/                   # sponsor packet PDF
│   └── video/                    # optional hero.mp4
├── scripts/
│   ├── validate-content.ts       # prebuild: schema + file-existence checks
│   └── lighthouse.mjs            # Lighthouse thresholds for all pages
├── src/
│   ├── app/
│   │   ├── layout.tsx            # fonts, header, footer, analytics, skip link
│   │   ├── globals.css           # Tailwind v4 theme tokens
│   │   ├── icon.tsx              # generated favicon
│   │   ├── opengraph-image.tsx   # home OG image
│   │   ├── page.tsx              # Home
│   │   ├── not-found.tsx         # 404
│   │   ├── sitemap.ts, robots.ts
│   │   ├── sponsors/{page.tsx, opengraph-image.tsx}
│   │   ├── car/{page.tsx, opengraph-image.tsx}
│   │   ├── team/{page.tsx, opengraph-image.tsx}
│   │   └── give/{page.tsx, opengraph-image.tsx}
│   ├── components/
│   │   ├── ButtonLink.tsx, Section.tsx, PageHero.tsx, Hero.tsx, CtaBand.tsx
│   │   ├── Header.tsx, MobileNav.tsx (client), Footer.tsx, LogoWall.tsx
│   │   ├── StatsStrip.tsx, CountUp.tsx (client)
│   │   ├── TierCard.tsx, Faq.tsx, MilestoneTimeline.tsx, SeasonTimeline.tsx, LeadCard.tsx
│   │   └── InquiryForm.tsx (client)
│   └── lib/
│       ├── schemas.ts            # zod schemas + types
│       ├── content.ts            # YAML loader + plain-English errors
│       ├── nav.ts, seo.ts, og.tsx
│       ├── format.ts             # ordinal, newestFirst, initials
│       ├── milestones.ts         # done/next/upcoming status, date formatting
│       ├── countup.ts            # parse/format count-up values
│       ├── sponsors.ts           # group visible sponsors by tier
│       └── inquiry.ts            # form validation, payload, mailto fallback
├── tests/
│   ├── unit/*.test.ts            # Vitest
│   └── e2e/*.spec.ts             # Playwright
├── .github/workflows/{ci.yml, weekly-redeploy.yml}
├── README.md, EDITING.md, HANDOFF.md
└── vitest.config.ts, playwright.config.ts
```

---

### Task 1: Scaffold the Next.js project and tooling

**Files:**
- Create: Next.js scaffold (`package.json`, `src/app/*`, `tsconfig.json`, etc.)
- Create: `vitest.config.ts`, `playwright.config.ts`
- Modify: `.gitignore`, `package.json` (scripts)

- [ ] **Step 1: Ensure git identity exists for this repo**

```bash
git config user.name >/dev/null || git config user.name "<your-name>"
git config user.email >/dev/null || git config user.email "<your-email>"
```

- [ ] **Step 2: Scaffold Next.js into the existing repo**

```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```
Expected: "Success! Created tamu-baja-site". `docs/` and `.git/` are kept.
If it refuses because the folder is not empty: run it into `../tamu-baja-tmp` instead, then `cp -r ../tamu-baja-tmp/. . && rm -rf ../tamu-baja-tmp` (do not copy its `.git`: run `rm -rf ../tamu-baja-tmp/.git` first).

- [ ] **Step 3: Install dependencies**

```bash
npm install zod@^4 js-yaml @vercel/analytics
npm install -D @types/js-yaml vitest tsx @playwright/test
npx playwright install chromium
```

- [ ] **Step 4: Remove scaffold assets we won't use**

```bash
rm -f public/*.svg src/app/favicon.ico
```

- [ ] **Step 5: Add scripts to `package.json`**

Edit the `"scripts"` object so it contains these keys (keep the scaffold's `dev`, `start`, and `lint` entries as generated):

```json
"build": "next build",
"validate": "tsx scripts/validate-content.ts",
"prebuild": "npm run validate",
"test": "vitest run",
"test:e2e": "playwright test",
"lighthouse": "node scripts/lighthouse.mjs"
```

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 7: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    timeout: 300_000,
    reuseExistingServer: false,
    env: { E2E_WEB3FORMS_KEY: "e2e-test-key" },
  },
});
```

- [ ] **Step 8: Extend `.gitignore`**

Append:

```
# testing / audits
/test-results
/playwright-report
/blob-report
/.lighthouse
```

- [ ] **Step 9: Create a placeholder validate script so `prebuild` runs**

Create `scripts/validate-content.ts`:

```ts
console.log("Content validation not configured yet.");
```

- [ ] **Step 10: Verify the scaffold builds**

Run: `npm run build`
Expected: "Content validation not configured yet." then a successful Next.js build listing route `/`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js, Tailwind, Vitest, Playwright" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Content schemas and loader with plain-English errors

**Files:**
- Create: `src/lib/schemas.ts`, `src/lib/content.ts`
- Test: `tests/unit/content.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { ContentError, parseContent } from "@/lib/content";
import { carSchema, sponsorsSchema, tiersSchema } from "@/lib/schemas";

const validSponsor = `- name: GM
  tier: gold
  logo: /sponsors/gm.png
  url: https://www.gm.com
  show: true
`;

describe("parseContent", () => {
  it("returns typed data for valid YAML", () => {
    const result = parseContent("sponsors.yaml", validSponsor, sponsorsSchema);
    expect(result[0]).toEqual({
      name: "GM",
      tier: "gold",
      logo: "/sponsors/gm.png",
      url: "https://www.gm.com",
      show: true,
    });
  });

  it("explains a misspelled tier with the item number and field", () => {
    const yaml = validSponsor.replace("tier: gold", "tier: gould");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /Problem in content\/sponsors\.yaml:[\s\S]*item 1 → tier/,
    );
  });

  it("explains a missing field", () => {
    const yaml = validSponsor.replace("  logo: /sponsors/gm.png\n", "");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(/item 1 → logo/);
  });

  it("explains a web address without https://", () => {
    const yaml = validSponsor.replace("https://www.gm.com", "www.gm.com");
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /must be a full web address starting with https:\/\//,
    );
  });

  it("explains broken YAML formatting", () => {
    const yaml = "- name: GM\n  tier: [gold\n";
    expect(() => parseContent("sponsors.yaml", yaml, sponsorsSchema)).toThrowError(
      /YAML formatting is broken/,
    );
  });

  it("throws a ContentError so callers can tell content problems apart", () => {
    try {
      parseContent("sponsors.yaml", "- name: GM\n", sponsorsSchema);
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ContentError);
    }
  });

  it("accepts unquoted YAML dates in milestones", () => {
    const yaml = `season: 2025–26
name: The 2025–26 car
photo: /images/car-current.jpg
summary: A car.
specs:
  - label: Dry weight
    value: 354.4 lb
subsystems:
  - name: Chassis
    description: Steel tubes.
buildSeason: 2026–27
milestones:
  - name: Design freeze
    date: 2026-11-22
`;
    const car = parseContent("car.yaml", yaml, carSchema);
    expect(car.milestones[0].date).toBe("2026-11-22");
  });

  it("requires tiers in order from cheapest to most expensive", () => {
    const tier = (id: string) => `  - id: ${id}
    name: ${id}
    priceLabel: $1
    badgeColor: "#9F6A3E"
    benefits: [Thanks]
`;
    const yaml = `tiers:
${tier("gold")}${tier("bronze")}${tier("silver")}${tier("platinum")}inKindCategories:
  - name: Tools
    examples: Wrenches
`;
    expect(() => parseContent("tiers.yaml", yaml, tiersSchema)).toThrowError(
      /bronze, silver, gold, platinum/,
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: FAIL — cannot resolve `@/lib/content`.

- [ ] **Step 3: Create `src/lib/schemas.ts`**

```ts
import { z } from "zod";

const text = z.string().trim().min(1, "can't be empty");
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
    linktree: httpUrl,
    linkedin: httpUrl.optional(),
  }),
  packetPdf: publicPath,
  heroImage: publicPath,
  heroVideo: publicPath.optional(),
  teamPhoto: publicPath,
  logo: publicPath,
  web3formsKey: z.string(),
  mission: z.array(text).min(1),
  homeStats: z.array(z.object({ value: text, label: text })).min(1).max(4),
  sponsorPillars: z.array(z.object({ title: text, body: text })).min(1),
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
  show: z.boolean(),
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
    highlights: z.array(text),
    photo: publicPath.optional(),
  }),
);

export const carSchema = z.object({
  season: text,
  name: text,
  photo: publicPath,
  summary: text,
  specs: z.array(z.object({ label: text, value: text })).min(1),
  subsystems: z.array(z.object({ name: text, description: text, photo: publicPath.optional() })).min(1),
  buildSeason: text,
  milestones: z
    .array(z.object({ name: text, date: isoDate, tentative: z.boolean().optional() }))
    .min(1),
});

export const teamSchema = z.object({
  story: z.array(text).min(1),
  leads: z.array(
    z.object({
      name: text,
      role: text,
      major: text,
      classYear: z.string().regex(/^\d{4}$/, "must be a 4-digit graduation year like 2027"),
      linkedin: httpUrl.optional(),
      photo: publicPath.optional(),
    }),
  ),
  subteams: z.array(z.object({ name: text, description: text })).min(1),
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
export type FaqItem = z.infer<typeof faqSchema>[number];
```

- [ ] **Step 4: Create `src/lib/content.ts`**

```ts
import fs from "node:fs";
import path from "node:path";
import { load } from "js-yaml";
import type { z } from "zod";
import {
  carSchema,
  faqSchema,
  seasonsSchema,
  siteSchema,
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
    return `  • ${where}: ${issue.message}`;
  });
  return `Problem in content/${file}:\n${lines.join("\n")}`;
}

export function parseContent<T>(file: string, raw: string, schema: z.ZodType<T>): T {
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/content.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas.ts src/lib/content.ts tests/unit/content.test.ts
git commit -m "feat: add content schemas and YAML loader with readable errors" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Seed content files and the prebuild validator

**Files:**
- Create: `content/site.yaml`, `content/sponsors.yaml`, `content/tiers.yaml`, `content/seasons.yaml`, `content/car.yaml`, `content/team.yaml`, `content/faq.yaml`
- Create: `scripts/validate-content.ts` (replace placeholder)
- Test: `tests/unit/content-files.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/content-files.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  getCar,
  getFaq,
  getSeasons,
  getSite,
  getSponsors,
  getTeam,
  getTiers,
} from "@/lib/content";

describe("real content files", () => {
  it.each([
    ["site.yaml", getSite],
    ["sponsors.yaml", getSponsors],
    ["tiers.yaml", getTiers],
    ["seasons.yaml", getSeasons],
    ["car.yaml", getCar],
    ["team.yaml", getTeam],
    ["faq.yaml", getFaq],
  ] as const)("%s is valid", (_file, load) => {
    expect(() => load()).not.toThrow();
  });

  it("never lists dollar amounts for individual sponsors", () => {
    for (const sponsor of getSponsors()) {
      expect(JSON.stringify(sponsor)).not.toMatch(/\$\s?\d/);
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run tests/unit/content-files.test.ts`
Expected: FAIL — ENOENT `content/site.yaml`.

- [ ] **Step 3: Create `content/site.yaml`**

```yaml
# Site-wide settings. Read EDITING.md before changing anything here.
name: Texas A&M Baja SAE
tagline: Engineered to conquer the toughest terrain.
description: Texas A&M Baja SAE designs, builds, and races a new off-road vehicle every year against 100+ universities. Partner with the team behind car #51.
url: https://tamubaja.com
email: baja.sae.tamu@gmail.com
socials:
  instagram: https://www.instagram.com/tamu.baja.sae/
  linktree: https://linktr.ee/tamu.baja.sae
  linkedin: https://www.linkedin.com/company/tamusae/
packetPdf: /packet/tamu-baja-sponsor-packet-2026-27.pdf
heroImage: /images/hero.jpg
teamPhoto: /images/team.jpg
logo: /images/logo-white.png
# Free key from web3forms.com, requested with baja.sae.tamu@gmail.com.
# While empty, the sponsor form opens the visitor's email app instead of sending.
web3formsKey: ""
mission:
  - We're a collegiate engineering design team that designs, builds, and races a brand-new off-road vehicle every year, then takes it to an international Baja SAE competition against more than 100 universities.
  - Founded as a development program for Texas A&M's Formula team, we find high-potential undergraduates and give them the tools, mentorship, and hands-on experience to make an immediate impact in the automotive industry.
homeStats:
  - value: "100+"
    label: Universities we race against
  - value: 3rd
    label: Acceleration — 2025
  - value: 4th
    label: Design — 2024
  - value: 18th
    label: Overall — 2024
sponsorPillars:
  - title: Brand exposure
    body: Your logo rides on the car, team uniforms, promotional materials, and our social channels, in front of competition crowds, industry judges, and the Aggie community.
  - title: Talent pipeline
    body: Meet engineers who design, machine, and test real hardware. Sponsors get access to our resume bank and can recruit directly at team meetings.
  - title: Tax-deductible
    body: Gifts are made through the Texas A&M Foundation and are tax-deductible. Every donor is invited to our spring Rollout.
giving:
  foundationUrl: https://www.txamfoundation.com/give.aspx
  accountCode: 511361-20000
  steps:
    - Open the Texas A&M Foundation giving page.
    - Choose "Select a Unit or College," then "An Unlisted Account."
    - Enter account code 511361-20000 in the Giving Account box.
    - Enter your gift amount and complete checkout.
  checkPayableTo: Texas A&M Baja SAE
  checkAddress:
    - "ATTN: Dr. Saripalli"
    - 3123 TAMU
    - College Station, TX 77843
```

- [ ] **Step 4: Create `content/sponsors.yaml`**

```yaml
# Sponsor logo wall. A sponsor appears on the site ONLY when show: true.
# Set show: true only after the sponsor approves logo use AND the logo file exists in public/sponsors/.
# tier must be one of: platinum, gold, silver, bronze, inkind
# Never add dollar amounts or contact info here.
- name: General Motors
  tier: gold
  logo: /sponsors/gm.png
  url: https://www.gm.com
  show: false
- name: Gene Haas Foundation
  tier: gold
  logo: /sponsors/haas-foundation.png
  url: https://www.ghaasfoundation.org
  show: false
- name: Caterpillar
  tier: gold
  logo: /sponsors/caterpillar.png
  url: https://www.caterpillar.com
  show: false
- name: Bray International
  tier: gold
  logo: /sponsors/bray.png
  url: https://www.bray.com
  show: false
- name: Vistra
  tier: gold
  logo: /sponsors/vistra.png
  url: https://vistracorp.com
  show: false
- name: Tesla
  tier: silver
  logo: /sponsors/tesla.png
  url: https://www.tesla.com
  show: false
- name: L3Harris
  tier: silver
  logo: /sponsors/l3harris.png
  url: https://www.l3harris.com
  show: false
- name: Gates
  tier: inkind
  logo: /sponsors/gates.png
  url: https://www.gates.com
  show: false
- name: AFCO Racing
  tier: inkind
  logo: /sponsors/afco.png
  url: https://www.afcoracing.com
  show: false
- name: KISSsoft
  tier: inkind
  logo: /sponsors/kisssoft.png
  url: https://www.kisssoft.com
  show: false
- name: Polymaker
  tier: inkind
  logo: /sponsors/polymaker.png
  url: https://us.polymaker.com
  show: false
- name: Rock West Composites
  tier: inkind
  logo: /sponsors/rock-west.png
  url: https://www.rockwestcomposites.com
  show: false
- name: Primeweld
  tier: inkind
  logo: /sponsors/primeweld.png
  url: https://primeweld.com
  show: false
```

- [ ] **Step 5: Create `content/tiers.yaml`**

```yaml
# Sponsorship tiers, cheapest first. Each tier automatically shows "+ Everything in <tier below>".
tiers:
  - id: bronze
    name: Bronze
    priceLabel: $500 – $1,499
    badgeColor: "#9F6A3E"
    benefits:
      - Social media feature
      - Small logo on the car and website
  - id: silver
    name: Silver
    priceLabel: $1,500 – $4,999
    badgeColor: "#B3B7BA"
    benefits:
      - Access to our team resume bank
      - Medium logo placement
  - id: gold
    name: Gold
    priceLabel: $5,000 – $9,999
    badgeColor: "#EFE37F"
    benefits:
      - Baja SAE team merchandise
      - Recruit at team meetings
      - Large logo placement
  - id: platinum
    name: Platinum
    priceLabel: $10,000+
    badgeColor: "#9EC8E0"
    benefits:
      - Invitation to vehicle testing
      - Dedicated recognition at the SAE Rollout event
inKindCategories:
  - name: Technology and software
    examples: Engineering tools, design software, data acquisition systems
  - name: Tools and equipment
    examples: Hand tools, power tools, welding supplies, safety gear
  - name: Materials and supplies
    examples: Lubricants, cleaning products, fabrication materials
  - name: Support services
    examples: Travel assistance, food and catering for events, logistics
```

- [ ] **Step 6: Create `content/seasons.yaml`**

```yaml
# Competition history. Add the newest season at the top.
# overall: the overall placing as a number, or null if there was no overall result.
# Only add results the team has confirmed.
- season: 2024–25
  event: Baja SAE Maryland
  location: Maryland
  overall: 31
  highlights:
    - 3rd Acceleration — first podium
- season: 2023–24
  event: Baja SAE Williamsport
  location: Williamsport, Pennsylvania
  overall: 18
  highlights:
    - 4th Design
- season: 2022–23
  event: Baja SAE Oregon
  location: Oregon
  overall: 44
  highlights:
    - Top 40 in Design, Cost, and Sales
- season: 2021–22
  event: Baja SAE Tennessee
  location: Tennessee
  overall: 27
  highlights:
    - Strong static event results
- season: 2020–21
  event: Virtual competition
  location: Online
  overall: null
  highlights:
    - 8th of 156 — Virtual Knowledge Event
- season: 2019–20
  event: Virtual competition
  location: Online
  overall: 16
  highlights:
    - Team-record finish
    - First four-wheel-drive car
- season: 2018–19
  event: Baja SAE California
  location: California
  overall: 52
  highlights:
    - 9th Cost
    - 16th Sales
- season: 2017–18
  event: Baja SAE Kansas
  location: Kansas
  overall: 33
  fieldSize: 95
  highlights:
    - First competition
    - 7th Maneuverability
```

- [ ] **Step 7: Create `content/car.yaml`**

```yaml
# The current car and this season's build milestones.
# Milestones mark themselves Done / Up next / Upcoming from the date — never edit status by hand.
season: 2025–26
name: The 2025–26 car
photo: /images/car-current.jpg
summary: Every season we start from a clean sheet. Our 2025–26 car pairs a 4130 chromoly chassis with a carbon-fiber seat and body, a custom two-stage gearbox, titanium axles, and an electronically controlled CVT.
specs:
  - label: Dry weight
    value: 354.4 lb
  - label: Suspension travel
    value: 13–13.5 in
  - label: Weight split (F/R)
    value: 47 / 53
  - label: CG height
    value: 21.7 in
  - label: Chassis
    value: 4130 chromoly, 84.6 lb
  - label: Transmission
    value: Electronic CVT + 2-stage gearbox
  - label: Axles
    value: Titanium
  - label: Body and seat
    value: Carbon fiber
subsystems:
  - name: Chassis
    description: A 4130 chromoly tube frame weighing 84.6 lb, built for driver protection and stiffness, wrapped in a carbon-fiber seat and body panels.
  - name: Suspension
    description: Front double A-arms and rear semi-trailing arms with 13–13.5 inches of travel to absorb rocks, logs, and hard landings.
  - name: Powertrain
    description: An electronic CVT with about 80% less rotating inertia than an off-the-shelf unit drives a custom two-stage reduction gearbox with carburized 8620 steel gears and titanium axles.
  - name: Controls and electronics
    description: Electronic CVT control plus the sensors and data acquisition we use to validate every design in the dirt.
  - name: Manufacturing
    description: In-house fabrication and machining backed by industry partners, from tube bending and welding to gear hobbing and splining.
buildSeason: 2026–27
milestones:
  - name: Initial design review 1
    date: 2026-08-09
  - name: Initial design review 2
    date: 2026-09-13
  - name: Engineering design review 1
    date: 2026-10-25
  - name: Engineering design review 2
    date: 2026-11-15
  - name: Design freeze
    date: 2026-11-22
  - name: Rolling chassis
    date: 2027-02-14
  - name: First drive
    date: 2027-02-28
  - name: SAE Rollout
    date: 2027-04-18
    tentative: true
  - name: Competition
    date: 2027-05-20
```

- [ ] **Step 8: Create `content/team.yaml`**

```yaml
# Team page content.
# leads: add a lead only after they agree to appear on the site. Example:
#   - name: Jordan Smith
#     role: Project Manager
#     major: Mechanical Engineering
#     classYear: "2027"
#     linkedin: https://www.linkedin.com/in/jordan-smith
#     photo: /images/team/jordan-smith.jpg
story:
  - Texas A&M Baja SAE grew out of the Texas A&M Racing Apprentices program as a development path for the university's Formula team. Since our first competition in Kansas in 2018, we've designed and built a new car every season.
  - The team is open to every major and class year. Engineers design, machine, and test real hardware; business members run sponsorships, finance, and media. Graduates leave with the kind of experience employers ask about in interviews.
leads: []
subteams:
  - name: Chassis
    description: Frame design, driver ergonomics, and safety.
  - name: Suspension
    description: Geometry, shocks, hubs, and steering.
  - name: Powertrain
    description: CVT, gearbox, axles, and driveline.
  - name: Controls
    description: Electronics, CVT control, sensors, and data.
  - name: Manufacturing
    description: Fabrication, machining, and welding.
  - name: Business
    description: Sponsorships, finance, media, and outreach.
```

- [ ] **Step 9: Create `content/faq.yaml`**

```yaml
# Sponsor FAQ shown on the Sponsors page.
- q: Is my sponsorship tax-deductible?
  a: Yes. Gifts are made through the Texas A&M Foundation, which provides a receipt for your records.
- q: How do we pay?
  a: Online by card through the Texas A&M Foundation, or by check made payable to Texas A&M Baja SAE. Send us an inquiry and we'll walk you through the option that fits your company's process.
- q: Can we donate parts, tools, software, or services instead of cash?
  a: Absolutely. In-kind support like machining, materials, software licenses, and discounts is a huge part of how the car gets built, and it's recognized on the car and website.
- q: When do we need to commit to get our logo on the car?
  a: Logo placement on the car and apparel is finalized in the weeks before our spring Rollout. Commit early in the season to guarantee placement, and we'll confirm the current deadline when you reach out.
- q: Can we recruit from the team?
  a: Yes. Silver sponsors and above get access to our resume bank, and Gold sponsors and above can recruit in person at team meetings.
- q: Can we customize a package?
  a: Yes. The tiers are a starting point. Tell us your goals, whether that's recruiting, brand visibility, or product testing, and we'll build a package around them.
```

- [ ] **Step 10: Run the content test to verify it passes**

Run: `npx vitest run tests/unit/content-files.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 11: Replace `scripts/validate-content.ts` with the real validator**

```ts
import fs from "node:fs";
import path from "node:path";
import {
  ContentError,
  getCar,
  getFaq,
  getSeasons,
  getSite,
  getSponsors,
  getTeam,
  getTiers,
} from "../src/lib/content";

const problems: string[] = [];
const warnings: string[] = [];

function attempt<T>(load: () => T): T | undefined {
  try {
    return load();
  } catch (error) {
    if (error instanceof ContentError) {
      problems.push(error.message);
      return undefined;
    }
    throw error;
  }
}

const exists = (publicPath: string) => fs.existsSync(path.join(process.cwd(), "public", publicPath));
function requireFile(file: string, label: string, publicPath: string | undefined) {
  if (publicPath && !exists(publicPath)) {
    problems.push(`Problem in content/${file}:\n  • ${label}: the file public${publicPath} does not exist`);
  }
}

const site = attempt(getSite);
const sponsors = attempt(getSponsors);
attempt(getTiers);
const seasons = attempt(getSeasons);
const car = attempt(getCar);
const team = attempt(getTeam);
attempt(getFaq);

if (site) {
  requireFile("site.yaml", "packetPdf", site.packetPdf);
  requireFile("site.yaml", "heroImage", site.heroImage);
  requireFile("site.yaml", "heroVideo", site.heroVideo);
  requireFile("site.yaml", "teamPhoto", site.teamPhoto);
  requireFile("site.yaml", "logo", site.logo);
  if (!site.web3formsKey) {
    warnings.push(
      "site.yaml → web3formsKey is empty, so the sponsor form will open the visitor's email app instead of sending. Add the key before launch.",
    );
  }
}
for (const sponsor of sponsors ?? []) {
  if (sponsor.show) requireFile("sponsors.yaml", `${sponsor.name} → logo`, sponsor.logo);
}
for (const season of seasons ?? []) requireFile("seasons.yaml", `${season.season} → photo`, season.photo);
if (car) {
  requireFile("car.yaml", "photo", car.photo);
  for (const sub of car.subsystems) requireFile("car.yaml", `${sub.name} → photo`, sub.photo);
}
for (const lead of team?.leads ?? []) requireFile("team.yaml", `${lead.name} → photo`, lead.photo);

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (problems.length) {
  console.error(`\nContent check failed. Fix these and try again:\n\n${problems.join("\n\n")}\n`);
  process.exit(1);
}
console.log("Content check passed.");
```

- [ ] **Step 12: Run the validator and confirm it reports the missing assets**

Run: `npm run validate`
Expected: exit code 1, a WARNING about `web3formsKey`, and "Content check failed" listing `public/packet/tamu-baja-sponsor-packet-2026-27.pdf`, `public/images/hero.jpg`, `public/images/team.jpg`, `public/images/logo-white.png`, `public/images/car-current.jpg`. (Task 4 adds them.)

- [ ] **Step 13: Commit**

```bash
git add content scripts/validate-content.ts tests/unit/content-files.test.ts
git commit -m "feat: seed content YAML and prebuild content validator" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Import brand assets, photos, and the sponsor packet

**Files:**
- Create: `public/images/logo-white.png`, `public/images/hero.jpg`, `public/images/car-current.jpg`, `public/images/team.jpg`
- Create: `public/packet/tamu-baja-sponsor-packet-2026-27.pdf`

Sources (read-only):
- Google Drive → team `Business` folder → `Media Resources/Logos/BajaLogoTransparentWhite.png`
- Google Drive → `Business/Media Resources/2026 Car Photos/9.26.26BAJA-BMW/` (14 JPGs: DSC02157 … DSC02247)
- Local packet: `C:\Users\micha\OneDrive\Desktop\School Basic\BAJA\26-27 Texas A&M Baja SAE Sponsor Packet.pdf`

- [ ] **Step 1: Copy the sponsor packet**

```bash
mkdir -p public/packet public/images public/sponsors
cp "/c/Users/micha/OneDrive/Desktop/School Basic/BAJA/26-27 Texas A&M Baja SAE Sponsor Packet.pdf" public/packet/tamu-baja-sponsor-packet-2026-27.pdf
ls -l public/packet
```
Expected: one PDF of roughly 4.7 MB.

- [ ] **Step 2: Download the logo and car photos from Google Drive**

Load the Drive connector tools with ToolSearch (query `google drive search download`). Use `search_files` with `title = 'BajaLogoTransparentWhite.png'` and with `title contains 'DSC02'`, then `download_file_content` for each result into a scratch folder `_incoming/` at the repo root (add `/_incoming` to `.gitignore`).
If the Drive connector is unavailable: stop and ask the user to download `BajaLogoTransparentWhite.png` and the `9.26.26BAJA-BMW` photos into `_incoming/`.

- [ ] **Step 3: Pick the hero and current-car photos**

View every `_incoming/DSC02*.jpg` with the Read tool. Choose:
- **hero** — the most dramatic landscape shot of the car in motion with room for a headline in the lower-left.
- **car-current** — the clearest full view of the whole car.
Do not choose any photo where another team's car is the subject.

- [ ] **Step 4: Resize and place the images, and extract the team photo from the packet**

```bash
python -m pip install -q pillow pymupdf
python - <<'EOF'
import io, shutil
import fitz
from PIL import Image

def save_jpg(src, dst):
    img = Image.open(src).convert("RGB")
    img.thumbnail((2400, 2400))
    img.save(dst, "JPEG", quality=82, optimize=True, progressive=True)
    print(dst, img.size)

save_jpg("_incoming/HERO_FILENAME.jpg", "public/images/hero.jpg")
save_jpg("_incoming/CAR_FILENAME.jpg", "public/images/car-current.jpg")
shutil.copy("_incoming/BajaLogoTransparentWhite.png", "public/images/logo-white.png")

doc = fitz.open(r"C:\Users\micha\OneDrive\Desktop\School Basic\BAJA\26-27 Texas A&M Baja SAE Sponsor Packet.pdf")
page = doc[1]  # packet page 2, "Who we are", has the team group photo
best = max(page.get_images(full=True), key=lambda i: i[2] * i[3])
data = doc.extract_image(best[0])["image"]
save_jpg(io.BytesIO(data), "public/images/team.jpg")
EOF
```
Replace `HERO_FILENAME` and `CAR_FILENAME` with the names picked in Step 3 before running. Expected: four lines printing paths and sizes, each image at most 2400 px wide.

- [ ] **Step 5: Visually confirm the team photo**

View `public/images/team.jpg` with the Read tool. Expected: the maroon-polo team group photo. If it is something else, pick the right image index from `page.get_images` and re-run that part.

- [ ] **Step 6: Run the validator**

Run: `npm run validate`
Expected: the `web3formsKey` WARNING, then "Content check passed." (exit code 0).

- [ ] **Step 7: Commit**

```bash
echo "/_incoming" >> .gitignore
git add .gitignore public/images public/packet
git commit -m "feat: add logo, car and team photos, sponsor packet" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Formatting and milestone helpers

**Files:**
- Create: `src/lib/format.ts`, `src/lib/milestones.ts`
- Test: `tests/unit/format.test.ts`, `tests/unit/milestones.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { initials, newestFirst, ordinal } from "@/lib/format";

describe("ordinal", () => {
  it.each([
    [1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [11, "11th"], [12, "12th"],
    [13, "13th"], [18, "18th"], [21, "21st"], [22, "22nd"], [33, "33rd"], [52, "52nd"],
    [101, "101st"], [111, "111th"],
  ])("%i → %s", (n, expected) => {
    expect(ordinal(n)).toBe(expected);
  });
});

describe("newestFirst", () => {
  it("sorts seasons by season label, newest first, without mutating", () => {
    const input = [{ season: "2017–18" }, { season: "2024–25" }, { season: "2019–20" }];
    expect(newestFirst(input).map((s) => s.season)).toEqual(["2024–25", "2019–20", "2017–18"]);
    expect(input[0].season).toBe("2017–18");
  });
});

describe("initials", () => {
  it("uses the first letters of the first two words", () => {
    expect(initials("Jordan Smith")).toBe("JS");
    expect(initials("ana maria lopez")).toBe("AM");
    expect(initials("Cher")).toBe("C");
  });
});
```

Create `tests/unit/milestones.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatMilestoneDate, withStatus } from "@/lib/milestones";

const milestones = [
  { name: "Design freeze", date: "2026-11-22" },
  { name: "Initial design review 1", date: "2026-08-09" },
  { name: "Rolling chassis", date: "2027-02-14" },
  { name: "Competition", date: "2027-05-20" },
];

describe("withStatus", () => {
  it("sorts by date; past is done, first future is next, the rest upcoming", () => {
    const result = withStatus(milestones, new Date("2026-10-05T12:00:00Z"));
    expect(result.map((m) => [m.name, m.status])).toEqual([
      ["Initial design review 1", "done"],
      ["Design freeze", "next"],
      ["Rolling chassis", "upcoming"],
      ["Competition", "upcoming"],
    ]);
  });

  it("treats a milestone dated today as next", () => {
    const result = withStatus(milestones, new Date("2026-11-22T08:00:00Z"));
    expect(result.find((m) => m.name === "Design freeze")?.status).toBe("next");
  });

  it("marks everything done after the season", () => {
    const result = withStatus(milestones, new Date("2027-06-01T00:00:00Z"));
    expect(result.every((m) => m.status === "done")).toBe(true);
  });

  it("keeps extra fields like tentative", () => {
    const result = withStatus(
      [{ name: "SAE Rollout", date: "2027-04-18", tentative: true }],
      new Date("2026-10-05T00:00:00Z"),
    );
    expect(result[0]).toEqual({ name: "SAE Rollout", date: "2027-04-18", tentative: true, status: "next" });
  });
});

describe("formatMilestoneDate", () => {
  it("formats ISO dates as short US dates", () => {
    expect(formatMilestoneDate("2026-11-22")).toBe("Nov 22, 2026");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/format.test.ts tests/unit/milestones.test.ts`
Expected: FAIL — cannot resolve `@/lib/format` / `@/lib/milestones`.

- [ ] **Step 3: Create `src/lib/format.ts`**

```ts
export function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

export function newestFirst<T extends { season: string }>(seasons: T[]): T[] {
  return [...seasons].sort((a, b) => b.season.localeCompare(a.season));
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
```

- [ ] **Step 4: Create `src/lib/milestones.ts`**

```ts
export type MilestoneStatus = "done" | "next" | "upcoming";

export interface Milestone {
  name: string;
  date: string;
  tentative?: boolean;
}

export function withStatus<T extends Milestone>(
  milestones: T[],
  today: Date,
): (T & { status: MilestoneStatus })[] {
  const todayIso = today.toISOString().slice(0, 10);
  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  let nextAssigned = false;
  return sorted.map((milestone) => {
    if (milestone.date < todayIso) return { ...milestone, status: "done" as const };
    if (!nextAssigned) {
      nextAssigned = true;
      return { ...milestone, status: "next" as const };
    }
    return { ...milestone, status: "upcoming" as const };
  });
}

export function formatMilestoneDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/format.test.ts tests/unit/milestones.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/format.ts src/lib/milestones.ts tests/unit/format.test.ts tests/unit/milestones.test.ts
git commit -m "feat: add ordinal, season sort, initials, and milestone status helpers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Count-up and sponsor grouping helpers

**Files:**
- Create: `src/lib/countup.ts`, `src/lib/sponsors.ts`
- Test: `tests/unit/countup.test.ts`, `tests/unit/sponsors.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/countup.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { easeOutExpo, formatCount, parseCountable } from "@/lib/countup";

describe("parseCountable", () => {
  it("parses plain, plus-suffixed, and dollar values", () => {
    expect(parseCountable("9")).toEqual({ prefix: "", target: 9, suffix: "" });
    expect(parseCountable("100+")).toEqual({ prefix: "", target: 100, suffix: "+" });
    expect(parseCountable("$5,000+")).toEqual({ prefix: "$", target: 5000, suffix: "+" });
  });

  it("returns null for ordinals and text so they render static", () => {
    expect(parseCountable("3rd")).toBeNull();
    expect(parseCountable("18th")).toBeNull();
    expect(parseCountable("Top 25")).toBeNull();
  });
});

describe("formatCount", () => {
  it("rounds and adds separators, prefix, and suffix", () => {
    const c = { prefix: "$", target: 5000, suffix: "+" };
    expect(formatCount(c, 4999.6)).toBe("$5,000+");
    expect(formatCount(c, 0)).toBe("$0+");
  });
});

describe("easeOutExpo", () => {
  it("starts at 0 and ends at 1", () => {
    expect(easeOutExpo(0)).toBe(0);
    expect(easeOutExpo(1)).toBe(1);
    expect(easeOutExpo(0.5)).toBeGreaterThan(0.9);
  });
});
```

Create `tests/unit/sponsors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Sponsor } from "@/lib/schemas";
import { groupSponsors } from "@/lib/sponsors";

const s = (name: string, tier: Sponsor["tier"], show = true): Sponsor => ({
  name,
  tier,
  logo: `/sponsors/${name}.png`,
  url: `https://${name}.com`,
  show,
});

describe("groupSponsors", () => {
  it("groups visible sponsors from platinum to in-kind and drops empty tiers", () => {
    const groups = groupSponsors([s("b", "bronze"), s("p", "platinum"), s("k", "inkind"), s("g", "gold")]);
    expect(groups.map((g) => [g.label, g.sponsors.map((x) => x.name)])).toEqual([
      ["Platinum", ["p"]],
      ["Gold", ["g"]],
      ["Bronze", ["b"]],
      ["In-kind partners", ["k"]],
    ]);
  });

  it("hides sponsors with show: false", () => {
    expect(groupSponsors([s("hidden", "gold", false)])).toEqual([]);
  });

  it("keeps file order within a tier", () => {
    const groups = groupSponsors([s("z", "gold"), s("a", "gold")]);
    expect(groups[0].sponsors.map((x) => x.name)).toEqual(["z", "a"]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/countup.test.ts tests/unit/sponsors.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Create `src/lib/countup.ts`**

```ts
export interface Countable {
  prefix: string;
  target: number;
  suffix: string;
}

export function parseCountable(value: string): Countable | null {
  const match = /^(\$?)(\d{1,3}(?:,\d{3})+|\d+)(\+?)$/.exec(value.trim());
  if (!match) return null;
  return { prefix: match[1], target: Number(match[2].replace(/,/g, "")), suffix: match[3] };
}

export function formatCount(countable: Countable, current: number): string {
  return `${countable.prefix}${Math.round(current).toLocaleString("en-US")}${countable.suffix}`;
}

export function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}
```

- [ ] **Step 4: Create `src/lib/sponsors.ts`**

```ts
import type { Sponsor } from "./schemas";

export const WALL_ORDER = ["platinum", "gold", "silver", "bronze", "inkind"] as const;

const WALL_LABELS: Record<(typeof WALL_ORDER)[number], string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  inkind: "In-kind partners",
};

export interface SponsorGroup {
  tier: (typeof WALL_ORDER)[number];
  label: string;
  sponsors: Sponsor[];
}

export function groupSponsors(sponsors: Sponsor[]): SponsorGroup[] {
  return WALL_ORDER.map((tier) => ({
    tier,
    label: WALL_LABELS[tier],
    sponsors: sponsors.filter((sponsor) => sponsor.show && sponsor.tier === tier),
  })).filter((group) => group.sponsors.length > 0);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/unit/countup.test.ts tests/unit/sponsors.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/countup.ts src/lib/sponsors.ts tests/unit/countup.test.ts tests/unit/sponsors.test.ts
git commit -m "feat: add count-up parsing and sponsor tier grouping" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Inquiry form logic

**Files:**
- Create: `src/lib/inquiry.ts`
- Test: `tests/unit/inquiry.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/unit/inquiry.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/inquiry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/lib/inquiry.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/inquiry.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full unit suite**

Run: `npm test`
Expected: all unit test files PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/inquiry.ts tests/unit/inquiry.test.ts
git commit -m "feat: add sponsor inquiry validation, payload, and mailto fallback" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Theme, root layout, header, footer, logo wall

**Files:**
- Modify (replace): `src/app/globals.css`, `src/app/layout.tsx`
- Create: `src/app/icon.tsx`, `src/lib/nav.ts`, `src/lib/seo.ts`
- Create: `src/components/ButtonLink.tsx`, `src/components/Section.tsx`, `src/components/Header.tsx`, `src/components/MobileNav.tsx`, `src/components/Footer.tsx`, `src/components/LogoWall.tsx`

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #14181d;
  --color-panel: #1f252c;
  --color-panel-2: #262d35;
  --color-line: #2f3842;
  --color-maroon: #500000;
  --color-accent: #9fb3c8;
  --color-ink: #ffffff;
  --color-muted: #93a0ad;
}

@theme inline {
  --font-display: var(--font-saira), "Arial Narrow", sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: 5rem;
}

body {
  background: var(--color-bg);
  color: var(--color-ink);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

.slash-top {
  clip-path: polygon(0 3vw, 100% 0, 100% 100%, 0 100%);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 2: Create `src/lib/nav.ts`**

```ts
export const NAV_LINKS = [
  { href: "/car", label: "Car" },
  { href: "/team", label: "Team" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/give", label: "Give" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
```

- [ ] **Step 3: Create `src/lib/seo.ts`**

```ts
import type { Metadata } from "next";

export function pageMetadata(options: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  return {
    title: options.absolute ? { absolute: options.title } : options.title,
    description: options.description,
    alternates: { canonical: options.path },
    openGraph: {
      title: options.title,
      description: options.description,
      url: options.path,
      siteName: "Texas A&M Baja SAE",
      type: "website",
      locale: "en_US",
    },
    twitter: { card: "summary_large_image", title: options.title, description: options.description },
  };
}
```

- [ ] **Step 4: Create `src/components/ButtonLink.tsx`**

```tsx
import Link from "next/link";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-bg hover:bg-ink",
  secondary: "border border-ink/40 text-ink hover:border-ink hover:bg-ink/10",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  download = false,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  download?: boolean;
  external?: boolean;
}) {
  const className = `inline-flex items-center justify-center rounded-sm px-5 py-3 font-display text-lg font-bold uppercase tracking-wide transition-colors ${VARIANTS[variant]}`;
  if (download) {
    return (
      <a href={href} download className={className}>
        {children}
      </a>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 5: Create `src/components/Section.tsx`**

```tsx
export function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`px-4 py-16 sm:px-6 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">{children}</h2>
  );
}
```

- [ ] **Step 6: Create `src/components/MobileNav.tsx`**

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavLink } from "@/lib/nav";

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="rounded-sm border border-line px-3 py-2 font-display text-sm font-bold uppercase"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="absolute inset-x-0 top-16 border-b border-line bg-bg px-4 pb-6 pt-2">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block border-b border-line py-4 font-display text-2xl font-bold uppercase"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/sponsors#inquire"
            onClick={close}
            className="mt-6 block rounded-sm bg-accent px-5 py-3 text-center font-display text-lg font-bold uppercase text-bg"
          >
            Become a Sponsor
          </Link>
        </nav>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create `src/components/Header.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { ButtonLink } from "./ButtonLink";
import { MobileNav } from "./MobileNav";

export function Header() {
  const site = getSite();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`} className="relative block h-10 w-36">
          <Image src={site.logo} alt="" fill priority sizes="144px" className="object-contain object-left" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-lg font-bold uppercase tracking-wide text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
        </nav>
        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create `src/components/LogoWall.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { getCar, getSponsors } from "@/lib/content";
import { groupSponsors } from "@/lib/sponsors";

export function LogoWall({ size = "sm" }: { size?: "sm" | "lg" }) {
  const groups = groupSponsors(getSponsors());

  if (groups.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line p-6 text-center">
        <p className="font-display text-2xl font-bold uppercase">Your logo here</p>
        <p className="mt-1 text-sm text-muted">Join the {getCar().buildSeason} partners powering car #51.</p>
        <Link href="/sponsors#inquire" className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4">
          Become a sponsor
        </Link>
      </div>
    );
  }

  const box = size === "lg" ? "h-20 w-44" : "h-12 w-28";
  return (
    <div className="space-y-8" data-testid="logo-wall">
      {groups.map((group) => (
        <div key={group.tier}>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {group.sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative block ${box} opacity-80 transition-opacity hover:opacity-100`}
                >
                  <Image src={sponsor.logo} alt={sponsor.name} fill sizes="176px" className="object-contain brightness-0 invert" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 9: Create `src/components/Footer.tsx`**

```tsx
import { getSite } from "@/lib/content";
import { LogoWall } from "./LogoWall";

export function Footer() {
  const site = getSite();
  const link = "transition-colors hover:text-ink";
  return (
    <footer className="border-t border-line bg-black/30">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="mb-8 text-center font-display text-2xl font-extrabold uppercase">Our partners</h2>
        <LogoWall />
        <div className="mt-14 grid gap-8 border-t border-line pt-10 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="font-display text-xl font-bold uppercase text-ink">{site.name}</p>
            <p className="mt-2">{site.tagline}</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Contact</p>
            <a href={`mailto:${site.email}`} className={`mt-2 block ${link}`}>
              {site.email}
            </a>
          </div>
          <div>
            <p className="font-semibold text-ink">Follow</p>
            <ul className="mt-2 space-y-1">
              <li>
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className={link}>
                  Instagram
                </a>
              </li>
              {site.socials.linkedin && (
                <li>
                  <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <a href={site.socials.linktree} target="_blank" rel="noopener noreferrer" className={link}>
                  Linktree
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted">
          Part of{" "}
          <a href="https://www.tamusae.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Texas A&amp;M SAE
          </a>
          . © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 10: Create `src/app/icon.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#500000",
          color: "#ffffff",
          fontSize: 24,
          fontWeight: 800,
        }}
      >
        B
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 11: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Inter, Saira_Condensed } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getSite } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const saira = Saira_Condensed({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-saira",
  display: "swap",
});

const site = getSite();

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${saira.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
        >
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 12: Build to verify the layout compiles**

Run: `npm run build`
Expected: "Content check passed." and a successful build. (The scaffold's home page still renders inside the new layout; Task 9 replaces it.)

- [ ] **Step 13: Commit**

```bash
git add src
git commit -m "feat: add theme tokens, fonts, header, mobile nav, footer, logo wall" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Home page and the page smoke tests

**Files:**
- Modify (replace): `src/app/page.tsx`
- Create: `src/components/Hero.tsx`, `src/components/CountUp.tsx`, `src/components/StatsStrip.tsx`, `src/components/CtaBand.tsx`, `src/components/PageHero.tsx`
- Test: `tests/e2e/pages.spec.ts`, `tests/e2e/motion.spec.ts`

- [ ] **Step 1: Write the page smoke tests (all routes; only `/` will pass after this task)**

Create `tests/e2e/pages.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  { path: "/", h1: /engineered to conquer/i },
  { path: "/sponsors", h1: /partner with texas a&m baja/i },
  { path: "/car", h1: /car/i },
  { path: "/team", h1: /team behind car #51/i },
  { path: "/give", h1: /support the team/i },
];

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    // Vercel Analytics' script only exists on Vercel; its 404 on localhost is expected.
    if (message.type() === "error" && !message.location().url.includes("/_vercel/")) {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

async function scrollToBottom(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }
  });
  await page.waitForLoadState("networkidle");
}

for (const route of ROUTES) {
  test(`${route.path} renders cleanly`, async ({ page }) => {
    const errors = collectErrors(page);
    const response = await page.goto(route.path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(route.h1);
    await scrollToBottom(page);
    const broken = await page.$$eval("img", (images) =>
      images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
    );
    expect(broken).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("every internal link resolves", async ({ page, request }) => {
  const hrefs = new Set<string>();
  for (const route of ROUTES) {
    await page.goto(route.path);
    const found = await page.$$eval("a[href^='/']", (links) => links.map((link) => link.getAttribute("href") ?? "/"));
    for (const href of found) hrefs.add(href.split("#")[0] || "/");
  }
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status(), href).toBe(200);
  }
});

test("unknown routes show the branded 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/wrong turn/i);
});

test("mobile menu opens, navigates, and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile" });
  await expect(menu.getByRole("link", { name: "Sponsors" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});
```

Create `tests/e2e/motion.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("stats show final values immediately when reduced motion is on", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const stats = page.getByRole("region", { name: "Team highlights" });
  await stats.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(stats.locator("[data-countup]").first()).toHaveText("100+");
});
```

- [ ] **Step 2: Run the home smoke test to verify it fails**

Run: `npx playwright test tests/e2e/pages.spec.ts -g "/ renders cleanly" --project=desktop`
Expected: FAIL — h1 does not match `/engineered to conquer/i` (scaffold page).

- [ ] **Step 3: Create `src/components/CountUp.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { easeOutExpo, formatCount, parseCountable } from "@/lib/countup";

export function CountUp({ value, durationMs = 1800 }: { value: string; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const countable = parseCountable(value);
    const element = ref.current;
    if (!countable || !element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          setDisplay(formatCount(countable, countable.target * easeOutExpo(t)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(formatCount(countable, 0));
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, durationMs]);

  return (
    <>
      <span ref={ref} aria-hidden="true" data-countup>
        {display}
      </span>
      <span className="sr-only">{value}</span>
    </>
  );
}
```

- [ ] **Step 4: Create `src/components/StatsStrip.tsx`**

```tsx
import { CountUp } from "./CountUp";

export function StatsStrip({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section aria-label="Team highlights" className="border-y border-line bg-line">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col bg-panel px-4 py-8 text-center">
            <dt className="mt-2 text-sm text-muted">{stat.label}</dt>
            <dd className="order-first font-display text-5xl font-extrabold text-accent">
              <CountUp value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 5: Create `src/components/Hero.tsx`**

```tsx
import Image from "next/image";
import type { Site } from "@/lib/schemas";
import { ButtonLink } from "./ButtonLink";
import { Eyebrow } from "./Section";

export function Hero({ site }: { site: Site }) {
  return (
    <section className="relative isolate flex min-h-[85vh] items-end overflow-hidden">
      <Image
        src={site.heroImage}
        alt="Texas A&M Baja SAE car racing off-road"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {site.heroVideo && (
        <video
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={site.heroImage}
          aria-hidden="true"
        >
          <source src={site.heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 to-bg/10" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Eyebrow>{site.name}</Eyebrow>
        <h1 className="max-w-4xl font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">
          {site.tagline}
        </h1>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
          <ButtonLink href="/car" variant="secondary">
            Meet the Car
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create `src/components/CtaBand.tsx`**

```tsx
import { ButtonLink } from "./ButtonLink";

export function CtaBand({ title, body, packetPdf }: { title: string; body: string; packetPdf?: string }) {
  return (
    <section className="slash-top bg-maroon px-4 pb-20 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
          {packetPdf && (
            <ButtonLink href={packetPdf} variant="secondary" download>
              Download the packet
            </ButtonLink>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create `src/components/PageHero.tsx`** (used by the inner pages)

```tsx
import Image from "next/image";
import { Eyebrow } from "./Section";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      {image && (
        <>
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg to-bg/40" />
        </>
      )}
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg text-muted">{intro}</p>}
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Replace `src/app/page.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Hero } from "@/components/Hero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { StatsStrip } from "@/components/StatsStrip";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { newestFirst, ordinal } from "@/lib/format";
import type { Season } from "@/lib/schemas";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Texas A&M Baja SAE — Engineered to conquer the toughest terrain",
  description:
    "Texas A&M Baja SAE designs, builds, and races a new off-road car every year against 100+ universities. Sponsor the team behind car #51.",
  path: "/",
  absolute: true,
});

export default function HomePage() {
  const site = getSite();
  const car = getCar();
  const recent = newestFirst(getSeasons())
    .filter((season): season is Season & { overall: number } => season.overall !== null)
    .slice(0, 3);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}${site.logo}`,
    email: site.email,
    sameAs: [site.socials.instagram, site.socials.linktree, ...(site.socials.linkedin ? [site.socials.linkedin] : [])],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }} />
      <Hero site={site} />
      <StatsStrip stats={site.homeStats} />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <SectionHeading>Built by Aggies. Raced in the dirt.</SectionHeading>
            <div className="mt-6 space-y-4 text-lg text-muted">
              {site.mission.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={site.teamPhoto} alt="Texas A&M Baja SAE team members" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section className="bg-panel/40">
        <Eyebrow>Why sponsor</Eyebrow>
        <SectionHeading>What your support gets you</SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {site.sponsorPillars.map((pillar) => (
            <article key={pillar.title} className="rounded-sm border border-line bg-panel p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{pillar.title}</h3>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/sponsors">See sponsorship tiers</ButtonLink>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-sm">
            <Image src={car.photo} alt={`The Texas A&M Baja ${car.season} car`} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Eyebrow>{car.season} car</Eyebrow>
            <SectionHeading>Meet the car</SectionHeading>
            <dl className="mt-6 grid grid-cols-2 gap-4">
              {car.specs.slice(0, 4).map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs uppercase tracking-[0.2em] text-muted">{spec.label}</dt>
                  <dd className="font-display text-2xl font-bold uppercase">{spec.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8">
              <ButtonLink href="/car" variant="secondary">
                Full specs
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-panel/40">
        <Eyebrow>Results</Eyebrow>
        <SectionHeading>Racing against 100+ universities</SectionHeading>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {recent.map((season) => (
            <li key={season.season} className="rounded-sm border border-line bg-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{season.season}</p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase">{season.event}</p>
              <p className="mt-3 font-display text-5xl font-extrabold text-accent">{ordinal(season.overall)}</p>
              <p className="text-xs uppercase tracking-wide text-muted">Overall</p>
              {season.highlights[0] && <p className="mt-3 text-sm text-muted">{season.highlights[0]}</p>}
            </li>
          ))}
        </ul>
        <Link href="/car#history" className="mt-8 inline-block font-semibold text-accent underline underline-offset-4">
          Full competition history
        </Link>
      </Section>

      <CtaBand
        title="Put your name on the car"
        body="Join the companies helping Aggie engineers design, build, and race car #51."
        packetPdf={site.packetPdf}
      />
    </>
  );
}
```

- [ ] **Step 9: Run the home tests to verify they pass**

Run: `npx playwright test tests/e2e/pages.spec.ts tests/e2e/motion.spec.ts -g "(/ renders cleanly|reduced motion|mobile menu)"`
Expected: PASS for `/ renders cleanly` (desktop + mobile), the reduced-motion test, and the mobile-menu test (desktop run skipped).

- [ ] **Step 10: Look at it**

Run `npm run start` (after the build), open `http://localhost:3000` in the built-in browser at desktop and mobile (375 px) widths, and take screenshots. Check: headline readable over the photo, stats strip aligned, no horizontal scroll on mobile. Fix spacing issues before committing.

- [ ] **Step 11: Commit**

```bash
git add src tests/e2e
git commit -m "feat: build home page with hero, stats, mission, car and results teasers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Sponsors page with tiers, FAQ, milestones, and the inquiry form

**Files:**
- Create: `src/app/sponsors/page.tsx`
- Create: `src/components/TierCard.tsx`, `src/components/Faq.tsx`, `src/components/MilestoneTimeline.tsx`, `src/components/InquiryForm.tsx`
- Test: `tests/e2e/inquiry.spec.ts`

- [ ] **Step 1: Write the failing form tests**

Create `tests/e2e/inquiry.spec.ts`:

```ts
import { expect, test, type Page, type Route } from "@playwright/test";

const ENDPOINT = "https://api.web3forms.com/submit";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function mockEndpoint(page: Page, handler: (route: Route) => Promise<void>) {
  await page.route(ENDPOINT, async (route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers: CORS });
    return handler(route);
  });
}

async function fillForm(page: Page) {
  await page.getByLabel("Your name").fill("Jordan Smith");
  await page.getByLabel("Company or organization").fill("Acme Gear");
  await page.getByLabel("Work email").fill("jordan@acme.com");
  await page.getByLabel("What are you interested in?").selectOption("gold");
  await page.getByLabel("Message (optional)").fill("We'd like to sponsor.");
}

test("empty submit shows every error and sends nothing", async ({ page }) => {
  let sent = false;
  await mockEndpoint(page, async (route) => {
    sent = true;
    await route.fulfill({ status: 200, headers: CORS, json: { success: true } });
  });
  await page.goto("/sponsors#inquire");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Enter your name.")).toBeVisible();
  await expect(page.getByText("Enter your company or organization.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  await expect(page.getByText("Choose what you're interested in.")).toBeVisible();
  expect(sent).toBe(false);
});

test("a tier card's Choose link preselects that tier", async ({ page }) => {
  await page.goto("/sponsors");
  await page.getByRole("link", { name: "Choose Gold" }).click();
  await expect(page).toHaveURL(/interest=gold/);
  await expect(page.getByLabel("What are you interested in?")).toHaveValue("gold");
});

test("successful submit sends the right payload and confirms", async ({ page }) => {
  let payload: Record<string, unknown> | undefined;
  await mockEndpoint(page, async (route) => {
    payload = route.request().postDataJSON();
    await route.fulfill({ status: 200, headers: CORS, json: { success: true, message: "ok" } });
  });
  await page.goto("/sponsors");
  await fillForm(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("message received");
  expect(payload).toMatchObject({
    access_key: "e2e-test-key",
    company: "Acme Gear",
    interest: "Gold sponsorship",
    subject: "Baja sponsor inquiry — Acme Gear (Gold sponsorship)",
  });
});

test("failed submit offers a prefilled email fallback", async ({ page }) => {
  await mockEndpoint(page, async (route) => {
    await route.fulfill({ status: 400, headers: CORS, json: { success: false } });
  });
  await page.goto("/sponsors");
  await fillForm(page);
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("link", { name: "Email it to us instead" })).toHaveAttribute(
    "href",
    /^mailto:baja\.sae\.tamu@gmail\.com\?subject=/,
  );
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test tests/e2e/inquiry.spec.ts --project=desktop`
Expected: FAIL — `/sponsors` returns 404.

- [ ] **Step 3: Create `src/components/TierCard.tsx`**

```tsx
import Link from "next/link";
import type { Tier } from "@/lib/schemas";

export function TierCard({ tier, lowerTierName }: { tier: Tier; lowerTierName?: string }) {
  return (
    <article
      aria-labelledby={`tier-${tier.id}`}
      className="flex flex-col rounded-sm border border-line bg-panel p-6"
      style={{ borderTop: `4px solid ${tier.badgeColor}` }}
    >
      <h3 id={`tier-${tier.id}`} className="font-display text-3xl font-extrabold uppercase">
        {tier.name}
      </h3>
      <p className="mt-1 font-display text-2xl font-bold text-accent">{tier.priceLabel}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">
              ▸
            </span>
            {benefit}
          </li>
        ))}
        {lowerTierName && (
          <li className="flex gap-2 text-muted">
            <span aria-hidden="true">+</span>
            Everything in {lowerTierName}
          </li>
        )}
      </ul>
      <Link
        href={`/sponsors?interest=${tier.id}#inquire`}
        scroll={false}
        className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-accent underline underline-offset-4 hover:text-ink"
      >
        Choose {tier.name}
      </Link>
    </article>
  );
}
```

Note: `scroll={false}` stops Next from scrolling to the top; the browser then honors `#inquire`. If the form does not scroll into view in Step 9's manual check, remove `scroll={false}`.

- [ ] **Step 4: Create `src/components/Faq.tsx`**

```tsx
import type { FaqItem } from "@/lib/schemas";

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <details key={item.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl font-bold uppercase [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden="true" className="text-2xl text-accent transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/components/MilestoneTimeline.tsx`**

```tsx
import { formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";

const LABELS = { done: "✓ Done", next: "Up next", upcoming: "Upcoming" } as const;

export function MilestoneTimeline({ milestones, today = new Date() }: { milestones: Milestone[]; today?: Date }) {
  const items = withStatus(milestones, today);
  return (
    <ol className="grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.name}
          data-status={item.status}
          className={`bg-panel p-5 ${item.status === "next" ? "outline-2 -outline-offset-2 outline-accent" : ""}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${item.status === "next" ? "text-accent" : "text-muted"}`}>
            {LABELS[item.status]}
          </p>
          <p className="mt-1 font-display text-2xl font-bold uppercase">{item.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatMilestoneDate(item.date)}
            {item.tentative ? " (tentative)" : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 6: Create `src/components/InquiryForm.tsx`**

```tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type ChangeEvent, type FormEvent } from "react";
import {
  EMPTY_INQUIRY,
  INTERESTS,
  buildMailto,
  buildPayload,
  interestFromQuery,
  validateInquiry,
  type InquiryErrors,
  type InquiryFields,
  type InterestId,
} from "@/lib/inquiry";

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const INPUT =
  "w-full rounded-sm border border-line bg-bg px-3 py-3 text-ink placeholder:text-muted/70 focus:border-accent";

type Status = "idle" | "sending" | "success" | "error";
type Props = { accessKey: string; email: string };

function Field({
  id,
  label,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}

function InquiryFormInner({ accessKey, email, initialInterest }: Props & { initialInterest: InterestId | "" }) {
  const [fields, setFields] = useState<InquiryFields>({ ...EMPTY_INQUIRY, interest: initialInterest });
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  const update =
    (name: keyof InquiryFields) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFields((current) => ({ ...current, [name]: value }));
      setErrors((current) => ({ ...current, [name]: undefined }));
    };

  const describedBy = (key: keyof InquiryErrors) => (errors[key] ? `${key}-error` : undefined);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateInquiry(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (fields.botcheck) {
      setStatus("success");
      return;
    }
    if (!accessKey) {
      window.location.href = buildMailto(email, fields);
      return;
    }
    setStatus("sending");
    try {
      const response = await fetch(WEB3FORMS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload(fields, accessKey)),
      });
      const data = (await response.json()) as { success?: boolean };
      setStatus(response.ok && data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-sm border border-accent bg-panel p-8">
        <p className="font-display text-3xl font-extrabold uppercase">Thanks — message received.</p>
        <p className="mt-2 text-muted">We&apos;ll reply within 2 business days from {email}.</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Field id="name" label="Your name" error={errors.name}>
        <input id="name" name="name" autoComplete="name" value={fields.name} onChange={update("name")} aria-invalid={!!errors.name} aria-describedby={describedBy("name")} className={INPUT} />
      </Field>
      <Field id="company" label="Company or organization" error={errors.company}>
        <input id="company" name="company" autoComplete="organization" value={fields.company} onChange={update("company")} aria-invalid={!!errors.company} aria-describedby={describedBy("company")} className={INPUT} />
      </Field>
      <Field id="email" label="Work email" error={errors.email}>
        <input id="email" name="email" type="email" autoComplete="email" value={fields.email} onChange={update("email")} aria-invalid={!!errors.email} aria-describedby={describedBy("email")} className={INPUT} />
      </Field>
      <Field id="interest" label="What are you interested in?" error={errors.interest}>
        <select id="interest" name="interest" value={fields.interest} onChange={update("interest")} aria-invalid={!!errors.interest} aria-describedby={describedBy("interest")} className={INPUT}>
          <option value="" disabled>
            Choose one…
          </option>
          {INTERESTS.map((interest) => (
            <option key={interest.id} value={interest.id}>
              {interest.label}
            </option>
          ))}
        </select>
      </Field>
      <Field id="message" label="Message (optional)" className="sm:col-span-2">
        <textarea id="message" name="message" rows={5} value={fields.message} onChange={update("message")} className={INPUT} />
      </Field>
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        checked={fields.botcheck === "on"}
        onChange={(event) => setFields((current) => ({ ...current, botcheck: event.target.checked ? "on" : "" }))}
      />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-sm bg-accent px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-bg transition-colors hover:bg-ink disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send inquiry"}
        </button>
        <p className="text-sm text-muted">
          Prefer email?{" "}
          <a href={`mailto:${email}`} className="text-accent underline underline-offset-2">
            {email}
          </a>
        </p>
      </div>
      <div aria-live="polite" className="sm:col-span-2">
        {status === "error" && (
          <p className="text-sm text-red-300">
            Something went wrong sending your message.{" "}
            <a href={buildMailto(email, fields)} className="font-semibold underline">
              Email it to us instead
            </a>{" "}
            — your details will be filled in.
          </p>
        )}
      </div>
    </form>
  );
}

function InquiryFormFromUrl(props: Props) {
  const params = useSearchParams();
  const initialInterest = interestFromQuery(new URLSearchParams(params.toString()));
  return <InquiryFormInner key={initialInterest} {...props} initialInterest={initialInterest} />;
}

export function InquiryForm(props: Props) {
  return (
    <Suspense fallback={<InquiryFormInner {...props} initialInterest="" />}>
      <InquiryFormFromUrl {...props} />
    </Suspense>
  );
}
```

- [ ] **Step 7: Create `src/app/sponsors/page.tsx`**

```tsx
import { ButtonLink } from "@/components/ButtonLink";
import { Faq } from "@/components/Faq";
import { InquiryForm } from "@/components/InquiryForm";
import { LogoWall } from "@/components/LogoWall";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { TierCard } from "@/components/TierCard";
import { getCar, getFaq, getSite, getTiers } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sponsor the team",
  description:
    "Sponsorship tiers from $500, in-kind partnerships, and recruiting access to Texas A&M engineers. Put your logo on car #51.",
  path: "/sponsors",
});

export default function SponsorsPage() {
  const site = getSite();
  const { tiers, inKindCategories } = getTiers();
  const car = getCar();
  const faq = getFaq();
  // E2E_WEB3FORMS_KEY is only set by playwright.config.ts for tests.
  const accessKey = process.env.E2E_WEB3FORMS_KEY || site.web3formsKey;

  return (
    <>
      <PageHero
        eyebrow="Sponsorship"
        title="Partner with Texas A&M Baja"
        intro="Put your brand on a car designed, built, and raced by Aggie engineers, and meet the students behind it."
      />

      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {site.sponsorPillars.map((pillar) => (
            <div key={pillar.title} className="border-t-2 border-accent pt-5">
              <h2 className="font-display text-3xl font-extrabold uppercase">{pillar.title}</h2>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="tiers" className="bg-panel/40">
        <Eyebrow>Financial sponsorship</Eyebrow>
        <SectionHeading>Sponsorship tiers</SectionHeading>
        <p className="mt-4 max-w-2xl text-muted">
          Each tier includes everything in the tiers below it. Packages are a starting point. We&apos;ll shape one around your goals.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} lowerTierName={index > 0 ? tiers[index - 1].name : undefined} />
          ))}
        </div>
        <div className="mt-10 rounded-sm border border-line bg-panel p-6 sm:p-8">
          <h3 className="font-display text-3xl font-extrabold uppercase">Technical and in-kind donations</h3>
          <p className="mt-2 text-muted">Parts, tools, software, machining, and services keep the car moving. We gratefully accept:</p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {inKindCategories.map((category) => (
              <div key={category.name}>
                <dt className="font-semibold">{category.name}</dt>
                <dd className="mt-1 text-sm text-muted">{category.examples}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <ButtonLink href="/sponsors?interest=inkind#inquire" variant="secondary">
              Offer an in-kind donation
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>{car.buildSeason} season</Eyebrow>
        <SectionHeading>Where your logo goes</SectionHeading>
        <p className="mt-4 max-w-2xl text-muted">
          Sponsors who commit early ride on the car from first drive through Rollout and competition.
        </p>
        <div className="mt-8">
          <MilestoneTimeline milestones={car.milestones} />
        </div>
      </Section>

      <Section className="bg-panel/40">
        <SectionHeading>Current partners</SectionHeading>
        <div className="mt-10">
          <LogoWall size="lg" />
        </div>
      </Section>

      <Section>
        <SectionHeading>Sponsor FAQ</SectionHeading>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>

      <Section id="inquire" className="bg-panel/40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Get started</Eyebrow>
            <SectionHeading>Become a sponsor</SectionHeading>
            <p className="mt-4 text-muted">
              Tell us a little about your company and we&apos;ll follow up with next steps. Want the full details first? Download our sponsorship packet.
            </p>
            <div className="mt-6">
              <ButtonLink href={site.packetPdf} variant="secondary" download>
                Download the packet (PDF)
              </ButtonLink>
            </div>
          </div>
          <InquiryForm accessKey={accessKey} email={site.email} />
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 8: Run the sponsors tests to verify they pass**

Run: `npx playwright test tests/e2e/inquiry.spec.ts tests/e2e/pages.spec.ts -g "(Send|Choose|submit|/sponsors renders)"`
Expected: PASS on desktop and mobile.

- [ ] **Step 9: Look at it**

Open `http://localhost:3000/sponsors` in the built-in browser (desktop and 375 px). Check: four tier cards align, the "Up next" milestone is outlined, FAQ items open and close, clicking "Choose Gold" lands on the form with Gold selected.

- [ ] **Step 10: Commit**

```bash
git add src tests/e2e/inquiry.spec.ts
git commit -m "feat: add sponsors page with tiers, milestones, FAQ, and inquiry form" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Car page with specs, subsystems, build timeline, and history

**Files:**
- Create: `src/app/car/page.tsx`, `src/components/SeasonTimeline.tsx`

- [ ] **Step 1: Run the car smoke test to verify it fails**

Run: `npx playwright test tests/e2e/pages.spec.ts -g "/car renders" --project=desktop`
Expected: FAIL — 404.

- [ ] **Step 2: Create `src/components/SeasonTimeline.tsx`**

```tsx
import Image from "next/image";
import { ordinal } from "@/lib/format";
import type { Season } from "@/lib/schemas";

export function SeasonTimeline({ seasons }: { seasons: Season[] }) {
  return (
    <ol className="space-y-6 border-l-2 border-line pl-6 sm:pl-10">
      {seasons.map((season) => (
        <li key={season.season} className="relative">
          <span aria-hidden="true" className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-2 border-accent bg-bg sm:-left-[49px]" />
          <div className="gap-6 rounded-sm border border-line bg-panel p-5 sm:flex sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{season.season}</p>
              <h3 className="mt-1 font-display text-3xl font-extrabold uppercase">{season.event}</h3>
              <p className="text-sm text-muted">{season.location}</p>
              {season.highlights.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {season.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-sm bg-panel-2 px-2 py-1 text-xs">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              {season.photo && (
                <div className="relative mt-4 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-sm">
                  <Image src={season.photo} alt={`Texas A&M Baja ${season.season} car`} fill sizes="384px" className="object-cover" />
                </div>
              )}
            </div>
            {season.overall !== null && (
              <p className="mt-4 shrink-0 sm:mt-0 sm:text-right">
                <span className="block font-display text-5xl font-extrabold text-accent">{ordinal(season.overall)}</span>
                <span className="text-xs uppercase tracking-wide text-muted">
                  Overall{season.fieldSize ? ` of ${season.fieldSize}` : ""}
                </span>
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 3: Create `src/app/car/page.tsx`**

```tsx
import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { PageHero } from "@/components/PageHero";
import { SeasonTimeline } from "@/components/SeasonTimeline";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { newestFirst } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The car",
  description:
    "Specs, subsystems, build timeline, and every competition result for Texas A&M Baja SAE's off-road cars.",
  path: "/car",
});

export default function CarPage() {
  const car = getCar();
  const site = getSite();
  const seasons = newestFirst(getSeasons());

  return (
    <>
      <PageHero
        eyebrow={`${car.season} · Car #51`}
        title={car.name}
        intro={car.summary}
        image={car.photo}
        imageAlt={`The Texas A&M Baja ${car.season} car`}
      />

      <Section>
        <SectionHeading>Specs</SectionHeading>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-4">
          {car.specs.map((spec) => (
            <div key={spec.label} className="flex flex-col bg-panel p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{spec.label}</dt>
              <dd className="mt-2 font-display text-2xl font-bold uppercase">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="bg-panel/40">
        <SectionHeading>Subsystems</SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {car.subsystems.map((subsystem) => (
            <article key={subsystem.name} className="overflow-hidden rounded-sm border border-line bg-panel">
              {subsystem.photo && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={subsystem.photo}
                    alt={`${subsystem.name} on the ${car.season} car`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display text-2xl font-extrabold uppercase">{subsystem.name}</h3>
                <p className="mt-2 text-sm text-muted">{subsystem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>{car.buildSeason} build</Eyebrow>
        <SectionHeading>Building the next car</SectionHeading>
        <div className="mt-8">
          <MilestoneTimeline milestones={car.milestones} />
        </div>
      </Section>

      <Section id="history" className="bg-panel/40">
        <Eyebrow>Racing since 2018</Eyebrow>
        <SectionHeading>Competition history</SectionHeading>
        <div className="mt-10">
          <SeasonTimeline seasons={seasons} />
        </div>
      </Section>

      <CtaBand
        title="Put your name on the next car"
        body={`The ${car.buildSeason} car is being designed now. Partner with us to ride on it at Rollout and competition.`}
        packetPdf={site.packetPdf}
      />
    </>
  );
}
```

- [ ] **Step 4: Run the car smoke test to verify it passes**

Run: `npx playwright test tests/e2e/pages.spec.ts -g "/car renders"`
Expected: PASS (desktop + mobile).

- [ ] **Step 5: Look at it**

Open `/car` at desktop and 375 px. Check: timeline dots sit on the line, placings align right on desktop and below on mobile.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat: add car page with specs, subsystems, build timeline, and history" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Team page

**Files:**
- Create: `src/app/team/page.tsx`, `src/components/LeadCard.tsx`
- Modify: `tests/e2e/inquiry.spec.ts` (add resume-book test)

- [ ] **Step 1: Add the failing resume-book test**

Append to `tests/e2e/inquiry.spec.ts`:

```ts
test("the team page's resume-book link preselects recruiting", async ({ page }) => {
  await page.goto("/team");
  await page.getByRole("link", { name: "Request our resume book" }).click();
  await expect(page).toHaveURL(/interest=recruiting/);
  await expect(page.getByLabel("What are you interested in?")).toHaveValue("recruiting");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test -g "(resume-book|/team renders)" --project=desktop`
Expected: FAIL — `/team` 404.

- [ ] **Step 3: Create `src/components/LeadCard.tsx`**

```tsx
import Image from "next/image";
import { initials } from "@/lib/format";
import type { Lead } from "@/lib/schemas";

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li className="flex gap-4 rounded-sm border border-line bg-panel p-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-maroon">
        {lead.photo ? (
          <Image src={lead.photo} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-2xl font-extrabold">
            {initials(lead.name)}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold uppercase leading-tight">{lead.name}</p>
        <p className="text-sm text-accent">{lead.role}</p>
        <p className="text-sm text-muted">
          {lead.major} · Class of {lead.classYear}
        </p>
        {lead.linkedin && (
          <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm underline underline-offset-2">
            LinkedIn<span className="sr-only"> profile of {lead.name}</span>
          </a>
        )}
      </div>
    </li>
  );
}
```

- [ ] **Step 4: Create `src/app/team/page.tsx`**

```tsx
import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadCard } from "@/components/LeadCard";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { getSite, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The team",
  description:
    "Meet the Aggie engineers and business students who design, build, test, and fund Texas A&M Baja SAE's car every year.",
  path: "/team",
});

export default function TeamPage() {
  const team = getTeam();
  const site = getSite();

  return (
    <>
      <PageHero
        eyebrow="The team"
        title="The team behind car #51"
        intro="Aggie engineers and business students who design, build, test, and fund a new off-road car every year."
      />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading>Our story</SectionHeading>
            <div className="mt-6 space-y-4 text-lg text-muted">
              {team.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={site.teamPhoto} alt="Texas A&M Baja SAE team group photo" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      {team.leads.length > 0 && (
        <Section className="bg-panel/40">
          <SectionHeading>Leadership</SectionHeading>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.leads.map((lead) => (
              <LeadCard key={lead.name} lead={lead} />
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <SectionHeading>Subteams</SectionHeading>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
          {team.subteams.map((subteam) => (
            <li key={subteam.name} className="bg-panel p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{subteam.name}</h3>
              <p className="mt-1 text-sm text-muted">{subteam.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="slash-top bg-maroon px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Hiring engineers?</h2>
            <p className="mt-3 text-white/85">Sponsors get our resume book and can recruit at team meetings.</p>
            <div className="mt-6">
              <ButtonLink href="/sponsors?interest=recruiting#inquire">Request our resume book</ButtonLink>
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Want to join?</h2>
            <p className="mt-3 text-white/85">Open to every major and class year. Applications run through Texas A&amp;M SAE.</p>
            <div className="mt-6">
              <ButtonLink href="https://apply.tamusae.org/" variant="secondary" external>
                Join the team
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx playwright test -g "(resume-book|/team renders)"`
Expected: PASS (desktop + mobile).

- [ ] **Step 6: Commit**

```bash
git add src tests/e2e/inquiry.spec.ts
git commit -m "feat: add team page with story, leads, subteams, and recruiting CTAs" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Give page and 404

**Files:**
- Create: `src/app/give/page.tsx`, `src/app/not-found.tsx`

- [ ] **Step 1: Run tests to verify they fail**

Run: `npx playwright test tests/e2e/pages.spec.ts -g "(/give renders|404)" --project=desktop`
Expected: FAIL — `/give` 404 with the default Next.js not-found page (h1 does not match).

- [ ] **Step 2: Create `src/app/give/page.tsx`**

```tsx
import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Give",
  description:
    "Support Texas A&M Baja SAE with a tax-deductible gift through the Texas A&M Foundation, by check, or with in-kind donations.",
  path: "/give",
});

export default function GivePage() {
  const { giving, email } = getSite();
  const card = "rounded-sm border border-line bg-panel p-6 sm:p-8";

  return (
    <>
      <PageHero
        eyebrow="Give"
        title="Support the team"
        intro="Every gift helps buy materials, cover competition fees, and get car #51 to the start line. Gifts go through the Texas A&M Foundation and are tax-deductible."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className={card}>
            <h2 className="font-display text-3xl font-extrabold uppercase">Give online</h2>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-muted">
              {giving.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">Account code</p>
            <p className="font-display text-4xl font-extrabold text-accent">{giving.accountCode}</p>
            <div className="mt-6">
              <ButtonLink href={giving.foundationUrl} external>
                Give through the Foundation
              </ButtonLink>
            </div>
          </article>
          <article className={card}>
            <h2 className="font-display text-3xl font-extrabold uppercase">Give by check</h2>
            <p className="mt-5 text-muted">
              Make checks payable to <strong className="text-ink">{giving.checkPayableTo}</strong> and mail to:
            </p>
            <address className="mt-4 not-italic text-lg">
              {giving.checkAddress.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </article>
        </div>
        <div className="mt-8 rounded-sm border border-dashed border-line p-6 sm:p-8">
          <h2 className="font-display text-3xl font-extrabold uppercase">Donating parts, tools, or services?</h2>
          <p className="mt-2 text-muted">Machining, materials, software, and discounts all help build the car.</p>
          <div className="mt-6">
            <ButtonLink href="/sponsors?interest=inkind#inquire" variant="secondary">
              Offer an in-kind donation
            </ButtonLink>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted">
          Questions about giving? Email{" "}
          <a href={`mailto:${email}`} className="text-accent underline underline-offset-2">
            {email}
          </a>
          .
        </p>
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Create `src/app/not-found.tsx`**

```tsx
import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">Wrong turn</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">You&apos;re off course. This page doesn&apos;t exist.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/sponsors" variant="secondary">
          Sponsor the team
        </ButtonLink>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npm run test:e2e`
Expected: every test PASSES on desktop and mobile (mobile-menu test skipped on desktop), including "every internal link resolves".

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat: add give page and branded 404" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: SEO — sitemap, robots, and Open Graph images

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/lib/og.tsx`
- Create: `src/app/opengraph-image.tsx`, `src/app/sponsors/opengraph-image.tsx`, `src/app/car/opengraph-image.tsx`, `src/app/team/opengraph-image.tsx`, `src/app/give/opengraph-image.tsx`
- Test: `tests/e2e/seo.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/e2e/seo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("sitemap lists every page on the production domain", async ({ request }) => {
  const body = await (await request.get("/sitemap.xml")).text();
  for (const path of ["", "/sponsors", "/car", "/team", "/give"]) {
    expect(body).toContain(`<loc>https://tamubaja.com${path}</loc>`);
  }
});

test("robots.txt allows crawling and points at the sitemap", async ({ request }) => {
  const body = await (await request.get("/robots.txt")).text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://tamubaja.com/sitemap.xml");
});

for (const path of ["/", "/sponsors", "/car", "/team", "/give"]) {
  test(`${path} has a description, canonical URL, and a working share image`, async ({ page, request }) => {
    await page.goto(path);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /^https:\/\/tamubaja\.com/);
    const image = await page.locator('meta[property="og:image"]').first().getAttribute("content");
    expect(image).toBeTruthy();
    const response = await request.get(new URL(image!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/png");
  });
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx playwright test tests/e2e/seo.spec.ts --project=desktop`
Expected: FAIL — `/sitemap.xml` 404 and no `og:image`.

- [ ] **Step 3: Create `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

const PAGES = [
  { path: "", priority: 1 },
  { path: "/sponsors", priority: 0.9 },
  { path: "/car", priority: 0.7 },
  { path: "/team", priority: 0.7 },
  { path: "/give", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSite().url;
  return PAGES.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
```

- [ ] **Step 4: Create `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${getSite().url}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Create `src/lib/og.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

export function renderOg(title: string, kicker = "Texas A&M Baja SAE") {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          background: "#14181d",
          color: "#ffffff",
          borderBottom: "24px solid #500000",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#9fb3c8", textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1, marginTop: 16, textTransform: "uppercase" }}>{title}</div>
      </div>
    ),
    ogSize,
  );
}
```

- [ ] **Step 6: Create the five Open Graph image routes**

`src/app/opengraph-image.tsx`:

```tsx
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Texas A&M Baja SAE — Engineered to conquer the toughest terrain";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Engineered to conquer the toughest terrain");
}
```

`src/app/sponsors/opengraph-image.tsx`:

```tsx
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Sponsor Texas A&M Baja SAE";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Sponsor car #51");
}
```

`src/app/car/opengraph-image.tsx`:

```tsx
import { ogSize, renderOg } from "@/lib/og";

export const alt = "The Texas A&M Baja SAE car";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("The car and our results");
}
```

`src/app/team/opengraph-image.tsx`:

```tsx
import { ogSize, renderOg } from "@/lib/og";

export const alt = "The Texas A&M Baja SAE team";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("The team behind car #51");
}
```

`src/app/give/opengraph-image.tsx`:

```tsx
import { ogSize, renderOg } from "@/lib/og";

export const alt = "Give to Texas A&M Baja SAE";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Support the team");
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx playwright test tests/e2e/seo.spec.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src tests/e2e/seo.spec.ts
git commit -m "feat: add sitemap, robots, canonical URLs, and per-page share images" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Lighthouse audit and fixes

**Files:**
- Create: `scripts/lighthouse.mjs`

- [ ] **Step 1: Create `scripts/lighthouse.mjs`**

```js
// Runs Lighthouse (mobile emulation) against `npm run start` on port 3000.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const PAGES = ["/", "/sponsors", "/car", "/team", "/give"];
const MINIMUMS = { performance: 0.9, accessibility: 0.95, seo: 0.95 };
const outDir = path.join(process.cwd(), ".lighthouse");
fs.mkdirSync(outDir, { recursive: true });

let failed = false;
for (const page of PAGES) {
  const name = page === "/" ? "home" : page.slice(1);
  const out = path.join(outDir, `${name}.json`);
  execFileSync(
    "npx",
    [
      "--yes",
      "lighthouse",
      `http://localhost:3000${page}`,
      "--only-categories=performance,accessibility,seo",
      "--output=json",
      `--output-path=${out}`,
      "--quiet",
      '--chrome-flags="--headless=new"',
    ],
    { stdio: "inherit", shell: true },
  );
  const report = JSON.parse(fs.readFileSync(out, "utf8"));
  const below = Object.entries(MINIMUMS).filter(([key, min]) => report.categories[key].score < min);
  const summary = Object.keys(MINIMUMS)
    .map((key) => `${key} ${Math.round(report.categories[key].score * 100)}`)
    .join(" · ");
  console.log(`${below.length ? "FAIL" : "PASS"} ${page}: ${summary}`);
  if (below.length) failed = true;
}
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run the audit**

In one terminal: `npm run build && npm run start`. In another: `npm run lighthouse`.
Expected: one PASS/FAIL line per page. Target: all PASS.

- [ ] **Step 3: Fix anything below threshold**

For each failing page, open `.lighthouse/<page>.json`, read `audits` with `score < 1` in the failing category, fix the cause in code or assets, rebuild, and re-run. Common fixes:
- LCP too slow → confirm the hero/page-hero image has `priority`; reduce the JPG (re-run Task 4 Step 4 with `thumbnail((1920, 1920))` and `quality=78`).
- Contrast failure → use `text-ink` or `text-muted` only; never `text-maroon` on dark backgrounds.
- "Links do not have a discernible name" → add visible text or `aria-label`.
Re-run until every page passes. Stop and report if a page still fails after two fix attempts.

- [ ] **Step 4: Re-run unit and e2e suites**

Run: `npm test && npm run test:e2e`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lighthouse.mjs src public
git commit -m "perf: add Lighthouse audit script and meet performance/accessibility targets" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16 (optional): Compressed hero video

Skip this task if `ffmpeg -version` fails; the hero falls back to the photo automatically.

**Files:**
- Create: `public/video/hero.mp4`
- Modify: `content/site.yaml` (add `heroVideo`)

- [ ] **Step 1: Download the source video**

Using the Drive connector, download `Business/Content/9.26.26SAE-BMW.mov` (≈274 MB) into `_incoming/`.

- [ ] **Step 2: Compress a 12-second silent loop**

```bash
mkdir -p public/video
ffmpeg -y -ss 00:00:05 -t 12 -i "_incoming/9.26.26SAE-BMW.mov" -vf "scale=1920:-2,fps=30" -an -c:v libx264 -preset slow -crf 28 -pix_fmt yuv420p -movflags +faststart public/video/hero.mp4
ls -l public/video/hero.mp4
```
Expected: file ≤ 5 MB. If larger, re-run with `scale=1280:-2` and `-crf 30`. Watch the result (open it in the built-in browser) and pick a different `-ss` start time if the clip is not mostly car action.

- [ ] **Step 3: Reference it in `content/site.yaml`**

Add under `heroImage:`:

```yaml
heroVideo: /video/hero.mp4
```

- [ ] **Step 4: Verify**

Run: `npm run validate && npx playwright test tests/e2e/pages.spec.ts -g "/ renders cleanly"`
Expected: "Content check passed." and PASS.

- [ ] **Step 5: Commit**

```bash
git add public/video content/site.yaml
git commit -m "feat: add compressed hero video loop" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 17: CI and weekly redeploy workflows

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/weekly-redeploy.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run validate
      - run: npm test
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Create `.github/workflows/weekly-redeploy.yml`**

```yaml
# Rebuilds the site every Monday so build milestones flip to "Done" on time.
# Needs repo secret VERCEL_DEPLOY_HOOK (see HANDOFF.md).
name: Weekly redeploy
on:
  schedule:
    - cron: "0 11 * * 1"
  workflow_dispatch:
jobs:
  redeploy:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel deploy hook
        run: curl -fsS -X POST "$HOOK"
        env:
          HOOK: ${{ secrets.VERCEL_DEPLOY_HOOK }}
```

- [ ] **Step 3: Validate the YAML parses**

Run: `npx --yes js-yaml .github/workflows/ci.yml > /dev/null && npx --yes js-yaml .github/workflows/weekly-redeploy.yml > /dev/null && echo ok`
Expected: `ok`.

- [ ] **Step 4: Commit**

```bash
git add .github
git commit -m "ci: add test workflow and weekly redeploy for milestone dates" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 18: Documentation for maintainers

**Files:**
- Modify (replace): `README.md`
- Create: `EDITING.md`, `HANDOFF.md`

- [ ] **Step 1: Replace `README.md`**

~~~~markdown
# tamubaja.com

Sponsor website for Texas A&M Baja SAE. Next.js + Tailwind, hosted on Vercel.

- **Editing content (no coding):** see [EDITING.md](EDITING.md)
- **Accounts and ownership:** see [HANDOFF.md](HANDOFF.md)
- **Design spec:** `docs/superpowers/specs/2026-10-05-tamu-baja-sponsor-site-design.md`

## Develop

```bash
npm install
npm run dev          # http://localhost:3000
```

## Check

```bash
npm run validate     # content files + referenced images/PDFs
npm test             # unit tests
npm run test:e2e     # browser tests (builds and starts the site)
npm run lighthouse   # needs `npm run start` running in another terminal
```

## Deploy

Every push to `main` deploys automatically on Vercel. A failed build never replaces the live site.
~~~~

- [ ] **Step 2: Create `EDITING.md`**

~~~~markdown
# Editing the website (no coding needed)

Everything that changes season to season lives in the **`content/`** folder. You edit those files right on GitHub; the site rebuilds itself in about a minute.

**Safety net:** if an edit has a mistake, the update is rejected and the live site stays exactly as it was. You'll see a red ✗ next to your commit on GitHub; click it to read a plain-English message like:

```
Problem in content/sponsors.yaml:
  • item 3 → tier: Invalid option: expected one of "platinum"|"gold"|"silver"|"bronze"|"inkind"
```

Fix the line it names and save again.

## How to edit any file on GitHub

1. Open the repository on github.com and click the **`content`** folder.
2. Click the file (for example `sponsors.yaml`).
3. Click the **pencil icon** (Edit this file) in the top-right of the file view.
4. Make your change. Keep the same indentation (two spaces) as the lines around it.
5. Click **Commit changes…**, write a short message like "Add Acme as Gold sponsor", and click **Commit changes**.
6. Wait about a minute, then refresh tamubaja.com.

## Add a sponsor to the logo wall

Only do this after the sponsor has said yes to showing their logo.

1. Get their logo as a **PNG with a transparent background** or an **SVG**. Name it in lowercase with dashes, like `acme-gear.png`.
2. Upload it: open the **`public/sponsors`** folder → **Add file** → **Upload files** → drag the file in → **Commit changes**.
3. Edit `content/sponsors.yaml` and add a block at the end:

```yaml
- name: Acme Gear
  tier: gold
  logo: /sponsors/acme-gear.png
  url: https://www.acmegear.com
  show: true
```

`tier` must be one of `platinum`, `gold`, `silver`, `bronze`, `inkind`. Logos appear white on the dark site automatically.

**Never** put dollar amounts or a sponsor's contact info in these files. The repository may be public.

## Hide a sponsor

Change their `show: true` to `show: false`. Their logo disappears from every page.

## Add a competition result

Edit `content/seasons.yaml` and add a block at the **top**:

```yaml
- season: 2025–26
  event: Baja SAE Oregon
  location: Washougal, Oregon
  overall: 12
  highlights:
    - 5th Hill Climb
```

Use `overall: null` if there was no overall placing. Only add results the team has confirmed.

## Update the current car or next season's milestones

Edit `content/car.yaml`. Dates are written `YYYY-MM-DD`. The site marks milestones **Done / Up next / Upcoming** by itself every Monday, so you never change status by hand.

## Add or change a team lead

Get the person's OK first. Edit `content/team.yaml` under `leads:`:

```yaml
leads:
  - name: Jordan Smith
    role: Project Manager
    major: Mechanical Engineering
    classYear: "2027"
    linkedin: https://www.linkedin.com/in/jordan-smith
```

For a photo, upload a square JPG to `public/images/team/` and add `photo: /images/team/jordan-smith.jpg`. Without a photo, their initials are shown.

## Replace the sponsor packet PDF

Upload the new PDF to `public/packet/` with the **same file name** (`tamu-baja-sponsor-packet-2026-27.pdf`), or upload it with a new name and update `packetPdf:` in `content/site.yaml`. Keep it under 5 MB.

## Change tier prices or benefits

Edit `content/tiers.yaml`. Keep the tiers in order: bronze, silver, gold, platinum.

## Change the sponsor-form email key

The form sends to the team inbox through Web3Forms. If the key ever changes, paste the new one into `web3formsKey:` in `content/site.yaml`.
~~~~

- [ ] **Step 3: Create `HANDOFF.md`**

~~~~markdown
# Handoff checklist

Pass this to the next business lead every spring. Every account is tied to the team inbox, never a personal email.

| What | Where | Owner login | Notes |
|---|---|---|---|
| Team inbox | baja.sae.tamu@gmail.com | Business lead + project manager | Receives sponsor inquiries |
| Code | GitHub organization `tamu-baja`, repo `tamubaja.com` | Team inbox owns the org; business lead + PM are owners | Transfer ownership before graduating |
| Hosting | Vercel project `tamubaja-com` | Team inbox account | Web Analytics enabled; deploy hook used by the weekly workflow |
| Domain | tamubaja.com | Registered to the team inbox | Auto-renew ON; confirm the card on file each August |
| Form delivery | Web3Forms | Key issued to the team inbox | Key lives in `content/site.yaml` |
| Weekly rebuild | GitHub repo secret `VERCEL_DEPLOY_HOOK` | GitHub org owners | Recreate in Vercel → Settings → Git → Deploy Hooks if it stops |

## Every new season (August)
- [ ] Update `content/car.yaml` (new car specs + milestones)
- [ ] Add last season's result to `content/seasons.yaml`
- [ ] Refresh `content/sponsors.yaml` (`show: false` for sponsors who didn't renew)
- [ ] Upload the new sponsor packet
- [ ] Update `content/team.yaml` leads
- [ ] Confirm the domain auto-renew card
~~~~

- [ ] **Step 4: Commit**

```bash
git add README.md EDITING.md HANDOFF.md
git commit -m "docs: add README, non-coder editing guide, and handoff checklist" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 19: Final verification

- [ ] **Step 1: Run every check from a clean build**

```bash
rm -rf .next
npm run validate && npm test && npm run test:e2e
```
Expected: "Content check passed." (plus the web3formsKey warning until Task 20), all unit tests PASS, all e2e tests PASS.

- [ ] **Step 2: Run Lighthouse**

`npm run start` in one terminal, `npm run lighthouse` in another. Expected: PASS for all five pages.

- [ ] **Step 3: Visual pass**

In the built-in browser, screenshot every page at 1440 px and 375 px wide. Check against spec §4–§5: steel-and-maroon palette, Saira Condensed headlines, no horizontal scroll, no overlapping text. Fix and re-run Step 1 if anything changes.

- [ ] **Step 4: Report**

Summarize for the user: test counts, Lighthouse scores per page, screenshots, and the open launch blockers from spec §11.

---

### Task 20: Launch (business lead performs the account steps)

Claude prepares commands and checks results. The business lead does every step that creates an account, buys something, or uses a login.

- [ ] **Step 1 (business lead): Create the GitHub organization** `tamu-baja` while signed in to GitHub with the team inbox, and add the business lead and project manager as owners.

- [ ] **Step 2 (business lead runs, Claude may prepare): Push the repo**

```bash
gh repo create tamu-baja/tamubaja.com --private --source . --push
```

- [ ] **Step 3 (business lead): Connect Vercel.** At vercel.com, signed in with the team inbox: Add New → Project → import `tamu-baja/tamubaja.com` → Deploy. Then Project → Analytics → Enable Web Analytics.

- [ ] **Step 4 (business lead): Buy and connect the domain.** Vercel → Project → Settings → Domains → add `tamubaja.com` → buy it ($11.25/yr as of 2026-10-05) under the team account with auto-renew on. Add `www.tamubaja.com` redirecting to `tamubaja.com`.

- [ ] **Step 5 (business lead): Get the Web3Forms key.** At web3forms.com, enter `baja.sae.tamu@gmail.com`; the key arrives by email. Paste it into `content/site.yaml` → `web3formsKey:` and commit.

- [ ] **Step 6 (business lead): Create the deploy hook.** Vercel → Settings → Git → Deploy Hooks → name `weekly`, branch `main` → copy the URL → GitHub repo → Settings → Secrets and variables → Actions → New secret `VERCEL_DEPLOY_HOOK`. Then GitHub → Actions → Weekly redeploy → Run workflow, and confirm a new deployment appears in Vercel.

- [ ] **Step 7 (team): Clear the launch blockers in spec §11.** For each, edit the content file named:
  1. Correct Foundation giving URL and steps → `content/site.yaml` → `giving`.
  2. 2025–26 Oregon result → add to `content/seasons.yaml` (or leave it out).
  3. Founding phrasing → `content/team.yaml` → `story` and `content/site.yaml` → `mission`.
  4. Approved sponsors → upload logos to `public/sponsors/`, set `show: true`.
  5. Leads who consented → `content/team.yaml` → `leads`.
  6. Photo rights confirmed for every image in `public/images/`.

- [ ] **Step 8 (Claude): Live checks on https://tamubaja.com**
  - Open every page in the built-in browser; confirm HTTPS and no console errors.
  - With the business lead's OK, submit one real test inquiry (company "TEST — please ignore") and have them confirm it arrived in the team inbox.
  - Paste `https://tamubaja.com/sponsors` into a LinkedIn post draft or https://www.opengraph.xyz to confirm the share image.

- [ ] **Step 9 (business lead): Phone check** on an iPhone (Safari) and an Android phone (Chrome): open each page, tap Become a Sponsor, open the menu.

- [ ] **Step 10 (Claude, after launch): Add screenshots to EDITING.md.** Capture the GitHub pencil-icon edit view and the Commit changes dialog for `content/sponsors.yaml`, save them as `docs/editing/edit-file.png` and `docs/editing/commit.png`, and insert them under "How to edit any file on GitHub":

```markdown
![The pencil icon opens the editor](docs/editing/edit-file.png)
![Commit changes saves and publishes](docs/editing/commit.png)
```

Commit with message `docs: add GitHub editing screenshots`.
