import Image from "next/image";
import Link from "next/link";
import { seasonSlug } from "@/lib/format";
import type { GarageCar } from "@/lib/schemas";
import { Plate } from "./Plate";

/** Past cars by race number. A car with a season links to that year's result on the Car page. */
export function Garage({ cars }: { cars: GarageCar[] }) {
  return (
    <ul className="grid gap-6 md:grid-cols-3">
      {cars.map((car) => {
        const href = car.season ? `/car#season-${seasonSlug(car.season)}` : "/car#garage";
        return (
          <li key={car.number}>
            <Link href={href} className="group block overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:-translate-y-1 hover:border-accent/50">
              <span className="relative block aspect-[4/3] overflow-hidden">
                <Image
                  src={car.photo}
                  alt={`Texas A&M Baja car #${car.number}`}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Plate number={car.number} className="absolute left-4 top-4" />
              </span>
              <span className="block p-6">
                <span className="block font-display text-3xl font-extrabold uppercase leading-none">Car #{car.number}</span>
                {(car.season || car.livery) && (
                  <span className="mt-2 block text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {[car.season, car.livery].filter(Boolean).join(" · ")}
                  </span>
                )}
                <span className="mt-3 block text-sm text-muted">{car.description}</span>
                <span className="mt-4 block text-sm font-semibold text-ink underline decoration-accent underline-offset-4">
                  {car.season ? "See its competition result" : "See the car"}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
