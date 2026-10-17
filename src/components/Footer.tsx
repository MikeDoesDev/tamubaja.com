import Image from "next/image";
import Link from "next/link";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { buildCarYears, carHref } from "@/lib/cars";
import { SocialLinks } from "./SocialLinks";
import { SponsorMarquee } from "./SponsorMarquee";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{title}</p>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            {item.href.startsWith("mailto:") ? (
              <a href={item.href} className="text-muted transition-colors hover:text-ink">
                {item.label}
              </a>
            ) : (
              <Link href={item.href} className="text-muted transition-colors hover:text-ink">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const site = getSite();
  const car = getCar();
  const years = buildCarYears(getSeasons(), car.garage);
  return (
    <footer className="bg-bg">
      {/* The logo strip runs edge to edge; the rest of the footer keeps the content width. */}
      <div className="pt-16">
        <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our partners</p>
        <SponsorMarquee />
        <p className="mt-6 text-center">
          <Link href="/partners" className="text-sm font-semibold text-ink underline decoration-accent underline-offset-4 hover:text-accent">
            See all our partners
          </Link>
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="mt-16 grid gap-12 border-t border-line pt-14 text-sm sm:grid-cols-3 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-3 lg:col-span-1">
            <Link href="/" aria-label={`${site.name} home`} className="relative block h-12 w-44">
              <Image src={site.logo} alt="" fill sizes="176px" className="object-contain object-left" />
            </Link>
            <p className="mt-4 max-w-xs text-muted">{site.tagline}</p>
            <SocialLinks site={site} align="start" />
          </div>

          <FooterColumn
            title="About us"
            links={[
              { href: "/team", label: "Meet the team" },
              { href: "/team/directory", label: "Student directory" },
              { href: "/partners", label: "Our partners" },
            ]}
          />
          <FooterColumn
            title="Get involved"
            links={[
              { href: "/development", label: "Join the team" },
              { href: "/sponsors", label: "Become a sponsor" },
              { href: "/sponsors#donate", label: "Donate" },
              { href: `mailto:${site.email}`, label: "Contact us" },
            ]}
          />
          <FooterColumn
            title="Cars"
            links={[
              { href: "/car#now", label: `${car.buildSeason} build` },
              ...years.slice(0, 4).map((year) => ({ href: carHref(year), label: year.number ? `#${year.number} · ${year.season}` : `${year.season} car` })),
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            Texas A&amp;M Baja SAE is a team within{" "}
            <a
              href={site.socials.saeBaja ?? "https://www.tamusae.org"}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              Texas A&amp;M SAE
            </a>
            , a registered student organization at Texas A&amp;M University.
            <br />
            Copyright © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Car #51 · Gig &apos;em</p>
        </div>
      </div>
    </footer>
  );
}
