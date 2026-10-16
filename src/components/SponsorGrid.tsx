import Link from "next/link";
import { getCar, getSponsors, getTiers } from "@/lib/content";
import { groupSponsors, type SponsorGroup } from "@/lib/sponsors";
import { SponsorTile, type TileSize } from "./SponsorTile";

const LAYOUT: Record<SponsorGroup["tier"], { size: TileSize; cols: string }> = {
  platinum: { size: "lg", cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" },
  gold: { size: "lg", cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" },
  silver: { size: "md", cols: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" },
  bronze: { size: "sm", cols: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" },
  inkind: { size: "sm", cols: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6" },
};

/**
 * Sponsor logos grouped by tier, each tier with its color bar and count.
 * `featured` shows only the top tiers plus a link to the full list (used above the tiers on /sponsors).
 */
export function SponsorGrid({
  showNames = false,
  headingLevel = "h3",
  featured = false,
}: {
  showNames?: boolean;
  headingLevel?: "h2" | "h3";
  featured?: boolean;
}) {
  const all = groupSponsors(getSponsors());
  if (all.length === 0) return <EmptyWall />;
  const tierColors = Object.fromEntries(getTiers().tiers.map((tier) => [tier.id, tier.badgeColor]));
  const groups = featured ? all.filter((group) => ["platinum", "gold", "silver"].includes(group.tier)) : all;
  const total = all.reduce((sum, group) => sum + group.sponsors.length, 0);
  const shown = groups.reduce((sum, group) => sum + group.sponsors.length, 0);
  const Heading = headingLevel;

  return (
    <div className="space-y-12" data-testid="sponsor-grid">
      {groups.map((group) => {
        const layout = LAYOUT[group.tier];
        return (
          <section key={group.tier} aria-labelledby={`sponsor-tier-${group.tier}`}>
            <div className="mb-5 flex items-center gap-3">
              <span aria-hidden="true" className="h-5 w-1.5 rounded-full" style={{ backgroundColor: tierColors[group.tier] ?? "var(--color-accent)" }} />
              <Heading id={`sponsor-tier-${group.tier}`} className="font-display text-2xl font-extrabold uppercase">
                {group.label}
              </Heading>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{group.sponsors.length}</span>
              <span aria-hidden="true" className="h-px flex-1 bg-line" />
            </div>
            <ul className={`grid gap-4 ${layout.cols}`}>
              {group.sponsors.map((sponsor) => (
                <li key={sponsor.name}>
                  <SponsorTile sponsor={sponsor} size={layout.size} showName={showNames} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {featured && total > shown && (
        <p className="text-center">
          <Link href="/partners" className="inline-flex items-center gap-2 font-semibold text-ink underline decoration-accent underline-offset-4 hover:text-accent">
            See all {total} partners, including our in-kind supporters <span aria-hidden="true">→</span>
          </Link>
        </p>
      )}
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
