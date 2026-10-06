import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { getSponsors } from "@/lib/content";
import type { Sponsor } from "@/lib/schemas";
import { monoLogoPath, visibleSponsors } from "@/lib/sponsors";
import { PartnerLogoMarquee } from "./PartnerLogoMarquee";
import { EmptyWall } from "./SponsorGrid";

/** Width ÷ height of a PNG, read from its header (the mono logos are made before every build). */
function aspectRatio(publicPath: string): number {
  try {
    const header = fs.readFileSync(path.join(process.cwd(), "public", publicPath)).subarray(16, 24);
    return header.readUInt32BE(0) / header.readUInt32BE(4);
  } catch {
    return 3;
  }
}

/**
 * Sizes a logo by its shape so every logo carries about the same visual weight:
 * wide wordmarks get shorter, square badges get taller.
 */
function logoSize(ratio: number) {
  const height = Math.round(Math.min(46, Math.max(20, 32 / Math.sqrt(ratio / 3))));
  const width = Math.min(150, Math.round(height * ratio));
  return { width, height: Math.round(width / ratio) };
}

function StripLogo({ sponsor }: { sponsor: Sponsor }) {
  const src = monoLogoPath(sponsor.logo);
  const { width, height } = logoSize(aspectRatio(src));
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      aria-hidden
      tabIndex={-1}
      data-sponsor-tile
      className="flex h-16 items-center"
    >
      <Image
        src={src}
        alt=""
        width={width}
        height={height}
        loading="eager"
        fetchPriority="low"
        // Inline so it beats performative-ui's `width: auto; height: 28px` for strip images.
        style={{ width, height }}
      />
    </a>
  );
}

/**
 * Endless scrolling logo strip built on performative-ui's LogoMarquee, which renders the list
 * twice for a seamless loop. Logos are single-color (see scripts/mono-logos.ts), sit muted grey,
 * and brighten on hover (styles in globals.css). Because the loop's second copy can't be hidden
 * from screen readers, every logo in the strip is decorative; the "See all our partners" link is
 * the accessible route.
 * With reduced motion the strip becomes a still, wrapped row of the originals (see globals.css).
 */
export function SponsorMarquee() {
  const sponsors = visibleSponsors(getSponsors());
  if (sponsors.length === 0) return <EmptyWall />;
  return (
    <div data-testid="sponsor-marquee">
      <p className="sr-only">Our partners&apos; logos scroll here. The link below lists every partner.</p>
      <PartnerLogoMarquee
        speed={Math.round(sponsors.length * 3.5)}
        logos={sponsors.map((sponsor) => ({ kind: "node", node: <StripLogo sponsor={sponsor} /> }))}
      />
      <style>{`@media (prefers-reduced-motion: reduce) { [data-testid="sponsor-marquee"] .pui-marquee__item:nth-child(n + ${sponsors.length + 1}) { display: none; } }`}</style>
    </div>
  );
}
