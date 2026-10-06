import { getSponsors } from "@/lib/content";
import { visibleSponsors } from "@/lib/sponsors";
import { PartnerLogoMarquee } from "./PartnerLogoMarquee";
import { EmptyWall } from "./SponsorGrid";
import { SponsorTile } from "./SponsorTile";

/**
 * Endless scrolling logo strip built on performative-ui's LogoMarquee, which renders the list
 * twice for a seamless loop. Because that second copy can't be hidden from screen readers,
 * every tile in the strip is decorative; the "See all our partners" link is the accessible route.
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
        logos={sponsors.map((sponsor) => ({
          kind: "node",
          node: <SponsorTile sponsor={sponsor} size="sm" decorative eager />,
        }))}
      />
      <style>{`@media (prefers-reduced-motion: reduce) { [data-testid="sponsor-marquee"] .pui-marquee__item:nth-child(n + ${sponsors.length + 1}) { display: none; } }`}</style>
    </div>
  );
}
