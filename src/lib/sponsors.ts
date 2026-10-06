import type { Sponsor } from "./schemas";

export const WALL_ORDER = ["platinum", "gold", "silver", "bronze", "inkind"] as const;

const WALL_LABELS: Record<(typeof WALL_ORDER)[number], string> = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  inkind: "In-kind partners",
};

export interface SponsorGroup {
  tier: (typeof WALL_ORDER)[number];
  label: string;
  sponsors: Sponsor[];
}

export function groupSponsors(sponsors: Sponsor[]): SponsorGroup[] {
  return WALL_ORDER.map((tier) => ({
    tier,
    label: WALL_LABELS[tier],
    sponsors: sponsors.filter((sponsor) => sponsor.show && sponsor.tier === tier),
  })).filter((group) => group.sponsors.length > 0);
}

/** Shown sponsors in tier order, for the scrolling logo strip. */
export function visibleSponsors(sponsors: Sponsor[]): Sponsor[] {
  return groupSponsors(sponsors).flatMap((group) => group.sponsors);
}
