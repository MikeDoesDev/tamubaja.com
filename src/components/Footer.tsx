import { getSite } from "@/lib/content";
import Link from "next/link";
import { SponsorMarquee } from "./SponsorMarquee";

export function Footer() {
  const site = getSite();
  const link = "transition-colors hover:text-ink";
  return (
    <footer className="border-t border-line bg-black/30">
      {/* The logo strip runs edge to edge; the rest of the footer keeps the content width. */}
      <div className="pt-14">
        <h2 className="mb-6 text-center font-display text-2xl font-extrabold uppercase">Our partners</h2>
        <SponsorMarquee />
        <p className="mt-6 text-center">
          <Link href="/partners" className="text-sm font-semibold text-accent underline underline-offset-4">
            See all our partners
          </Link>
        </p>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="mt-14 grid gap-8 border-t border-line pt-10 text-sm text-muted sm:grid-cols-3">
          <div>
            <p className="font-display text-xl font-bold uppercase text-ink">{site.name}</p>
            <p className="mt-2">{site.tagline}</p>
          </div>
          <div>
            <p className="font-semibold text-ink">Contact</p>
            <a href={`mailto:${site.email}`} className={`mt-2 block ${link}`}>
              {site.email}
            </a>
          </div>
          <div>
            <p className="font-semibold text-ink">Follow</p>
            <ul className="mt-2 space-y-1">
              <li>
                <a href={site.socials.instagram} target="_blank" rel="noopener noreferrer" className={link}>
                  Instagram
                </a>
              </li>
              {site.socials.linkedin && (
                <li>
                  <a href={site.socials.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                    LinkedIn
                  </a>
                </li>
              )}
              <li>
                <a href={site.socials.linktree} target="_blank" rel="noopener noreferrer" className={link}>
                  Linktree
                </a>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-xs text-muted">
          Part of{" "}
          <a href="https://www.tamusae.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Texas A&amp;M SAE
          </a>
          . © {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
