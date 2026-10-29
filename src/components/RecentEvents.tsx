import Image from "next/image";
import { InstagramIcon, LinkedInIcon } from "@/components/SocialLinks";
import type { Event, Site } from "@/lib/schemas";

const day = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });

/** Small icon buttons to the team's socials, shown beside the section heading. */
export function FollowAlong({ socials }: { socials: Site["socials"] }) {
  const links = [
    { label: "Instagram", href: socials.instagram, icon: InstagramIcon },
    ...(socials.linkedin ? [{ label: "LinkedIn", href: socials.linkedin, icon: LinkedInIcon }] : []),
  ];
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Follow along</span>
      {links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-sm border border-line px-3 py-2 font-display text-base font-bold uppercase tracking-wide text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <span className="h-4 w-4">{link.icon}</span>
          {link.label}
        </a>
      ))}
    </div>
  );
}

/** The latest team events as a dated list. Photos sit at the right of a row when an event has them. */
export function RecentEvents({ events }: { events: Event[] }) {
  return (
    <ol className="mt-8 divide-y divide-line border-y border-line">
      {events.map((event) => {
        const photos = [event.photo, ...event.morePhotos].filter((photo): photo is string => Boolean(photo));
        return (
          <li
            key={`${event.date}-${event.title}`}
            className={`grid gap-x-6 gap-y-4 py-6 sm:grid-cols-[5.5rem_1fr] ${photos.length ? "lg:grid-cols-[5.5rem_1fr_auto]" : ""}`}
          >
            <time dateTime={event.date} className="flex items-baseline gap-2 sm:block">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{day(event.date, { month: "short" })}</span>
              <span className="block font-display text-5xl font-extrabold leading-none">{day(event.date, { day: "numeric" })}</span>
              <span className="block text-xs text-muted">{day(event.date, { year: "numeric" })}</span>
            </time>
            <div className="max-w-xl">
              <h3 className="font-display text-2xl font-extrabold uppercase leading-tight">{event.title}</h3>
              <p className="mt-1 text-muted">{event.description}</p>
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline"
                >
                  See the post<span className="sr-only">: {event.title}</span> →
                </a>
              )}
            </div>
            {photos.length > 0 && (
              <div className="flex gap-2 sm:col-start-2 lg:col-start-auto">
                {photos.map((photo, index) => (
                  <div key={photo} className="relative aspect-[4/3] w-1/3 overflow-hidden rounded-sm sm:w-40">
                    <Image src={photo} alt={index === 0 ? event.title : ""} fill sizes="160px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
