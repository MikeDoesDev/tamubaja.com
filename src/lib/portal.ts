import "server-only";
import { auth, authConfigured } from "@/auth";
import { getSponsorAccess } from "@/lib/content";
import { teamDate } from "@/lib/milestones";
import { findSponsorAccess } from "@/lib/sponsorAccess";

export type PortalViewer =
  | { state: "not-configured" }
  | { state: "signed-out" }
  | { state: "unverified"; email: string | null }
  | { state: "not-approved"; email: string }
  | { state: "approved"; email: string; name: string | null; company: string };

/**
 * Who is looking at the sponsor portal. The allowlist is checked on every request, so removing a
 * sponsor from content/sponsor-access.yaml cuts off access as soon as that change deploys.
 */
export async function getPortalViewer(): Promise<PortalViewer> {
  if (!authConfigured) return { state: "not-configured" };
  const session = await auth();
  if (!session?.user) return { state: "signed-out" };
  const email = session.verifiedEmail;
  if (!email) return { state: "unverified", email: session.user.email ?? null };
  const match = findSponsorAccess(email, getSponsorAccess(), teamDate(new Date()));
  if (!match) return { state: "not-approved", email };
  return { state: "approved", email, name: session.user.name ?? null, company: match.company };
}
