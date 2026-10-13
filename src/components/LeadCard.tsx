import Image from "next/image";
import { initials } from "@/lib/format";
import type { Lead } from "@/lib/schemas";

/** Leadership card: a big headshot (or initials until photos come in), name, role, major and year. */
export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li className="overflow-hidden rounded-sm border border-line bg-panel">
      <div className="relative aspect-square bg-linear-to-br from-maroon to-panel-2">
        {lead.photo ? (
          <Image
            src={lead.photo}
            alt={`${lead.name}, ${lead.role}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-7xl font-extrabold text-white/80">
            {initials(lead.name)}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{lead.role}</p>
        <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{lead.name}</p>
        <p className="mt-1 text-sm text-muted">
          {lead.major} · Class of {lead.classYear}
        </p>
        {lead.linkedin && (
          <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm underline underline-offset-2">
            LinkedIn<span className="sr-only"> profile of {lead.name}</span>
          </a>
        )}
      </div>
    </li>
  );
}
