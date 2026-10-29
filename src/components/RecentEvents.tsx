import Image from "next/image";
import { formatMilestoneDate } from "@/lib/milestones";
import type { Event } from "@/lib/schemas";

/** The latest team events as cards. Cards without a photo get a dated maroon panel instead. */
export function RecentEvents({ events }: { events: Event[] }) {
  return (
    <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <li key={`${event.date}-${event.title}`} className="flex flex-col overflow-hidden rounded-sm border border-line bg-panel">
          <div className="relative aspect-[16/10] bg-maroon">
            {event.photo ? (
              <Image src={event.photo} alt={event.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
            ) : (
              <div aria-hidden="true" className="topo-bg flex h-full items-end p-5">
                <p className="font-display text-6xl font-extrabold uppercase leading-none text-white/90">
                  {new Date(`${event.date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}
                </p>
              </div>
            )}
          </div>
          {event.morePhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-line">
              {event.morePhotos.map((photo) => (
                <div key={photo} className="relative aspect-[4/3]">
                  <Image src={photo} alt={event.title} fill sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-1 flex-col p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              <time dateTime={event.date}>{formatMilestoneDate(event.date)}</time>
            </p>
            <h3 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{event.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{event.description}</p>
            {event.link && (
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                See the post<span className="sr-only">: {event.title}</span> →
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
