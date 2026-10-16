import Image from "next/image";
import Link from "next/link";
import { getCar, getSponsors, getTiers } from "@/lib/content";
import type { Sponsor } from "@/lib/schemas";
import { groupSponsors, monoLogoPath, type SponsorGroup } from "@/lib/sponsors";

function TierHeading({ group, color, as: Heading }: { group: SponsorGroup; color: string; as: "h2" | "h3" }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span aria-hidden="true" className="h-6 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      <Heading id={`sponsor-tier-${group.tier}`} className="font-display text-3xl font-extrabold uppercase">
        {group.label}
      </Heading>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        {group.sponsors.length} {group.sponsors.length === 1 ? "partner" : "partners"}
      </span>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

/** Bigger tiers get taller cells and fewer columns, so every tier uses the same wall format. */
const WALL: Record<SponsorGroup["tier"], { height: string; logo: string; maxCols: number }> = {
  platinum: { height: "h-44", logo: "h-20", maxCols: 4 },
  gold: { height: "h-40", logo: "h-16", maxCols: 5 },
  silver: { height: "h-36", logo: "h-14", maxCols: 5 },
  bronze: { height: "h-32", logo: "h-12", maxCols: 5 },
  inkind: { height: "h-32", logo: "h-12", maxCols: 5 },
};

const LG_COLS = ["", "lg:grid-cols-1", "lg:grid-cols-2", "lg:grid-cols-3", "lg:grid-cols-4", "lg:grid-cols-5"];
const SM_COLS = ["", "sm:grid-cols-1", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-3", "sm:grid-cols-3"];

/**
 * One tier as a wall of cells in the site's dark palette. Logos sit in soft white; hovering a cell
 * lights it up and shows the logo in full color (white-artwork logos keep a dark cell).
 */
function LogoWall({ sponsors, tier }: { sponsors: Sponsor[]; tier: SponsorGroup["tier"] }) {
  const layout = WALL[tier];
  const cols = Math.min(sponsors.length, layout.maxCols);
  return (
    <ul className={`grid grid-cols-2 overflow-hidden rounded-md border-l border-t border-line bg-panel ${SM_COLS[cols]} ${LG_COLS[cols]}`}>
      {sponsors.map((sponsor) => {
        const dark = sponsor.tile === "dark";
        return (
          <li key={sponsor.name} className="shadow-[inset_-1px_-1px_0_var(--color-line)]">
            <a
              href={sponsor.url}
              {...external}
              title={sponsor.name}
              data-sponsor-tile
              className={`group relative flex flex-col items-center justify-center gap-3 px-5 transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${layout.height} ${
                dark ? "hover:bg-[#0b0e11] focus-visible:bg-[#0b0e11]" : "hover:bg-white focus-visible:bg-white"
              }`}
            >
              <span className={`relative block w-full ${layout.logo}`}>
                <Image
                  src={monoLogoPath(sponsor.logo)}
                  alt=""
                  fill
                  sizes="220px"
                  className="object-contain opacity-75 transition-opacity duration-300 group-hover:opacity-0 group-focus-visible:opacity-0"
                />
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  fill
                  sizes="220px"
                  className="object-contain opacity-0 transition duration-300 group-hover:scale-105 group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              </span>
              <span
                className={`absolute inset-x-0 bottom-3 truncate px-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors ${
                  dark ? "group-hover:text-white/70" : "group-hover:text-bg/60"
                }`}
              >
                {sponsor.name}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Sponsors by tier, every tier in the same logo-wall format (higher tiers get bigger cells). `featured` shows only the top tiers plus a link to all.
 */
export function SponsorGrid({ headingLevel = "h3", featured = false }: { showNames?: boolean; headingLevel?: "h2" | "h3"; featured?: boolean }) {
  const all = groupSponsors(getSponsors());
  if (all.length === 0) return <EmptyWall />;
  const colors: Record<string, string> = Object.fromEntries(getTiers().tiers.map((tier) => [tier.id, tier.badgeColor]));
  colors.inkind = "var(--color-accent)";
  const groups = featured ? all.filter((group) => ["platinum", "gold", "silver"].includes(group.tier)) : all;
  const total = all.reduce((sum, group) => sum + group.sponsors.length, 0);
  const shown = groups.reduce((sum, group) => sum + group.sponsors.length, 0);

  return (
    <div className="space-y-16" data-testid="sponsor-grid">
      {groups.map((group) => {
        const color = colors[group.tier];
        return (
          <section key={group.tier} aria-labelledby={`sponsor-tier-${group.tier}`}>
            <TierHeading group={group} color={color} as={headingLevel} />
            <LogoWall sponsors={group.sponsors} tier={group.tier} />
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
