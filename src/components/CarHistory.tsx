import Image from "next/image";
import Link from "next/link";
import { carHref, type CarYear } from "@/lib/cars";
import { ordinal } from "@/lib/format";
import { Plate } from "./Plate";

/** "31st", or a muted note when there's no overall result. */
export function Placement({ year, size = "lg" }: { year: CarYear; size?: "lg" | "sm" }) {
  const big = size === "lg" ? "text-5xl" : "text-3xl";
  if (year.overall === undefined) {
    return (
      <p className="text-right">
        <span className={`block font-display ${big} font-extrabold leading-none text-muted`}>TBA</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Result coming</span>
      </p>
    );
  }
  if (year.overall === null) {
    return (
      <p className="text-right">
        <span className={`block font-display ${big} font-extrabold leading-none text-muted`}>—</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">No overall</span>
      </p>
    );
  }
  return (
    <p className="text-right">
      <span className={`block font-display ${big} font-extrabold leading-none text-accent`}>{ordinal(year.overall)}</span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
        Overall{year.fieldSize ? ` of ${year.fieldSize}` : ""}
      </span>
    </p>
  );
}

function Arrow() {
  return (
    <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">
      →
    </span>
  );
}

/** A photo card: plate, year, placement, recognition. */
export function CarCard({ year }: { year: CarYear & { photo: string } }) {
  return (
    <li id={`season-${year.slug}`} className="scroll-mt-24">
      <Link
        href={carHref(year)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-accent/50"
      >
        <span className="relative block aspect-[4/3] overflow-hidden">
          <Image
            src={year.photo}
            alt={`Texas A&M Baja car${year.number ? ` #${year.number}` : ""}, ${year.season}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {year.number && <Plate number={year.number} className="absolute left-4 top-4" />}
        </span>
        <span className="flex flex-1 flex-col p-6">
          <span className="flex items-end justify-between gap-4">
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Season</span>
              <span className="block font-display text-4xl font-extrabold leading-none">{year.season}</span>
            </span>
            <Placement year={year} />
          </span>
          {year.highlights.length > 0 && (
            <span className="mt-5 block space-y-1.5 border-t border-line pt-4">
              {year.highlights.map((item) => (
                <span key={item} className="flex gap-2 text-sm text-ink/85">
                  <span aria-hidden="true" className="text-accent">
                    ★
                  </span>
                  {item}
                </span>
              ))}
            </span>
          )}
          <span className="mt-auto pt-5 text-sm font-semibold text-accent">
            View the car <Arrow />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** A slim row for seasons we don't have a car photo for yet. */
function SeasonRow({ year }: { year: CarYear }) {
  return (
    <li id={`season-${year.slug}`} className="scroll-mt-24">
      <Link
        href={carHref(year)}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 px-5 py-5 transition-colors hover:bg-panel-2 sm:grid-cols-[8.5rem_1fr_auto_1.5rem] sm:px-7"
      >
        <span className="col-start-1 row-start-1 font-display text-3xl font-extrabold leading-none">{year.season}</span>
        <span className="col-span-2 col-start-1 row-start-2 text-sm text-ink/80 sm:col-span-1 sm:col-start-2 sm:row-start-1">
          {year.highlights.join(" · ")}
        </span>
        <span className="col-start-2 row-start-1 sm:col-start-3">
          <Placement year={year} size="sm" />
        </span>
        <span className="hidden text-accent sm:col-start-4 sm:row-start-1 sm:block">
          <Arrow />
        </span>
      </Link>
    </li>
  );
}

/** Every car, newest first: photo cards for cars we have pictures of, slim rows for the rest. */
export function CarHistory({ years }: { years: CarYear[] }) {
  const withPhotos = years.filter((year): year is CarYear & { photo: string } => Boolean(year.photo));
  const rest = years.filter((year) => !year.photo);
  return (
    <div>
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {withPhotos.map((year) => (
          <CarCard key={year.slug} year={year} />
        ))}
      </ul>
      {rest.length > 0 && (
        <>
          <p className="mb-4 mt-14 text-xs font-semibold uppercase tracking-[0.2em] text-accent">Earlier seasons</p>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
            {rest.map((year) => (
              <SeasonRow key={year.slug} year={year} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
