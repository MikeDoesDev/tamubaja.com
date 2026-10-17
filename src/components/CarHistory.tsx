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

/** The same card for every season: photo (or topo placeholder), plate, year, placement, step forward, recognition. */
export function CarCard({ year }: { year: CarYear }) {
  return (
    <li id={`season-${year.slug}`} className="scroll-mt-24">
      <Link
        href={carHref(year)}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-accent/50"
      >
        <span className="relative block aspect-[16/10] overflow-hidden bg-[#101214]">
          {year.photo ? (
            <Image
              src={year.photo}
              alt={`Texas A&M Baja car${year.number ? ` #${year.number}` : ""}, ${year.season}`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="topo-bg absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-90">
              <span className="font-display text-6xl font-extrabold leading-none text-ink/15">{year.season}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Photo coming</span>
            </span>
          )}
          {year.number && <Plate number={year.number} className="absolute left-4 top-4" />}
        </span>
        <span className="flex flex-1 flex-col p-6">
          <span className="flex items-end justify-between gap-4">
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                {year.event ?? "Season"}
              </span>
              <span className="block font-display text-4xl font-extrabold leading-none">{year.season}</span>
            </span>
            <Placement year={year} />
          </span>

          {year.improvement && (
            <span className="mt-5 block rounded-lg border-l-4 border-maroon bg-maroon/25 px-4 py-3">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Step forward</span>
              <span className="mt-0.5 block font-display text-xl font-bold uppercase leading-tight">{year.improvement}</span>
            </span>
          )}

          {year.highlights.length > 0 && (
            <span className="mt-4 block space-y-1.5">
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
          <span aria-hidden="true" className="block min-h-5 flex-1" />
          <span className="block border-t border-line pt-4 text-sm font-semibold text-accent">
            View the car <Arrow />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Every car, newest first, in one uniform grid. */
export function CarHistory({ years }: { years: CarYear[] }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {years.map((year) => (
        <CarCard key={year.slug} year={year} />
      ))}
    </ul>
  );
}
