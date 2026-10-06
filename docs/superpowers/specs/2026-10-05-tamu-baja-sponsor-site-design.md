# Texas A&M Baja SAE — Sponsor Website Design Spec

- **Date:** 2026-10-05
- **Owner:** Business lead, Texas A&M Baja SAE
- **Status:** Design approved; awaiting spec review → implementation plan
- **Target domain:** `tamubaja.com` (available at $11.25/yr as of 2026-10-05; not yet purchased)
- **Launch target:** ~2 weeks from plan approval (support the fall 2026 sponsor push)

---

## 1. Goal and success criteria

**Primary job: win sponsors.** Recruiting, fans, and individual donors are secondary paths.

The site succeeds if:
1. A company contact who lands on the home page from an outreach email can, in under 60 seconds, understand who the team is, see credible results, see tier prices/benefits, and submit an inquiry or download the packet.
2. Inquiries arrive in `baja.sae.tamu@gmail.com` reliably.
3. A non-coder business lead can add a sponsor, update a result, or swap a team lead by editing one YAML file in GitHub's web editor — and a bad edit cannot take the live site down.
4. Lighthouse ≥ 90 performance, ≥ 95 accessibility on mobile for every page.

## 2. Decisions log

| Decision | Choice |
|---|---|
| Site type | Standalone site (not part of tamusae.org), modeled on tamuformulaelectric.com |
| Primary goal | Sponsor acquisition |
| Builder | Claude Code, from a spec + phased implementation plan |
| Stack | Next.js (current stable, App Router) + TypeScript + Tailwind CSS |
| Hosting | Vercel, auto-deploy from GitHub; all pages statically generated; no server-only features so `output: 'export'` stays a one-line switch to Cloudflare Pages / GitHub Pages |
| Content editing | YAML files in `/content`, validated at build time |
| Sponsor CTA | Short inquiry form → team inbox via Web3Forms, + packet PDF download, + mailto fallback |
| Money disclosure | Tier prices and benefits shown. No season budget, no fundraising progress bar, no individual sponsor amounts |
| Individual giving | Secondary "Give" page → Texas A&M Foundation instructions + check option |
| Team page | Leads + subteams + group photo + "Request resume book" CTA. No full roster |
| Pages | Home, Sponsors, Car (specs + results history), Team, Give, 404 |
| Colorway | "Steel & maroon" (see §5) |
| Fonts | Saira Condensed (headlines), Inter (body) |
| Analytics | Vercel Web Analytics (page views; privacy-friendly, no cookie banner) |

## 3. Audiences (in priority order)

1. **Corporate sponsor contacts** — engineering/recruiting/community-relations staff at companies like GM, CAT, Boeing, Vistra, Timken. Arrive from outreach emails or LinkedIn. Need: credibility, what they get, how much, how to start.
2. **Returning sponsors** — want to see their logo and that their support mattered.
3. **Individual donors** — parents, alumni, fans. Need: a clear, trustworthy way to give.
4. **Prospective members** — routed to `https://apply.tamusae.org/`.

## 4. Site map and page specs

### Global (every page)
- **Header:** logo (left); nav: Car · Team · Sponsors · Give; primary button **Become a Sponsor** → `/sponsors#inquire`. Sticky; collapses to a menu drawer on mobile.
- **Footer:** tiered sponsor logo wall (only sponsors with `show: true`; grouped Platinum → Gold → Silver → Bronze → In-Kind; logos link to sponsor sites, open in new tab); team email; Instagram `@tamu.baja.sae`, LinkedIn, Linktree; "Part of Texas A&M SAE" credit linking to `https://www.tamusae.org`; © year.

### `/` Home
1. **Hero** — full-bleed photo of car #51 (or compressed loop video ≤ ~5 MB with poster image), eyebrow "Texas A&M Baja SAE", headline "Engineered to conquer the toughest terrain.", buttons **Become a Sponsor** (primary) and **Meet the Car** (secondary).
2. **Stats strip** — 3–4 stats from `site.yaml`; purely numeric values (e.g., "9", "100+") count up on scroll, ordinal/text values (e.g., "3rd") render static (final value always in HTML; animation skipped under `prefers-reduced-motion`). Initial set: years competing, "100+ universities", "3rd — Acceleration '25", "4th — Design '24".
3. **Mission** — cleaned-up packet copy (§A.2) + team photo.
4. **Why sponsor** — 3 cards: Brand Exposure, Talent Pipeline, Tax-Deductible → link to `/sponsors`.
5. **Car teaser** — current car photo + 3–4 headline specs → `/car`.
6. **Results teaser** — best finishes → `/car#history`.
7. **Closing CTA band** (maroon) — "Put your name on the car." → Become a Sponsor / Download packet.

