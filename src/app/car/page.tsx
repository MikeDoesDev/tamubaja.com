import Image from "next/image";
import Link from "next/link";
import { BuildStatus } from "@/components/BuildStatus";
import { CtaBand } from "@/components/CtaBand";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { PageHero } from "@/components/PageHero";
import { CarHistory } from "@/components/CarHistory";
import { buildCarYears } from "@/lib/cars";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getCar, getSeasons } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Our Baja SAE car: build, results, and history",
  description:
    "Follow Texas A&M Baja SAE's car from clean sheet to competition: where this season's build stands, how we build every car, and our full competition history.",
  path: "/car",
});

export default function CarPage() {
  const car = getCar();
  const years = buildCarYears(getSeasons(), car.garage);

  return (
    <>
      <PageHero
        eyebrow="Follow the car"
        title="From clean sheet to the dirt"
        intro={`Every season we design, build, and race a brand-new off-road car. Here's where the ${car.buildSeason} car stands, how we build it, and every car that came before it.`}
        image={car.photo}
        imageAlt={`The Texas A&M Baja ${car.season} car`}
      />

      <Section id="now" className="topo-bg">
        <Eyebrow>Where we are now</Eyebrow>
        <SectionHeading>Building the {car.buildSeason} car</SectionHeading>
        <div className="mt-8">
          <BuildStatus milestones={car.milestones} buildSeason={car.buildSeason} builtAt={new Date().toISOString()} />
        </div>
        <div className="mt-10">
          <MilestoneTimeline milestones={car.milestones} builtAt={new Date().toISOString()} />
        </div>
        <p className="mt-4 text-sm text-muted">
          Want your logo on this car?{" "}
          <Link href="/sponsors#tiers" className="font-semibold text-ink underline decoration-accent underline-offset-4">
            See what each sponsor tier includes
          </Link>
          .
        </p>
      </Section>

      {car.buildProcess.length > 0 && (
        <Section id="process" className="bg-panel/40">
          <Eyebrow>How we build it</Eyebrow>
          <SectionHeading>One car, every year</SectionHeading>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-sm bg-line md:grid-cols-2 lg:grid-cols-5">
            {car.buildProcess.map((step, index) => (
              <li key={step.name} className="bg-panel p-6">
                <p className="font-display text-5xl font-extrabold text-accent/40">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold uppercase">{step.name}</h3>
                <p className="mt-2 text-sm text-muted">{step.description}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}

      <Section id="inside">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>Inside the car</Eyebrow>
            <SectionHeading>What goes into a car</SectionHeading>
            <p className="mt-4 text-lg text-muted">{car.summary}</p>
            <div className="relative mt-8 aspect-[4/3] overflow-hidden rounded-sm">
              <Image src={car.photo} alt={`The Texas A&M Baja ${car.season} car`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
          </div>
          <div className="grid gap-4">
            {car.subsystems.map((subsystem) => (
              <article key={subsystem.name} className="overflow-hidden rounded-sm border border-line bg-panel">
                {subsystem.photo && (
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={subsystem.photo}
                      alt={`${subsystem.name} on the ${car.season} car`}
                      fill
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-display text-2xl font-extrabold uppercase">{subsystem.name}</h3>
                  <p className="mt-2 text-muted">{subsystem.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section id="history" className="topo-bg">
        <span id="garage" className="block scroll-mt-24" />
        <Eyebrow>The garage · racing since 2018</Eyebrow>
        <SectionHeading>Every car has a number</SectionHeading>
        <p className="mt-4 max-w-2xl text-lg text-muted">Every car we&apos;ve raced and how it finished, newest first. Tap a car for its page.</p>
        <div className="mt-10">
          <CarHistory years={years} />
        </div>
      </Section>

      <CtaBand
        title="Put your name on the next car"
        body={`The ${car.buildSeason} car is being designed now. Partner with us to ride on it at Rollout and competition.`}
      />
    </>
  );
}
