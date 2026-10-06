// Makes the single-color logos for the footer logo strip: public/sponsors/mono/<name>.png.
// Runs automatically before `npm run build` and `npm run dev`; the output is not committed.
//
// Each logo becomes white "ink" on a transparent background (the strip tints it grey with
// opacity). Near-white areas are cut out, so white lettering inside a colored badge stays
// readable. Logos marked `tile: dark` are white artwork, so for those near-black is cut out instead.
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { getSponsors } from "../src/lib/content";
import { monoLogoPath } from "../src/lib/sponsors";

const PUBLIC = path.join(process.cwd(), "public");

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

async function makeMono(source: string, target: string, lightArtwork: boolean) {
  const { data, info } = await sharp(source, { density: 300 })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(data.length, 255);
  for (let i = 0; i < data.length; i += 4) {
    const luminance = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
    const ink = lightArtwork ? smoothstep(0.08, 0.3, luminance) : 1 - smoothstep(0.82, 0.96, luminance);
    out[i + 3] = Math.round(data[i + 3] * ink);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  // Trim empty edges so the strip can size every logo by its visible shape.
  await sharp(out, { raw: info }).trim().png().toFile(target);
}

async function main() {
  let made = 0;
  for (const sponsor of getSponsors()) {
    const source = path.join(PUBLIC, sponsor.logo);
    if (!fs.existsSync(source)) continue; // the content check reports missing logos for shown sponsors
    await makeMono(source, path.join(PUBLIC, monoLogoPath(sponsor.logo)), sponsor.tile === "dark");
    made++;
  }
  console.log(`Made ${made} single-color logos for the footer strip.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