### `/sponsors` (the conversion page)
1. **Intro** — why sponsor us; 3 benefit pillars (Brand Exposure, Talent Acquisition, Tax Benefits) with packet copy cleaned up.
2. **Tier cards** — Bronze, Silver, Gold, Platinum from `tiers.yaml`: name, price range, metal-color badge, benefits list, "+ everything in [lower tier]". Each card has a "Choose [tier]" link that scrolls to the form with that tier pre-selected.
3. **Technical / in-kind card** — the four in-kind categories.
4. **Where your logo goes** — season milestones from `car.yaml` (design freeze, rolling car, Rollout, competition) with auto past/upcoming state.
5. **Current sponsors** — the same logo wall, larger, with tier headings.
6. **FAQ** — from `faq.yaml` (accordions; native `<details>`).
7. **`#inquire`** — packet PDF download button + inquiry form (§7.1) + "Prefer email? baja.sae.tamu@gmail.com".

### `/car`
1. **Current car hero** — photo, season label, headline specs.
2. **Spec grid** — weight, CG, weight distribution, chassis, powertrain, suspension (from `car.yaml`).
3. **Subsystems** — Chassis, Suspension, Powertrain, Controls/Electronics, Manufacturing: short descriptions + photo each.
4. **2026–27 build timeline** — milestones with done/upcoming state computed from today's date at build time.
5. **`#history`** — season-by-season timeline from `seasons.yaml`, newest first: season, event/location, overall place, highlight finishes, car photo if available. Unconfirmed results are omitted, not guessed.
6. CTA band → sponsors.

### `/team`
1. **Story** — founded from the Racing Apprentices program; development pipeline for engineering talent; open to all majors.
2. **Leads** — cards from `team.yaml`: photo (optional; fallback initials), name, role, major, class year, LinkedIn.
3. **Subteams** — Chassis, Suspension, Powertrain, Controls, Manufacturing, Business: one-line description each.
4. **Group photo.**
5. **Two CTAs:** "Request our resume book" → `/sponsors?interest=recruiting#inquire`; "Join the team" → `https://apply.tamusae.org/`.

### `/give`
1. Short "Support the team" intro; gifts are tax-deductible through the Texas A&M Foundation.
2. **Online** — numbered steps + button to the confirmed Foundation giving URL (§A.6), account **511361-20000**.
3. **By check** — payable to "Texas A&M Baja SAE"; mailing address from `site.yaml`.
4. **In-kind** — "Have parts, tools, or services to donate?" → `/sponsors#inquire` with interest = In-kind.

### `404`
On-brand "Wrong turn — you're off course." + links to Home and Sponsors.

### Out of scope for v1 (YAGNI)
News/blog, merch store, Rollout event page, newsletter signup, 3D car viewer, sponsor portal/login, online payments on-site, CMS, multiple languages.

## 5. Visual system

**Colorway — "Steel & maroon"**

| Token | Hex | Use |
|---|---|---|
| `--bg` | `#14181d` | Page base |
| `--panel` | `#1f252c` | Cards, stat strips |
| `--maroon` | `#500000` | Brand bands, CTA bands, hero diagonal (always with white text) |
| `--accent` | `#9FB3C8` | Numbers, eyebrows, links, focus rings |
| `--text` | `#ffffff` | Primary text |
| `--muted` | `#93a0ad` | Secondary text |
| Tier badges | Bronze `#9F6A3E`, Silver `#B3B7BA`, Gold `#EFE37F`, Platinum `#9EC8E0` | Tier cards & logo-wall headings only (from packet) |

- **Fonts:** Saira Condensed 800, uppercase, for headlines and big numbers; Inter 400/600 for body and UI. Loaded via `next/font` (self-hosted, no layout shift).
- **Motifs:** diagonal slash dividers (from the packet), thin rules, subtle scroll reveals. No glitch effects, no preloaders, no popups.
- **Sponsor logos:** displayed as monochrome white on dark (CSS filter or provided white variants) for visual consistency; full color on hover is optional.
- **Contrast:** all text pairs must meet WCAG AA; maroon is never used for text on the dark base.
- **Motion:** respect `prefers-reduced-motion` everywhere.

