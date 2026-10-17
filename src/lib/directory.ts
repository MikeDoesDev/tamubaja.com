import type { Team } from "./schemas";

export interface DirectoryPerson {
  name: string;
  major?: string;
  classYear?: string;
  photo?: string;
  /** Leadership titles, e.g. "Chief Engineer" or "Chassis Lead". */
  titles: string[];
  subteams: string[];
}

/** One entry per person across leadership and every subteam, sorted alphabetically by last name (then first name). */
export function buildDirectory(team: Team): DirectoryPerson[] {
  const people = new Map<string, DirectoryPerson>();
  const upsert = (
    person: { name: string; major?: string; classYear?: string; photo?: string },
    extra: { title?: string; subteam?: string },
  ) => {
    const entry = people.get(person.name) ?? { name: person.name, titles: [], subteams: [] };
    entry.major ??= person.major;
    entry.classYear ??= person.classYear;
    entry.photo ??= person.photo;
    if (extra.title && !entry.titles.includes(extra.title)) entry.titles.push(extra.title);
    if (extra.subteam && !entry.subteams.includes(extra.subteam)) entry.subteams.push(extra.subteam);
    people.set(person.name, entry);
  };

  for (const lead of team.leads) upsert(lead, { title: lead.role });
  for (const subteam of team.subteams) {
    for (const lead of subteam.leads) upsert(lead, { title: lead.role, subteam: subteam.name });
    for (const member of subteam.members) upsert(member, { subteam: subteam.name });
  }

  const lastName = (name: string) => name.trim().split(/\s+/).at(-1) ?? name;
  return [...people.values()].sort(
    (a, b) => lastName(a.name).localeCompare(lastName(b.name)) || a.name.localeCompare(b.name),
  );
}
