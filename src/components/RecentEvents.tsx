import Image from "next/image";
import { formatMilestoneDate } from "@/lib/milestones";
import { InstagramIcon, LinkedInIcon } from "@/components/SocialLinks";
import type { Event, Site } from "@/lib/schemas";

const followClass =
  "inline-flex items-center gap-3 rounded-sm border border-white/40 px-4 py-2 font-display text-base font-bold uppercase tracking-wide text-white transition-colors hover:border-white hover:bg-white/10";

/** The latest team events as cards, ending with a "Follow along" card. Cards without a photo get a dated maroon panel. */
export function RecentEvents({ events, socials }: { events: Event[]; socials: Site["socials"] }) {
  const follow = [
    { label: "Instagram", href: socials.instagram, icon: InstagramIcon },
    ...(socials.linkedin ? [{ label: "LinkedIn", href: socials.linkedin, icon: LinkedInIcon }] : []),
  ];
  return (
    <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={`${event.date}-${event.title}`} className="flex flex-col overflow-hidden rounded-sm border border-line bg-panel">
          <div className="relative aspect-[2/1] bg-maroon">
            {event.photo ? (
              <Image src={event.photo} alt={event.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div aria-hidden="true" className="topo-bg flex h-full items-end p-4">
                <p className="font-display text-5xl font-extrabold uppercase leading-none text-white/90">
                  {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                </p>
              </div>
            )}
          </div>
          {event.morePhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-line">
              {event.morePhotos.map((photo) => (
                <div key={photo} className="relative aspect-[2/1]">
                  <Image src={photo} alt={event.title} fill sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-1 flex-col p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <time dateTime={event.date}>{formatMilestoneDate(event.date)}</time>
            </p>
            <h3 className="mt-1 font-display text-xl font-extrabold uppercase leading-tight">{event.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{event.description}</p>
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                See the post<span className="sr-only">: {event.title}</span> →
              </a>
            )}
          </div>
        </li>
      ))}
      <li className="topo-bg flex flex-col justify-end rounded-sm bg-maroon p-5 md:col-span-2 lg:col-span-1">
        <h3 className="font-display text-3xl font-extrabold uppercase leading-none text-white">Follow along</h3>
        <p className="mt-3 text-white/85">
          Build days, design reviews, and race weekends as they happen.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {follow.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={followClass}>
              <span className="h-4 w-4">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </li>
    </ul>
  );
}
