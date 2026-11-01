import Link from "next/link";
import { PersonPlaceholder } from "./PersonPlaceholder";
import { directoryHref } from "@/lib/directory";
import type { Member } from "@/lib/schemas";

const details = (member: Member) => [member.major, member.classYear && `Class of ${member.classYear}`].filter(Boolean).join(" · ");

/** A subteam lead: name, role, major and year. Opens their card in the student directory. */
export function LeadCard({ member, subteam }: { member: Member; subteam: string }) {
  return (
    <li>
      <Link
        href={directoryHref({ subteam, person: member.name })}
        className="group flex items-center gap-4 rounded-2xl border border-accent/60 bg-panel p-4 transition-colors hover:border-accent hover:bg-panel-2"
      >
        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#101214]">
          <PersonPlaceholder />
        </span>
        <span className="min-w-0 flex-1">
          {member.role && <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{member.role}</span>}
          <span className="block font-display text-2xl font-extrabold uppercase leading-tight">{member.name}</span>
          {details(member) && <span className="block text-sm text-muted">{details(member)}</span>}
        </span>
        <span aria-hidden="true" className="text-xl text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
          →
        </span>
      </Link>
    </li>
  );
}

/** A subteam member as a compact row that opens their card in the student directory. */
export function MemberRow({ member, subteam }: { member: Member; subteam: string }) {
  return (
    <li>
      <Link
        href={directoryHref({ subteam, person: member.name })}
        className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-panel-2"
      >
        <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#101214]">
          <PersonPlaceholder />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-lg font-bold uppercase leading-tight">{member.name}</span>
          {details(member) && <span className="block truncate text-xs text-muted">{details(member)}</span>}
        </span>
        <span aria-hidden="true" className="text-muted opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-accent">
          →
        </span>
      </Link>
    </li>
  );
}
