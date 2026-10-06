import { getSponsors } from "@/lib/content";
import { visibleSponsors } from "@/lib/sponsors";
import { EmptyWall } from "./SponsorGrid";
import { SponsorTile } from "./SponsorTile";

/**
 * Endless scrolling logo strip (CSS only). The list is rendered twice and shifted by -50%,
 * so the loop is seamless; spacing is padding on each item (not `gap`) to keep both halves equal.
 * Pauses on hover/focus. With reduced motion it becomes a static, wrapped row of the originals.
 */
export function SponsorMarquee() {
  const sponsors = visibleSponsors(getSponsors());
  if (sponsors.length === 0) return <EmptyWall />;
  const loop = [...sponsors, ...sponsors];
  return (
    <div
      data-testid="sponsor-marquee"
      className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-reduce:[mask-image:none]"
    >
      <ul
        className="marquee flex w-max py-3 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-4"
        style={{ animationDuration: `${sponsors.length * 3.5}s` }}
      >
        {loop.map((sponsor, index) => {
          const duplicate = index >= sponsors.length;
          return (
            <li key={`${sponsor.name}-${index}`} data-duplicate={duplicate || undefined} className="px-2.5 motion-reduce:data-duplicate:hidden">
              <SponsorTile sponsor={sponsor} size="sm" decorative={duplicate} eager />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
