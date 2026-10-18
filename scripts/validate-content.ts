import fs from "node:fs";
import path from "node:path";
import {
  ContentError,
  getCar,
  getDevelopment,
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
attempt(getDevelopment);

if (site) {
  requireFile("site.yaml", "packetPdf", site.packetPdf);
  requireFile("site.yaml", "heroImage", site.heroImage);
  requireFile("site.yaml", "heroVideo", site.heroVideo);
  requireFile("site.yaml", "teamPhoto", site.teamPhoto);
  requireFile("site.yaml", "logo", site.logo);
  for (const pillar of site.sponsorPillars) requireFile("site.yaml", `sponsorPillars → ${pillar.title} → photo`, pillar.photo);
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
  for (const entry of car.garage) requireFile("car.yaml", `garage #${entry.number} → photo`, entry.photo);
  for (const m of car.milestones) requireFile("car.yaml", `milestone ${m.name} → photo`, m.photo);
  const seasonNames = new Set((seasons ?? []).map((season) => season.season));
  for (const entry of car.garage) {
    if (entry.season && seasons && !seasonNames.has(entry.season) && entry.season !== car.season) {
      problems.push(`Problem in content/car.yaml:\n  • garage #${entry.number} → season: "${entry.season}" doesn't match any season in seasons.yaml`);
    }
  }
}
for (const lead of team?.leads ?? []) requireFile("team.yaml", `${lead.name} → photo`, lead.photo);
for (const subteam of team?.subteams ?? []) {
  for (const person of [...subteam.leads, ...subteam.members]) {
    requireFile("team.yaml", `${subteam.name} → ${person.name} → photo`, person.photo);
  }
}

for (const warning of warnings) console.warn(`WARNING: ${warning}`);
if (problems.length) {
  console.error(`\nContent check failed. Fix these and try again:\n\n${problems.join("\n\n")}\n`);
  process.exit(1);
}
console.log("Content check passed.");
