import Image from "next/image";
import { ordinal, seasonSlug } from "@/lib/format";
import type { GarageCar, Season } from "@/lib/schemas";
import { Plate } from "./Plate";

function Result({ season }: { season: Season }) {
  if (season.overall === null) return null;
  return (
    <p className="shrink-0">
      <span className="block font-display text-6xl font-extrabold leading-none text-accent">{ordinal(season.overall)}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
        Overall{season.fieldSize ? ` of ${season.fieldSize}` : ""}
      </span>
    </p>
  );
}

function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full bg-panel-2 px-3 py-1 text-xs">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** A car with its photo, number plate, and (when known) the competition it raced. */
function FeatureCard({ car, season, flip }: { car: GarageCar; season?: Season; flip: boolean }) {
  return (
    <article
      id={season ? `season-${seasonSlug(season.season)}` : `car-${car.number}`}
      className="grid scroll-mt-24 overflow-hidden rounded-3xl border border-line bg-panel lg:grid-cols-2"
    >
      <div className={`relative min-h-72 ${flip ? "lg:order-2" : ""}`}>
        <Image src={car.photo} alt={`Texas A&M Baja car #${car.number}`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-col justify-center p-7 sm:p-10">
        <div className="flex items-center gap-3">
          <Plate number={car.number} className="!text-3xl" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {[season?.season, car.livery].filter(Boolean).join(" · ")}
          </span>
        </div>
        <h3 className="mt-5 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">
          {season ? season.event : `Car #${car.number}`}
        </h3>
        {season && <p className="mt-1 text-sm text-muted">{season.location}</p>}
        <p className="mt-4 text-muted">{car.description}</p>
        {season && <Highlights items={season.highlights} />}
        {season && (
          <div className="mt-6">
            <Result season={season} />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * The garage and competition history in one list, newest first. Seasons with a car photo get a
 * full card; older seasons without one get a compact row. Each season keeps its #season-… anchor.
 */
export function CarHistory({ seasons, garage }: { seasons: Season[]; garage: GarageCar[] }) {
  const unmatched = garage.filter((car) => !car.season || !seasons.some((season) => season.season === car.season));
  let featureIndex = 0;
  return (
    <div className="space-y-5">
      {unmatched.map((car) => (
        <FeatureCard key={car.number} car={car} flip={featureIndex++ % 2 === 1} />
      ))}
      {seasons.map((season) => {
        const car = garage.find((entry) => entry.season === season.season);
        if (car) return <FeatureCard key={season.season} car={car} season={season} flip={featureIndex++ % 2 === 1} />;
        return (
          <article
            key={season.season}
            id={`season-${seasonSlug(season.season)}`}
            className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-line bg-panel p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{season.season}</p>
              <h3 className="mt-1 font-display text-3xl font-extrabold uppercase">{season.event}</h3>
              <p className="text-sm text-muted">{season.location}</p>
              <Highlights items={season.highlights} />
            </div>
            <Result season={season} />
          </article>
        );
      })}
    </div>
  );
}
