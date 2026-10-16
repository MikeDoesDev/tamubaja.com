import Image from "next/image";
import Link from "next/link";
import { BuildStatus } from "@/components/BuildStatus";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Hero } from "@/components/Hero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { StatsStrip } from "@/components/StatsStrip";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { ordinal } from "@/lib/format";
import type { Season } from "@/lib/schemas";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Texas A&M Baja SAE — Engineered to conquer the toughest terrain",
  description:
    "Texas A&M Baja SAE designs, builds, and races a new off-road car every year against 100+ universities. Sponsor the team behind car #51.",
  path: "/",
  absolute: true,
});

export default function HomePage() {
  const site = getSite();
  const car = getCar();
  const bestFinishes = getSeasons()
    .filter((season): season is Season & { overall: number } => season.overall !== null)
    .sort((a, b) => a.overall - b.overall)
    .slice(0, 3);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    logo: `${site.url}${site.logo}`,
    email: site.email,
    sameAs: [site.socials.instagram, ...(site.socials.linkedin ? [site.socials.linkedin] : [])],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\u003c") }} />
      <Hero site={site} />
      <StatsStrip stats={site.homeStats} />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <SectionHeading>Built by Aggies. Raced in the dirt.</SectionHeading>
            <div className="mt-6 space-y-4 text-lg text-muted">
              {site.mission.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={site.teamPhoto} alt="Texas A&M Baja SAE team members" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section className="bg-panel/40">
        <Eyebrow>Why sponsor</Eyebrow>
        <SectionHeading>What your support gets you</SectionHeading>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {site.sponsorPillars.map((pillar) => (
            <article key={pillar.title} className="rounded-sm border border-line bg-panel p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{pillar.title}</h3>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href="/sponsors">See sponsorship tiers</ButtonLink>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={car.photo} alt={`The Texas A&M Baja ${car.season} car`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Eyebrow>Where we are now</Eyebrow>
            <SectionHeading>Building the {car.buildSeason} car</SectionHeading>
            <p className="mt-4 text-lg text-muted">
              A new car every season, designed and built by students from a clean sheet. Here&apos;s where this one stands.
            </p>
            <div className="mt-6">
              <BuildStatus milestones={car.milestones} buildSeason={car.buildSeason} />
            </div>
            <div className="mt-6">
              <ButtonLink href="/car" variant="secondary">
                Follow the car
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      <Section className="bg-panel/40">
        <Eyebrow>Best finishes</Eyebrow>
        <SectionHeading>Racing against 100+ universities</SectionHeading>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {bestFinishes.map((season) => (
            <li key={season.season} className="rounded-sm border border-line bg-panel p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{season.season}</p>
              <p className="mt-1 font-display text-2xl font-extrabold uppercase">{season.event}</p>
              <p className="mt-3 font-display text-5xl font-extrabold text-accent">{ordinal(season.overall)}</p>
              <p className="text-xs uppercase tracking-wide text-muted">Overall</p>
              {season.highlights[0] && <p className="mt-3 text-sm text-muted">{season.highlights[0]}</p>}
            </li>
          ))}
        </ul>
        <Link href="/car#history" className="mt-8 inline-block font-semibold text-accent underline underline-offset-4">
          Full competition history
        </Link>
      </Section>

      <CtaBand
        title="Put your name on the car"
        body="Join the companies helping Aggie engineers design, build, and race car #51."
      />
    </>
  );
}
