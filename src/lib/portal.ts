import "server-only";
import { auth, authConfigured } from "@/auth";
import { getSponsorAccess, getTiers } from "@/lib/content";
import { teamDate } from "@/lib/milestones";
import { findTeamMember } from "@/lib/portalMembers";
import { TIER_IDS } from "@/lib/schemas";
import { findSponsorAccess } from "@/lib/sponsorAccess";

export type TierId = (typeof TIER_IDS)[number];

export type ApprovedViewer =
  | { state: "approved"; kind: "team"; email: string; name: string }
  | { state: "approved"; kind: "sponsor"; email: string; name: string | null; company: string; tier: TierId };

export type PortalViewer =
  | { state: "not-configured" }
  | { state: "signed-out" }
  | { state: "unverified"; email: string | null }
  | { state: "not-approved"; email: string }
  | ApprovedViewer;

/**
 * Who is looking at the sponsor portal. Team members (on the private team sheet) are checked first,
 * then the sponsor list. Both are checked on every request, so removing someone takes effect as soon
 * as the sheet is re-read (within 5 minutes) or the sponsor-list change deploys.
 */
export async function getPortalViewer(): Promise<PortalViewer> {
  if (!authConfigured) return { state: "not-configured" };
  const session = await auth();
  if (!session?.user) return { state: "signed-out" };
  const email = session.verifiedEmail;
  if (!email) return { state: "unverified", email: session.user.email ?? null };

  const member = await findTeamMember(email);
  if (member) return { state: "approved", kind: "team", email, name: member.name };

  const match = findSponsorAccess(email, getSponsorAccess(), teamDate(new Date()));
  if (!match) return { state: "not-approved", email };
  return { state: "approved", kind: "sponsor", email, name: session.user.name ?? null, company: match.company, tier: match.tier };
}

const rank = (tier: TierId) => TIER_IDS.indexOf(tier);

/**
 * The cheapest tier whose benefits in tiers.yaml mention the resume bank (Silver today). Kept in sync
 * with the packet automatically: move the benefit to another tier and resume access moves with it.
 */
export function resumeTier(): TierId {
  const tier = getTiers().tiers.find((t) => t.benefits.some((benefit) => /resume/i.test(benefit)));
  return (tier?.id as TierId | undefined) ?? "bronze";
}

/** Team members see everything; sponsors get resumes from the resume-bank tier up. */
export function canDownloadResumes(viewer: ApprovedViewer): boolean {
  return viewer.kind === "team" || rank(viewer.tier) >= rank(resumeTier());
}

/** Whether a calendar note meant for these tiers applies to this viewer. No tiers listed = every sponsor. */
export function noteAppliesTo(viewer: ApprovedViewer, forTiers: readonly string[] | undefined): boolean {
  if (viewer.kind === "team" || !forTiers?.length) return true;
  return forTiers.includes(viewer.tier);
}
