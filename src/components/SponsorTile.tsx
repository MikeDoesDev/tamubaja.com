import Image from "next/image";
import type { Sponsor } from "@/lib/schemas";

const SIZES = {
  lg: "h-32 p-6",
  md: "h-28 p-5",
  sm: "h-24 p-4",
} as const;

export type TileSize = keyof typeof SIZES;

/** A sponsor logo in full color on a clean tile; lifts on hover. Fills its grid cell. */
export function SponsorTile({ sponsor, size = "md", showName = false }: { sponsor: Sponsor; size?: TileSize; showName?: boolean }) {
  const dark = sponsor.tile === "dark";
  const surface = dark ? "bg-[#0b0e11] ring-1 ring-line" : "bg-white";
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      data-sponsor-tile
      className="group flex h-full flex-col overflow-hidden rounded-md shadow-[0_1px_0_rgb(255_255_255/4%)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgb(0_0_0/80%)] focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent"
    >
      <span className={`relative block w-full ${surface} ${SIZES[size]}`}>
        <span className="relative block h-full w-full">
          <Image src={sponsor.logo} alt={sponsor.name} fill sizes="(min-width: 1024px) 240px, 45vw" className="object-contain transition duration-300 group-hover:scale-[1.04]" />
        </span>
      </span>
      {showName && (
        <span className="flex items-center justify-between gap-2 border-t border-line bg-panel px-3 py-2 text-xs text-muted transition-colors group-hover:text-ink">
          <span className="truncate">{sponsor.name}</span>
          <span aria-hidden="true" className="text-accent opacity-0 transition-opacity group-hover:opacity-100">
            ↗
          </span>
        </span>
      )}
    </a>
  );
}
