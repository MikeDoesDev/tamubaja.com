import { teamDate, withStatus, type Milestone, type MilestoneStatus } from "./milestones";
import type { Event } from "./schemas";

export type LogEntry = {
  kind: "milestone" | "event";
  name: string;
  date: string;
  status: MilestoneStatus;
  phase: string;
  tentative?: boolean;
  description?: string;
  photos: string[];
  link?: string;
  sponsorNote?: string;
};

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * One chronological list of the season: build milestones plus team events, each placed in the phase
 * (Design, Build, Compete) it happened during. An event with the same name and date as a milestone is
 * folded into that milestone, so its photos and post show up on the milestone itself.
 */
export function buildSeasonLog(milestones: Milestone[], events: Event[], today: Date): LogEntry[] {
  const todayIso = teamDate(today);
  const items = withStatus(milestones, today);
  const used = new Set<Event>();

  const entries: LogEntry[] = items.map((m) => {
    const match = events.find((e) => e.date === m.date && same(e.title, m.name));
    if (match) used.add(match);
    const photos = [match?.photo ?? m.photo, ...(match?.morePhotos ?? [])].filter((p): p is string => Boolean(p));
    return {
      kind: "milestone",
      name: m.name,
      date: m.date,
      status: m.status,
      phase: m.phase ?? "Season",
      tentative: m.tentative,
      description: match?.description,
      photos,
      link: match?.link ?? m.link,
      sponsorNote: m.sponsorNote,
    };
  });

  for (const e of events) {
    if (used.has(e)) continue;
    // An event belongs to the phase of the last milestone before it (or the first phase if it's earlier than all of them).
    const before = items.filter((m) => m.date <= e.date).at(-1) ?? items[0];
    entries.push({
      kind: "event",
      name: e.title,
      date: e.date,
      status: e.date < todayIso ? "done" : "upcoming",
      phase: before?.phase ?? "Season",
      description: e.description,
      photos: [e.photo, ...e.morePhotos].filter((p): p is string => Boolean(p)),
      link: e.link,
    });
  }

  // Milestones before events on the same day.
  return entries.sort((a, b) => a.date.localeCompare(b.date) || (a.kind === b.kind ? 0 : a.kind === "milestone" ? -1 : 1));
}
