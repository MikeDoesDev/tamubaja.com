import Image from "next/image";
import { PersonPlaceholder } from "./PersonPlaceholder";
import type { Member } from "@/lib/schemas";

/** A person on a subteam roster: face (or a placeholder), name, role, major and year. */
export function MemberCard({ member, featured = false }: { member: Member; featured?: boolean }) {
  const size = featured ? "h-20 w-20 text-2xl" : "h-14 w-14 text-lg";
  const details = [member.major, member.classYear && `Class of ${member.classYear}`].filter(Boolean).join(" · ");
  return (
    <li className={`flex items-center gap-4 rounded-2xl border bg-panel p-4 ${featured ? "border-accent/60" : "border-line"}`}>
      <div className={`relative shrink-0 overflow-hidden rounded-full bg-[#101214] ${size}`}>
        {member.photo ? (
          <Image src={member.photo} alt="" fill sizes={featured ? "80px" : "56px"} className="object-cover" />
        ) : (
          <PersonPlaceholder />
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
