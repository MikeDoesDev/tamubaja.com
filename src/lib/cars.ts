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
    });
  }
  for (const car of garage) {
    if (!car.season) continue;
    const year = years.get(car.season) ?? { slug: seasonSlug(car.season), season: car.season, highlights: [] };
    years.set(car.season, {
      ...year,
      number: car.number,
      photo: car.photo ?? year.photo,
      livery: car.livery,
      description: car.description,
    });
  }
  return newestFirst([...years.values()]);
}

export const carHref = (year: Pick<CarYear, "slug">) => `/car/${year.slug}`;
export const carName = (year: Pick<CarYear, "number" | "season">) => (year.number ? `Car #${year.number}` : `The ${year.season} car`);
