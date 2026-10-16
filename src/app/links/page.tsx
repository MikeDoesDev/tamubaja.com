import Image from "next/image";
import Link from "next/link";
import { getCar, getDevelopment, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Links",
  description: "Quick links for Texas A&M Baja SAE: sponsor the team, donate, join, meet the team, and follow the build of car #51.",
  path: "/links",
});

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function LinksPage() {
  const site = getSite();
  const car = getCar();
  const dev = getDevelopment();
  const links: { href: string; label: string; note: string; primary?: boolean; external?: boolean }[] = [
    { href: "/sponsors", label: "Become a sponsor", note: "Tiers, benefits, and a quick inquiry form", primary: true },
    {
      href: site.giving.foundationUrl,
      label: "Donate",
      note: `Texas A&M Foundation · "Student Organization Gifts" · gift note ${site.giving.accountCode}`,
      external: true,
    },
    { href: dev.applyUrl, label: "Join the team", note: "Apply on Pitcrew, Texas A&M SAE's recruiting portal", external: true },
    { href: "/development", label: "Development program", note: "How new members go from first meeting to the car" },
    { href: "/car", label: `Follow the ${car.buildSeason} build`, note: "Where the car stands and what's next" },
    { href: "/team", label: "Meet the team", note: "Leads, subteams, and the student directory" },
    { href: "/", label: "tamubaja.com", note: "The full website" },
  ];

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-bg px-4 py-12">
      <Image src={site.heroImage} alt="" fill priority quality={60} sizes="100vw" className="-z-20 object-cover opacity-25 blur-sm" />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-maroon/80 via-bg/90 to-bg" />

      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/15">
          <Image src={car.photo} alt="The Texas A&M Baja SAE car" fill priority sizes="96px" className="object-cover" />
        </div>
        <div className="relative mt-5 h-12 w-44">
          <Image src={site.logo} alt={site.name} fill sizes="176px" className="object-contain" />
        </div>
        <p className="mt-3 text-sm text-white/75">Aggie engineers designing, building, and racing car&nbsp;#51.</p>

        <ul className="mt-8 w-full space-y-3">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                {...(link.external ? external : {})}
                className={`group flex items-center justify-between gap-4 rounded-md px-5 py-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                  link.primary
                    ? "bg-accent text-bg hover:bg-ink"
                    : "border border-white/15 bg-white/5 text-ink backdrop-blur hover:border-white/40 hover:bg-white/10"
                }`}
              >
                <span>
                  <span className="block font-display text-xl font-extrabold uppercase leading-tight">{link.label}</span>
                  <span className={`block text-xs ${link.primary ? "text-bg/75" : "text-white/60"}`}>{link.note}</span>
                </span>
                <span aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1">
                  {link.external ? "↗" : "→"}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex items-center gap-3">
          <a href={site.socials.instagram} {...external} aria-label="Instagram" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:text-[#e1306c]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
              <circle cx="12" cy="12" r="4.25" />
              <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
            </svg>
          </a>
          {site.socials.linkedin && (
            <a href={site.socials.linkedin} {...external} aria-label="LinkedIn" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:text-[#2d9cdb]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452z" />
              </svg>
            </a>
          )}
          <a href={`mailto:${site.email}`} aria-label="Email" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 transition-colors hover:text-accent">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
              <path d="m3 6 9 7 9-7" />
            </svg>
          </a>
        </div>
        <p className="mt-6 text-xs text-white/40">Texas A&amp;M Baja SAE · College Station, TX</p>
      </div>
    </div>
  );
}
