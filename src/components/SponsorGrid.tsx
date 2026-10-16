import Image from "next/image";
import Link from "next/link";
import { getCar, getSponsors, getTiers } from "@/lib/content";
import type { Sponsor } from "@/lib/schemas";
import { groupSponsors, type SponsorGroup } from "@/lib/sponsors";

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

/** Top tiers: big cards with the logo on white, the name, and a link out. */
function SpotlightCard({ sponsor, color, size }: { sponsor: Sponsor; color: string; size: "xl" | "lg" }) {
  const dark = sponsor.tile === "dark";
  return (
    <a
      href={sponsor.url}
      {...external}
      data-sponsor-tile
      className="group flex h-full flex-col overflow-hidden rounded-md border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_24px_48px_-20px_rgb(0_0_0/85%)] focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span aria-hidden="true" className="h-1 w-full" style={{ backgroundColor: color }} />
      <span className={`relative block ${dark ? "bg-[#0b0e11]" : "bg-white"} ${size === "xl" ? "h-44 p-8" : "h-32 p-6"}`}>
        <span className="relative block h-full w-full">
          <Image src={sponsor.logo} alt={sponsor.name} fill sizes="(min-width: 1024px) 380px, 90vw" className="object-contain transition-transform duration-500 group-hover:scale-105" />
        </span>
      </span>
      <span className="flex items-center justify-between gap-3 px-5 py-4">
        <span className={`font-display font-extrabold uppercase leading-tight ${size === "xl" ? "text-2xl" : "text-lg"}`}>{sponsor.name}</span>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-muted transition-colors group-hover:text-accent">
          Visit <span aria-hidden="true">↗</span>
        </span>
      </span>
    </a>
  );
}

/** Lower tiers: one seamless white wall of logos. White-artwork logos get a small dark chip. */
function LogoWall({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul className="grid grid-cols-2 overflow-hidden rounded-md border border-line bg-white sm:grid-cols-4 lg:grid-cols-5">
      {sponsors.map((sponsor) => (
        <li key={sponsor.name} className="bg-white shadow-[inset_-1px_-1px_0_#e6e9ec]">
          <a
            href={sponsor.url}
            {...external}
            title={sponsor.name}
            data-sponsor-tile
            className="group flex h-28 items-center justify-center p-5 transition-colors hover:bg-[#f5f6f7] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
          >
            <span className={`relative block h-full w-full ${sponsor.tile === "dark" ? "rounded-md bg-[#0b0e11]" : ""}`}>
              <Image src={sponsor.logo} alt={sponsor.name} fill sizes="200px" className={`object-contain transition-transform duration-300 group-hover:scale-110 ${sponsor.tile === "dark" ? "p-2" : ""}`} />
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Sponsors by tier: Platinum and Gold as spotlight cards, Silver and Bronze as smaller cards,
 * in-kind partners as one white logo wall. `featured` shows only the top tiers plus a link to all.
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
        const spotlight = group.tier === "platinum" || group.tier === "gold";
        return (
          <section key={group.tier} aria-labelledby={`sponsor-tier-${group.tier}`}>
            <TierHeading group={group} color={color} as={headingLevel} />
            {spotlight ? (
              <ul className="flex flex-wrap justify-center gap-5">
                {group.sponsors.map((sponsor) => (
                  <li key={sponsor.name} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.84rem)]">
                    <SpotlightCard sponsor={sponsor} color={color} size="xl" />
                  </li>
                ))}
              </ul>
            ) : group.tier === "silver" || group.tier === "bronze" ? (
              <ul className="flex flex-wrap justify-center gap-4">
                {group.sponsors.map((sponsor) => (
                  <li key={sponsor.name} className="w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.67rem)] lg:w-[calc(20%-0.8rem)]">
                    <SpotlightCard sponsor={sponsor} color={color} size="lg" />
                  </li>
                ))}
              </ul>
            ) : (
              <LogoWall sponsors={group.sponsors} />
            )}
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
