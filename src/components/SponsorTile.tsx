import Image from "next/image";
import type { Sponsor } from "@/lib/schemas";

const SIZES = {
  lg: "h-28 w-56 p-5",
  md: "h-24 w-48 p-4",
  sm: "h-20 w-40 p-4",
} as const;

export type TileSize = keyof typeof SIZES;

/**
 * A sponsor logo on a tile. On devices with a mouse, logos sit muted in grayscale and
 * light up in full color on hover or keyboard focus; touch devices always show color.
 */
export function SponsorTile({ sponsor, size = "md" }: { sponsor: Sponsor; size?: TileSize }) {
  const dark = sponsor.tile === "dark";
  const surface = dark ? "bg-panel-2 ring-1 ring-line" : "bg-white";
  // Fading a light logo on a dark tile makes it unreadable, so dark tiles only go grayscale.
  const muted = dark ? "pointer-fine:grayscale" : "pointer-fine:opacity-70 pointer-fine:grayscale";
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      data-sponsor-tile
      className={`group block shrink-0 rounded-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-accent focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent ${surface} ${SIZES[size]}`}
    >
      <span className="relative block h-full w-full">
        <Image
          src={sponsor.logo}
          alt={sponsor.name}
          fill
          sizes="224px"
          className={`object-contain transition duration-300 ${muted} group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0`}
        />
      </span>
    </a>
  );
}
