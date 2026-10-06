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
