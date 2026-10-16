import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { SocialLinks } from "./SocialLinks";
import { SponsorMarquee } from "./SponsorMarquee";

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
}

export function Footer() {
  const site = getSite();
  const link = "text-muted transition-colors hover:text-ink";
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
        <div className="mt-16 grid gap-12 border-t border-line pt-14 text-sm sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" aria-label={`${site.name} home`} className="relative block h-12 w-44">
              <Image src={site.logo} alt="" fill sizes="176px" className="object-contain object-left" />
            </Link>
            <p className="mt-4 max-w-xs text-muted">{site.tagline} Designed, built, and raced by Aggies in College Station.</p>
            <SocialLinks site={site} align="start" />
          </div>

          <nav aria-label="Footer">
            <ColumnHeading>Explore</ColumnHeading>
            <ul className="space-y-3">
              {NAV_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sponsors" className={link}>
                  Become a Sponsor
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <ColumnHeading>Get in touch</ColumnHeading>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${site.email}`} className={`break-all ${link}`}>
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.packetPdf} download className={link}>
                  Sponsor packet (PDF)
                </a>
              </li>
              <li>
                <Link href="/give" className={link}>
                  Give through the A&amp;M Foundation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. Part of{" "}
            <a href="https://www.tamusae.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
              Texas A&amp;M SAE
            </a>
            .
          </p>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-ink/60">Car #51 · Gig &apos;em</p>
        </div>
      </div>
    </footer>
  );
}
