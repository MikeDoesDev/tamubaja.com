import Image from "next/image";
import { CtaBand } from "@/components/CtaBand";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { PageHero } from "@/components/PageHero";
import { SeasonTimeline } from "@/components/SeasonTimeline";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { newestFirst } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The car",
  description:
    "Specs, subsystems, build timeline, and every competition result for Texas A&M Baja SAE's off-road cars.",
  path: "/car",
});

export default function CarPage() {
  const car = getCar();
  const site = getSite();
  const seasons = newestFirst(getSeasons());

  return (
    <>
      <PageHero
        eyebrow={`${car.season} · Car #51`}
        title={car.name}
        intro={car.summary}
        image={car.photo}
        imageAlt={`The Texas A&M Baja ${car.season} car`}
      />

      <Section>
        <SectionHeading>Specs</SectionHeading>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-4">
          {car.specs.map((spec) => (
            <div key={spec.label} className="flex flex-col bg-panel p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{spec.label}</dt>
              <dd className="mt-2 font-display text-2xl font-bold uppercase">{spec.value}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section className="bg-panel/40">
        <SectionHeading>Subsystems</SectionHeading>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {car.subsystems.map((subsystem) => (
            <article key={subsystem.name} className="overflow-hidden rounded-sm border border-line bg-panel">
              {subsystem.photo && (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={subsystem.photo}
                    alt={`${subsystem.name} on the ${car.season} car`}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-display text-2xl font-extrabold uppercase">{subsystem.name}</h3>
                <p className="mt-2 text-sm text-muted">{subsystem.description}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <Eyebrow>{car.buildSeason} build</Eyebrow>
        <SectionHeading>Building the next car</SectionHeading>
        <div className="mt-8">
          <MilestoneTimeline milestones={car.milestones} />
        </div>
      </Section>

      <Section id="history" className="bg-panel/40">
        <Eyebrow>Racing since 2018</Eyebrow>
        <SectionHeading>Competition history</SectionHeading>
        <div className="mt-10">
          <SeasonTimeline seasons={seasons} />
        </div>
      </Section>

      <CtaBand
        title="Put your name on the next car"
        body={`The ${car.buildSeason} car is being designed now. Partner with us to ride on it at Rollout and competition.`}
        packetPdf={site.packetPdf}
      />
    </>
  );
}