## 6. Content model (`/content`)

All files are YAML. A build-time loader (`js-yaml` + `zod`) validates every file; a schema error fails the build with a human-readable message, and Vercel keeps serving the last successful deploy.

| File | Contents |
|---|---|
| `site.yaml` | name, tagline, email, socials (instagram, linkedin, linktree), packetPdf path, giving (foundationUrl, accountCode, checkPayableTo, checkAddress), homeStats[] (value, label), web3formsKey |
| `sponsors.yaml` | list of { name, tier: platinum\|gold\|silver\|bronze\|inkind, logo (path under `/public/sponsors/`), url, show: boolean } |
| `tiers.yaml` | list of { id, name, priceLabel, badgeColor, benefits[] } + inKindCategories[] { name, examples } |
| `seasons.yaml` | list of { season, event, location, overall (number or null), fieldSize (optional), highlights[], photo (optional) } |
| `car.yaml` | current car { season, photo, specs[] {label, value}, subsystems[] {name, description, photo} } + milestones[] { name, date } |
| `team.yaml` | leads[] { name, role, major, classYear, linkedin, photo (optional) } + subteams[] { name, description } |
| `faq.yaml` | list of { q, a } |

**Rules encoded in data:**
- A sponsor appears anywhere on the site **only** if `show: true` (set after the sponsor approves logo use).
- Milestone done/upcoming state is computed from the build date — no manual toggling. (A scheduled weekly redeploy keeps it current; Vercel deploy hook + GitHub Actions cron.)
- No dollar amounts per sponsor exist anywhere in the content files.

**`EDITING.md`** (repo root) — plain-English, screenshot-illustrated guides: add a sponsor, hide a sponsor, add a season result, change a team lead, replace the packet PDF, what to do if the build fails.

## 7. Behavior and integrations

### 7.1 Sponsor inquiry form
- Fields: name*, company*, email*, interest* (Platinum, Gold, Silver, Bronze, In-kind donation, Recruiting / resume book, Other), message.
- `?interest=` query param and tier "Choose" links preselect interest.
- Client-side validation with inline errors; honeypot field for spam.
- Submits via `fetch` to Web3Forms (`https://api.web3forms.com/submit`) using the public access key from `site.yaml`; subject line "Baja sponsor inquiry — {company} ({interest})".
- States: idle → sending → success ("Thanks — we'll reply within 2 business days") / error (message + mailto fallback link prefilled with their entries).
- **Prerequisite:** whoever controls `baja.sae.tamu@gmail.com` generates the free Web3Forms access key.

### 7.2 Analytics
Vercel Web Analytics via `@vercel/analytics`. Page views only in v1.

### 7.3 SEO / sharing
Per-page `<title>` and meta description; Open Graph + Twitter card image per page (static images in `/public/og/`); `sitemap.xml`; `robots.txt`; JSON-LD `Organization` on home; canonical URLs on `https://tamubaja.com`.

### 7.4 Performance
`next/image` with explicit sizes; hero video (if used) compressed to ≤ ~5 MB H.264 MP4 (+ WebM), muted, looped, `preload="metadata"`, poster image, not loaded on `prefers-reduced-data`/small screens (poster only); packet PDF ≤ 5 MB.

### 7.5 Accessibility
Skip link, semantic landmarks, alt text on all images (sponsor logos: alt = sponsor name), keyboard-operable nav drawer and accordions, visible focus rings, form labels and `aria-live` status messages.

## 8. Hosting, ownership, handoff
- GitHub **organization** owned by the team email (e.g., `tamu-baja`), repo `tamubaja.com`. Business lead and project manager as org owners.
- Vercel project connected to the repo under a team-email account; production branch `main`.
- Domain `tamubaja.com` registered to the team email with auto-renew. (Purchase is done by the team, not by Claude.)
- `README.md` covers local dev; `EDITING.md` covers content edits; a `HANDOFF.md` checklist lists every account and who owns it.

## 9. Testing and verification
1. **Content validation** — zod schemas run on `next build`; a unit test feeds known-bad YAML and asserts a readable error.
2. **Playwright smoke suite** — every route renders with no console errors; nav links resolve; no broken internal links/images; inquiry form shows validation errors on empty submit and shows success against a mocked Web3Forms endpoint; tier "Choose" link preselects interest; reduced-motion disables count-up.
3. **Lighthouse** (mobile) on all pages: perf ≥ 90, a11y ≥ 95, SEO ≥ 95.
4. **Manual** — real phone check (iOS Safari + Android Chrome); one live test inquiry received in the team inbox before launch.

