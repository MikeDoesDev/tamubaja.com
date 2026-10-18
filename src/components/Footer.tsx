import Image from "next/image";
import Link from "next/link";
import { buildCarYears, carHref } from "@/lib/cars";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { Plate } from "./Plate";
import { SocialLinks } from "./SocialLinks";
import { SponsorMarquee } from "./SponsorMarquee";

type FooterLink = { href: string; label: React.ReactNode; key: string };

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <p className="font-display text-xl font-extrabold uppercase tracking-wide">{title}</p>
      <span aria-hidden="true" className="mt-2 block h-0.5 w-8 rounded-full bg-maroon" />
      <ul className="mt-5 space-y-3 text-sm">
        {links.map((item) => {
          const className = "group inline-flex items-center gap-2 text-muted transition-colors hover:text-ink";
          const content = (
            <>
              {item.label}
              <span aria-hidden="true" className="-translate-x-1 text-accent opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </>
          );
          return (
            <li key={item.key}>
              {item.href.startsWith("mailto:") ? (
                <a href={item.href} className={className}>
                  {content}
                </a>
              ) : (
                <Link href={item.href} className={className}>
                  {content}
                </Link>
              )}
            </li>
          );
        })}
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

      <div className="topo-bg mt-16 border-t-2 border-maroon">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_2.7fr]">
            <div>
              <Link href="/" aria-label={`${site.name} home`} className="relative block h-12 w-44">
                <Image src={site.logo} alt="" fill sizes="176px" className="object-contain object-left" />
              </Link>
              <p className="mt-4 max-w-xs text-sm text-muted">{site.tagline}</p>
              <SocialLinks site={site} align="start" />
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <FooterColumn
                title="About us"
                links={[
                  { key: "team", href: "/team", label: "Meet the team" },
                  { key: "leadership", href: "/team#leadership", label: "Leadership" },
                  { key: "directory", href: "/team/directory", label: "Student directory" },
                  { key: "partners", href: "/partners", label: "Our partners" },
                ]}
              />
              <FooterColumn
                title="Get involved"
                links={[
                  { key: "join", href: "/development", label: "Join the team" },
                  { key: "sponsor", href: "/sponsors", label: "Become a sponsor" },
                  { key: "donate", href: "/sponsors#donate", label: "Donate" },
                  { key: "contact", href: `mailto:${site.email}`, label: "Contact us" },
                ]}
              />
              <FooterColumn
                title="Cars"
                links={[
                  { key: "build", href: "/car#now", label: `${car.buildSeason} build` },
                  ...years.slice(0, 3).map((year) => ({
                    key: year.slug,
                    href: carHref(year),
                    label: (
                      <span className="inline-flex items-center gap-2.5">
                        {year.number && <Plate number={year.number} className="!min-w-10 !rounded-md !px-1.5 !text-sm" />}
                        {year.season}
                      </span>
                    ),
                  })),
                  { key: "all", href: "/car#history", label: "All cars and results" },
                ]}
              />
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-end sm:justify-between">
            <p className="leading-relaxed">
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
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Gig &apos;em</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
