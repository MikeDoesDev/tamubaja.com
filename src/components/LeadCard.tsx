import Image from "next/image";
import { initials } from "@/lib/format";
import type { Lead } from "@/lib/schemas";

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <li className="flex gap-4 rounded-sm border border-line bg-panel p-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-maroon">
        {lead.photo ? (
          <Image src={lead.photo} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display text-2xl font-extrabold">
            {initials(lead.name)}
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl font-extrabold uppercase leading-tight">{lead.name}</p>
        <p className="text-sm text-accent">{lead.role}</p>
        <p className="text-sm text-muted">
          {lead.major} · Class of {lead.classYear}
        </p>
        {lead.linkedin && (
          <a href={lead.linkedin} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm underline underline-offset-2">
            LinkedIn<span className="sr-only"> profile of {lead.name}</span>
          </a>
        )}
      </div>
    </li>
  );
}
