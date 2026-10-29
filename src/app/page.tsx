import Image from "next/image";
import Link from "next/link";
import { BuildStatus } from "@/components/BuildStatus";
import { CarCard } from "@/components/CarHistory";
import { ButtonLink } from "@/components/ButtonLink";
import { CtaBand } from "@/components/CtaBand";
import { Hero } from "@/components/Hero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { PillarCards } from "@/components/PillarCards";
import { FollowAlong, RecentEvents } from "@/components/RecentEvents";
import { VideoFeature } from "@/components/VideoFeature";
import { getCar, getEvents, getSeasons, getSite } from "@/lib/content";
import { buildCarYears, type CarYear } from "@/lib/cars";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Texas A&M Baja SAE | TAMU Baja Off-Road Racing Team",
  description:
    "Texas A&M Baja SAE (TAMU Baja) is the Aggie student team in College Station that designs, builds, and races a new off-road car in the Baja SAE collegiate series. Sponsor car #51 or join the team.",
  path: "/",
  absolute: true,
});

export default function HomePage() {
  const site = getSite();
  const car = getCar();
  const events = getEvents().slice(0, 3);
  const years = buildCarYears(getSeasons(), car.garage);
  const featuredCars = years.filter((year): year is CarYear & { photo: string } => Boolean(year.photo)).slice(0, 3);
  const earlier = years.filter((year) => !year.photo);
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    alternateName: ["TAMU Baja", "Texas A&M Baja", "Aggie Baja SAE", "TAMU Baja SAE"],
    url: site.url,
    parentOrganization: { "@type": "Organization", name: "Texas A&M SAE", url: "https://www.tamusae.org" },
    logo: `${site.url}${site.logo}`,
    email: site.email,
    sameAs: [site.socials.instagram, ...(site.socials.linkedin ? [site.socials.linkedin] : [])],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\u003c") }} />
      <Hero site={site} />
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

      {events.length > 0 && (
        <Section id="events" className="bg-panel/40">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Recent events</Eyebrow>
              <SectionHeading>What we&apos;ve been up to</SectionHeading>
            </div>
            <FollowAlong socials={site.socials} />
          </div>
          <RecentEvents events={events} />
        </Section>
      )}

      {site.videos.length > 0 && (
        <Section className="topo-bg">
          <Eyebrow>Baja on screen</Eyebrow>
          <SectionHeading>See the team in action</SectionHeading>
          <div className={`mt-10 grid gap-8 ${site.videos.length > 1 ? "lg:grid-cols-[1.5fr_1fr]" : ""}`}>
            {site.videos.slice(0, 2).map((video, index) => (
              <article key={video.youtubeId} className={index > 0 ? "lg:pt-16" : ""}>
                <VideoFeature youtubeId={video.youtubeId} title={video.title} poster={video.poster} />
                <h3 className={`mt-5 font-display font-extrabold uppercase leading-none ${index === 0 ? "text-3xl" : "text-2xl"}`}>{video.title}</h3>
                <p className="mt-2 text-muted">{video.body}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-semibold text-accent underline underline-offset-4 hover:text-ink"
                >
                  Watch on YouTube
                </a>
              </article>
            ))}
          </div>
        </Section>
      )}

      <Section className="bg-panel/40">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>Why sponsor</Eyebrow>
            <SectionHeading>Why partner with us</SectionHeading>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
            <ButtonLink href="/sponsors#tiers" variant="secondary">
              See the tiers
            </ButtonLink>
          </div>
        </div>
        <div className="mt-10">
          <PillarCards pillars={site.sponsorPillars} />
        </div>
      </Section>

      <Section className="topo-bg">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={car.photo} alt={`The Texas A&M Baja ${car.season} car`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Eyebrow>Where we are now</Eyebrow>
            <SectionHeading>Building the {car.buildSeason} car</SectionHeading>
            <p className="mt-4 text-lg text-muted">
              A new car every season, designed and built by students from a clean sheet. Here&apos;s where this one stands.
            </p>
            <div className="mt-6">
              <BuildStatus milestones={car.milestones} buildSeason={car.buildSeason} builtAt={new Date().toISOString()} />
            </div>
            <div className="mt-6">
              <ButtonLink href="/car" variant="secondary">
                Follow the car
              </ButtonLink>
            </div>
          </div>
        </div>
      </Section>

      {featuredCars.length > 0 && (
        <Section>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow>The garage · racing since 2018</Eyebrow>
              <SectionHeading>Every car has a number</SectionHeading>
            </div>
            <Link href="/car#history" className="font-semibold text-accent underline underline-offset-4 hover:text-ink">
              All cars and results
            </Link>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((year) => (
              <CarCard key={year.slug} year={year} />
            ))}
          </ul>
          {earlier.length > 0 && (
            <p className="mt-6 text-sm text-muted">
              Plus {earlier.length} earlier seasons, back to our first race in {earlier.at(-1)?.season}.{" "}
              <Link href="/car#history" className="font-semibold text-ink underline decoration-accent underline-offset-4">
                See them all
              </Link>
            </p>
          )}
        </Section>
      )}

      <CtaBand
        title="Put your name on the car"
        body="Join the companies helping Aggie engineers design, build, and race car #51."
      />
    </>
  );
}
