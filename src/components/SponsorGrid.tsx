import Link from "next/link";
import { getCar, getSponsors } from "@/lib/content";
import { groupSponsors } from "@/lib/sponsors";
import { SponsorTile, type TileSize } from "./SponsorTile";

const TILE_SIZE: Record<string, TileSize> = {
  platinum: "lg",
  gold: "lg",
  silver: "md",
  bronze: "sm",
  inkind: "sm",
};

export function SponsorGrid({
  showNames = false,
  headingLevel = "h3",
}: {
  showNames?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const groups = groupSponsors(getSponsors());
  if (groups.length === 0) return <EmptyWall />;
  const Heading = headingLevel;
  return (
    <div className="space-y-14" data-testid="sponsor-grid">
      {groups.map((group) => (
        <section key={group.tier} aria-labelledby={`sponsor-tier-${group.tier}`}>
          <Heading
            id={`sponsor-tier-${group.tier}`}
            className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted"
          >
            {group.label}
          </Heading>
          <ul className="flex flex-wrap justify-center gap-5">
            {group.sponsors.map((sponsor) => (
              <li key={sponsor.name} className="flex flex-col items-center gap-2">
                <SponsorTile sponsor={sponsor} size={TILE_SIZE[group.tier]} />
                {showNames && <span className="text-xs text-muted">{sponsor.name}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function EmptyWall() {
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
