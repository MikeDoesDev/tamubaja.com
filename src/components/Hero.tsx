import Image from "next/image";
import Link from "next/link";
import type { Site } from "@/lib/schemas";
import { ButtonLink } from "./ButtonLink";
import { CountUp } from "./CountUp";
import { Plate } from "./Plate";
import { Eyebrow } from "./Section";

const QUICK_LINKS = [
  { href: "/car", label: "Meet the car" },
  { href: "/team", label: "Meet the team" },
  { href: "/development", label: "Join the team" },
];

/** Split hero: headline and actions on the left, the whole car photo on the right (never cropped tight). */
export function Hero({ site }: { site: Site }) {
  return (
    <section className="topo-bg relative overflow-hidden border-b border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-20 lg:pt-16">
        <div className="order-2 lg:order-1">
          <Eyebrow>{site.name}</Eyebrow>
          <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">{site.tagline}</h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            Aggie students design, build, and race a brand-new off-road car every season, against 100+ universities.
          </p>

          <div className="mt-8">
            <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="group flex items-center justify-between rounded-sm border border-line bg-panel/70 px-4 py-3 font-display text-lg font-bold uppercase tracking-wide transition-colors hover:border-accent/60 hover:bg-panel-2"
                >
                  {link.label}
                  <span aria-hidden="true" className="text-accent transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {site.homeStats.length > 0 && (
            <dl role="region" aria-label="Team highlights" className="mt-10 grid grid-cols-2 gap-y-6 border-t border-line pt-6 sm:grid-cols-4">
              {site.homeStats.map((stat) => (
                <div key={stat.label} className="flex flex-col sm:border-l sm:border-line sm:pl-4 sm:first:border-l-0 sm:first:pl-0">
                  <dt className="text-xs text-muted">{stat.label}</dt>
                  <dd className="order-first font-display text-4xl font-extrabold leading-none text-accent">
                    <CountUp value={stat.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="relative order-1 lg:order-2">
          <div className="relative aspect-[25/21] overflow-hidden rounded-3xl border border-line shadow-2xl shadow-black/40">
            <Image
              src={site.heroImage}
              alt="Texas A&M Baja SAE car #51 racing off-road"
              fill
              preload
              fetchPriority="high"
              quality={75}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-5 flex items-center gap-3 rounded-full border border-line bg-bg/90 py-2 pl-2 pr-5 backdrop-blur">
            <Plate number={51} className="!text-xl" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Our most recent car</span>
          </div>
        </div>
      </div>
    </section>
  );
}
