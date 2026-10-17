import { newestFirst, seasonSlug } from "./format";
import type { GarageCar, Season } from "./schemas";

/** One season's car: its number and photo from the garage, joined with its competition result. */
export interface CarYear {
  slug: string;
  season: string;
  number?: string;
  photo?: string;
  livery?: string;
  description?: string;
  event?: string;
  location?: string;
  /** Overall placing; null means no overall result, undefined means not in yet. */
  overall?: number | null;
  fieldSize?: number;
  highlights: string[];
  /** The season's biggest step forward: written in seasons.yaml, or the overall places gained. */
  improvement?: string;
  specs: { label: string; value: string }[];
  leads: { name: string; role: string }[];
}

/** Every season with a result or a garage car, newest first. */
export function buildCarYears(seasons: Season[], garage: GarageCar[]): CarYear[] {
  const years = new Map<string, CarYear>();
  for (const s of seasons) {
    years.set(s.season, {
      slug: seasonSlug(s.season),
      season: s.season,
      photo: s.photo,
      event: s.event,
      location: s.location,
      overall: s.overall,
      fieldSize: s.fieldSize,
      highlights: s.highlights,
      improvement: s.improvement,
      specs: s.specs,
      leads: s.leads,
    });
  }
  for (const car of garage) {
    if (!car.season) continue;
    const year = years.get(car.season) ?? { slug: seasonSlug(car.season), season: car.season, highlights: [], specs: [], leads: [] };
    years.set(car.season, {
      ...year,
      number: car.number,
      photo: car.photo ?? year.photo,
      livery: car.livery,
      description: car.description,
    });
  }
  const ordered = newestFirst([...years.values()]);
  // No written improvement? Credit the climb in overall placing since the last ranked season.
  ordered.forEach((year, index) => {
    if (year.improvement || typeof year.overall !== "number") return;
    const previous = ordered.slice(index + 1).find((older) => typeof older.overall === "number");
    if (previous && typeof previous.overall === "number" && previous.overall > year.overall) {
      year.improvement = `Up ${previous.overall - year.overall} places overall from ${previous.season}`;
    }
  });
  return ordered;
}

export const carHref = (year: Pick<CarYear, "slug">) => `/car/${year.slug}`;
export const carName = (year: Pick<CarYear, "number" | "season">) => (year.number ? `Car #${year.number}` : `The ${year.season} car`);
