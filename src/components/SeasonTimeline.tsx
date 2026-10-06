import Image from "next/image";
import { ordinal } from "@/lib/format";
import type { Season } from "@/lib/schemas";

export function SeasonTimeline({ seasons }: { seasons: Season[] }) {
  return (
    <ol className="space-y-6 border-l-2 border-line pl-6 sm:pl-10">
      {seasons.map((season) => (
        <li key={season.season} className="relative">
          <span aria-hidden="true" className="absolute -left-[33px] top-6 h-4 w-4 rounded-full border-2 border-accent bg-bg sm:-left-[49px]" />
          <div className="gap-6 rounded-sm border border-line bg-panel p-5 sm:flex sm:items-start sm:justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{season.season}</p>
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
              {season.photo && (
                <div className="relative mt-4 aspect-[16/9] w-full max-w-sm overflow-hidden rounded-sm">
                  <Image src={season.photo} alt={`Texas A&M Baja ${season.season} car`} fill sizes="384px" className="object-cover" />
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
      ))}
    </ol>
  );
}
