import Image from "next/image";
import { ordinal, seasonSlug } from "@/lib/format";
import type { GarageCar, Season } from "@/lib/schemas";
import { Plate } from "./Plate";

export function SeasonTimeline({ seasons, garage = [] }: { seasons: Season[]; garage?: GarageCar[] }) {
  return (
    <ol className="space-y-6 border-l-2 border-line pl-6 sm:pl-10">
      {seasons.map((season) => {
        const car = garage.find((entry) => entry.season === season.season);
        return (
        <li key={season.season} id={`season-${seasonSlug(season.season)}`} className="relative scroll-mt-24">
          <span aria-hidden="true" className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-2 border-accent bg-bg sm:-left-[49px]" />
          <div className="gap-6 rounded-sm border border-line bg-panel p-5 sm:flex sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {season.season}
                {car && <Plate number={car.number} className="!text-base" />}
              </p>
              <h3 className="mt-1 font-display text-3xl font-extrabold uppercase">{season.event}</h3>
              <p className="text-sm text-muted">{season.location}</p>
              {season.highlights.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {season.highlights.map((highlight) => (
                    <li key={highlight} className="rounded-sm bg-panel-2 px-2 py-1 text-xs">
                      {highlight}
                    </li>
                  ))}
                </ul>
              )}
              {(season.photo ?? car?.photo) && (
                <div className="relative mt-4 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-sm">
                  <Image src={(season.photo ?? car?.photo)!} alt={`Texas A&M Baja ${season.season} car`} fill sizes="384px" className="object-cover" />
                </div>
              )}
            </div>
            {season.overall !== null && (
              <p className="mt-4 shrink-0 sm:mt-0 sm:text-right">
                <span className="block font-display text-5xl font-extrabold text-accent">{ordinal(season.overall)}</span>
                <span className="text-xs uppercase tracking-wide text-muted">
                  Overall{season.fieldSize ? ` of ${season.fieldSize}` : ""}
                </span>
              </p>
            )}
          </div>
        </li>
        );
      })}
    </ol>
  );
}
