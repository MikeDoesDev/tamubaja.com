import Image from "next/image";
import Link from "next/link";
import { getCar, getSponsors } from "@/lib/content";
import { groupSponsors } from "@/lib/sponsors";

export function LogoWall({ size = "sm" }: { size?: "sm" | "lg" }) {
  const groups = groupSponsors(getSponsors());

  if (groups.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-line p-6 text-center">
        <p className="font-display text-2xl font-bold uppercase">Your logo here</p>
        <p className="mt-1 text-sm text-muted">Join the {getCar().buildSeason} partners powering car #51.</p>
        <Link href="/sponsors#inquire" className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4">
          Become a sponsor
        </Link>
      </div>
    );
  }

  const box = size === "lg" ? "h-20 w-44" : "h-12 w-28";
  return (
    <div className="space-y-8" data-testid="logo-wall">
      {groups.map((group) => (
        <div key={group.tier}>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted">{group.label}</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {group.sponsors.map((sponsor) => (
              <li key={sponsor.name}>
                <a
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative block ${box} opacity-80 transition-opacity hover:opacity-100`}
                >
                  <Image src={sponsor.logo} alt={sponsor.name} fill sizes="176px" className="object-contain brightness-0 invert" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
