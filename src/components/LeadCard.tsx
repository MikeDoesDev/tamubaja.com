import Image from "next/image";
import { PersonPlaceholder } from "./PersonPlaceholder";
import { Plate } from "./Plate";
import type { Lead } from "@/lib/schemas";

/** Leadership card: a tall headshot (or the livery placeholder until photos come in), name, role, major and year. */
export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line">
        {lead.photo ? (
          <Image
            src={lead.photo}
            alt={`${lead.name}, ${lead.role}`}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <PersonPlaceholder />
        )}
        <Plate number={51} className="absolute bottom-3 right-3 !text-base" />
      </div>
      <div className="pt-4">
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
