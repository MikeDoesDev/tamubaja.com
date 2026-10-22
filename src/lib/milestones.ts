export type MilestoneStatus = "done" | "next" | "upcoming";

export interface Milestone {
  name: string;
  date: string;
  tentative?: boolean;
  phase?: string;
  photo?: string;
  sponsorNote?: string;
}

/** The team's calendar runs on College Station time, so "today" is the date in Central time, not UTC. */
export const TEAM_TIME_ZONE = "America/Chicago";

/** Today's date as YYYY-MM-DD in the team's time zone. */
export function teamDate(now: Date): string {
  return now.toLocaleDateString("en-CA", { timeZone: TEAM_TIME_ZONE });
}

/** Whole days from today (team time) until an ISO date: 0 on the day itself, negative once it's past. */
export function daysUntil(isoDate: string, now: Date): number {
  return Math.round((Date.parse(`${isoDate}T00:00:00Z`) - Date.parse(`${teamDate(now)}T00:00:00Z`)) / 86_400_000);
}

export function withStatus<T extends Milestone>(
  milestones: T[],
  today: Date,
): (T & { status: MilestoneStatus })[] {
  const todayIso = teamDate(today);
  const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
  let nextAssigned = false;
  return sorted.map((milestone) => {
    if (milestone.date < todayIso) return { ...milestone, status: "done" as const };
    if (!nextAssigned) {
      nextAssigned = true;
      return { ...milestone, status: "next" as const };
    }
    return { ...milestone, status: "upcoming" as const };
  });
}

export function formatMilestoneDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
