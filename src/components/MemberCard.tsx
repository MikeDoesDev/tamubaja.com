import Image from "next/image";
import { initials } from "@/lib/format";
import type { Member } from "@/lib/schemas";

/** A person on a subteam roster: face (or initials), name, role, major and year. */
export function MemberCard({ member, featured = false }: { member: Member; featured?: boolean }) {
  const size = featured ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg";
  const details = [member.major, member.classYear && `Class of ${member.classYear}`].filter(Boolean).join(" · ");
  return (
    <li className={`flex items-center gap-4 rounded-sm border bg-panel p-4 ${featured ? "border-accent/60" : "border-line"}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-maroon ${size}`}>
        {member.photo ? (
          <Image src={member.photo} alt="" fill sizes={featured ? "80px" : "56px"} className="object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-display font-extrabold">
            {initials(member.name)}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className={`font-display font-extrabold uppercase leading-tight ${featured ? "text-2xl" : "text-xl"}`}>{member.name}</p>
        {featured && member.role && <p className="text-sm text-accent">{member.role}</p>}
        {details && <p className="text-sm text-muted">{details}</p>}
      </div>
    </li>
  );
}
