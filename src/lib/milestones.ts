export type MilestoneStatus = "done" | "next" | "upcoming";

export interface Milestone {
  name: string;
  date: string;
  tentative?: boolean;
}

export function withStatus<T extends Milestone>(
  milestones: T[],
  today: Date,
): (T & { status: MilestoneStatus })[] {
  const todayIso = today.toISOString().slice(0, 10);
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