## 10. Schedule (≈2 weeks)
| Days | Work |
|---|---|
| 1–3 | Repo, Next.js + Tailwind scaffold, design tokens, fonts, layout (header/footer/logo wall), content loader + schemas, seed YAML |
| 4–8 | Pages: Home, Sponsors (incl. form), Car, Team, Give, 404 |
| 9–11 | Real assets (photos, logos, compressed video, packet), SEO/OG, analytics, tests, Lighthouse fixes |
| 12–14 | Domain + DNS, launch checklist, live test inquiry, go live |

## 11. Launch blockers (team must confirm)
1. **Foundation giving instructions** — three versions exist (§A.6). Confirm the single correct URL + steps.
2. **2025–26 result** (Oregon, May 2026) — unconfirmed; omit until confirmed.
3. **Founding year** — 2017 (team formed) vs 2018 (packet / first competition). Pick one phrasing.
4. **Sponsor logo approvals** — set `show: true` only for approved sponsors; collect vector/transparent logos.
5. **Team-page consent** — each lead approves their name/photo/LinkedIn.
6. **Domain purchased** and **Web3Forms key** generated.
7. **Photo rights** — do not use the packet's jump photo showing other teams' cars (#124, #27) unless rights are confirmed.

---

## Appendix A — Source facts (research 2026-10-05)

Sources: team sponsor packet PDF (26-27), team Google Drive "Business" folder, https://www.tamusae.org/baja, Texas A&M Engineering News, Texas A&M Foundation articles.

### A.1 Identity
- Name: Texas A&M Baja SAE (part of Texas A&M SAE / TAMU SAE). Car number #51.
- Email: baja.sae.tamu@gmail.com · Instagram: @tamu.baja.sae · Linktree: linktr.ee/tamu.baja.sae · Current page: tamusae.org/baja.
- Tagline (tamusae.org): "Engineered to conquer the toughest terrain."
- Not to be confused with Texas A&M University–**Kingsville**'s Baja team.

### A.2 Mission copy (from packet; clean up for web)
Collegiate engineering design team that builds a custom off-road vehicle each year and competes at an international competition. Originally founded as a development program for the Formula team; identifies high-potential undergraduates and gives them tools, mentorship, and real-world experience to make an immediate impact in the automotive industry.

### A.3 History
- Formed Spring 2017 from the Texas A&M Racing Apprentices program (27 students); first competition Baja SAE Kansas, May 2018. (Engineering News, 2018.)
- 2019–20: moved to 4WD; competed in virtual events.
- Press: Texas A&M Foundation "Racing by Design" (Fall 2020); Engineering News Q&A (Mar 2026); Foundation feature "Discover life on the Texas A&M Baja team" (May 2026).

### A.4 Results (source: tamusae.org/baja unless noted)
| Season | Event | Overall | Highlights |
|---|---|---|---|
| 2017–18 | Kansas | 33rd (of 95) | 7th maneuverability, 25th acceleration, 26th design |
| 2018–19 | California | 52nd | 9th cost, 16th sales |
| 2019–20 | Virtual | 16th | Team-record finish; 4WD |
| 2020–21 | Virtual | — | 8th of 156, Virtual Knowledge Event |
| 2021–22 | Tennessee | 27th | Strong static events |
| 2022–23 | Oregon | 44th | Top 40 design, cost, sales |
| 2023–24 | Williamsport, PA | 18th | 4th design |
| 2024–25 | Maryland | 31st | 3rd acceleration (first podium) |
| 2025–26 | Oregon (Washougal) | **Unconfirmed** | — |
Packet headline: "Competition results against 100+ universities": 3rd Acceleration, 4th Design, 18th Overall, 17th Hill Climb, Top 25 Endurance (aggregated across 2024–2026; attribute per season on the site).

### A.5 Current car (2025–26, from Drive "Sponsorship Slide Deck")
354.4 lb dry (chassis 84.6, powertrain 117, suspension 118.1); 21.7" CG; 47/53 weight distribution; 4130 chromoly chassis; carbon-fiber seat and body; custom 2-stage reduction gearbox with carburized 8620 gears; titanium axles; electronic CVT (~80% less inertia than off-the-shelf); front double A-arm, rear semi-trailing arm; 13–13.5" travel. Tools: SolidWorks, ANSYS, LotusShark, Star-CCM+.
**2026–27 milestones:** IDR1 Aug 9 · IDR2 Sep 13 · EDR1 Oct 25 · EDR2 Nov 15 · Design Freeze Nov 22 · Rolling Car Feb 14 · Driving Car Feb 28 · SAE Rollout Apr 18 (tentative) · Competition May 20.
**Competition events:** static — Design, Cost, Business; dynamic — Acceleration, Hill Climb, Maneuverability, Suspension & Traction, 4-hr Endurance.

### A.6 Sponsorship tiers & giving (packet p.5–6, verified)
| Tier | Price | Benefits (cumulative) |
|---|---|---|
| Bronze | $500–1,499 | Social media post; small logo on car and website |
| Silver | $1,500–4,999 | Access to team resume bank; medium logo |
| Gold | $5,000–9,999 | Baja SAE merchandise; recruit at team meetings; large logo |
| Platinum | $10,000+ | Invitation to vehicle testing; dedicated recognition at SAE Rollout |
In-kind categories: Technology & Software; Tools & Equipment; Materials & Supplies; Support Services (travel, food/catering, logistics).
Other packet benefits: brand exposure (car, uniforms, promo materials, media); tax-deductible donations + invitation to "Team Rollout"; talent acquisition.
**Giving — conflicting instructions (launch blocker):**
- Packet: txamfoundation.com/give.aspx → "Select a Unit or College" → "An Unlisted Account" → account 511361-20000.
- tamusae.org/sponsors: give.aspx → "Student Organization Gifts" → 511361-20000 in gift notes.
- 27 Tracker: `https://myaggieland.txamfoundation.com/tamf/give`. Formula Electric uses the pattern `https://myaggieland.txamfoundation.com/tamf/give?key=UNLISTED&unlistedAccount=<Team Name> (511361-60000)` — Baja's equivalent with 511361-20000 is likely current but must be confirmed.
- Check: payable to Texas A&M Baja SAE; ATTN: Dr. Saripalli, 3123 TAMU, College Station, TX 77843.

### A.7 Sponsors (for logo wall — names only; amounts intentionally excluded)
Recurring/recent supporters per team records include GM, Haas Foundation, Caterpillar, Bray International, Vistra, Boeing, Tesla, L3Harris, Tidal Power, Texas A&M Mechanical Engineering, U.S. Sprocket & Gear, AFCO, QA1, GMN Bearings, Houston Heat Treat, Gates, Rapid Harness, KISSsoft, RAMSIS, Polymaker, Racebox, Rock West Composites, Primeweld, Trailbrake, Moteus, Taylor Race, BAM Machining Group, Action Machine, Rust Nail Racing, Michigan Scientific. **None may be shown until approved (`show: true`).** Source of truth for status: Drive → Business → Sponsor Outreach → "27 Sponsor Tracker" (Google Sheet).

### A.8 Assets (Google Drive → "Business" folder)
- `Media Resources/Logos/`: BajaLogo.png, BajaLogoSmall.png, BajaLogoTransparentMaroon.png, BajaLogoTransparentWhite.png, "Texas A&M Society of Automotive Engineers.png".
- `Media Resources/2026 Car Photos/9.26.26BAJA-BMW/`: 14 JPGs (DSC02157 … DSC02247).
- `Media Resources/Archive/`: 14 mixed images.
- `Content/9.26.26SAE-BMW.mov` (274 MB) — compress for hero loop.
- `Baja_Background.png`.
- Packet PDF (26-27) — images: car #51 hero, team group photo, pit/inspection, shop work. Packet has typos to avoid copying ("RECIEVE", "AQUISITION").

## Appendix B — Reference-site lessons
- **tamuformulaelectric.com** (sibling team; Next.js, self-hosted): copy — cumulative tier cards, tiered logo wall in every footer, packet + form CTA pair, per-car spec presentation, Foundation giving. Improve on — prices hidden in PDF only, hero has no headline/CTA, Google Form inquiry, no analytics, hardcoded content needing a developer, inconsistent stats, 33 MB hero video, merch popup distraction.
- **gladiatordash.com** (One Army charity mud run; static HTML on GitHub Pages): copy — count-up impact stat with no-JS fallback, logo wall link to sponsors page, sponsor FAQ, title-sponsor feature block, reduced-motion respect, disciplined CSS-variable palette. Improve on — no inquiry form, no packet download.
