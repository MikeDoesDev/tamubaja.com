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
 * `decorative` hides repeated copies (the logo strip's loop) from screen readers and Tab.
 * `eager` loads the logo up front (at low priority) for tiles that slide in sideways, which
 * lazy loading would leave blank until they enter the clipped strip.
 */
export function SponsorTile({
  sponsor,
  size = "md",
  decorative = false,
  eager = false,
}: {
  sponsor: Sponsor;
  size?: TileSize;
  decorative?: boolean;
  eager?: boolean;
}) {
  const surface = sponsor.tile === "dark" ? "bg-panel-2 ring-1 ring-line" : "bg-white";
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      data-sponsor-tile
      className={`group block shrink-0 rounded-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-accent focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-accent ${surface} ${SIZES[size]}`}
    >
      <span className="relative block h-full w-full">
        <Image
          src={sponsor.logo}
          alt={decorative ? "" : sponsor.name}
          fill
          sizes="224px"
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "low" : undefined}
          className="object-contain transition duration-300 pointer-fine:opacity-70 pointer-fine:grayscale group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
        />
      </span>
    </a>
  );
}
