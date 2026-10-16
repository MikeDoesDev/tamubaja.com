import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getDevelopment, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Development",
  description:
    "Texas A&M Baja SAE's development program takes new members from their first meeting to owning a part on the car. Open to every major and class year.",
  path: "/development",
});

export default function DevelopmentPage() {
  const dev = getDevelopment();
  const site = getSite();

  return (
    <>
      <PageHero eyebrow="Development" title="Development program" intro={dev.intro} image={site.teamPhoto} imageAlt="Texas A&M Baja SAE team members" />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            {dev.status && (
              <p className="inline-block rounded-sm border border-accent/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {dev.status}
              </p>
            )}
            <div className="mt-4">
              <SectionHeading>Why we&apos;re building it</SectionHeading>
            </div>
          </div>
          <div className="space-y-4 text-lg text-muted">
            {dev.why.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section className="bg-panel/40">
        <Eyebrow>The path</Eyebrow>
        <SectionHeading>From first meeting to the car</SectionHeading>
        <ol className="mt-10 grid gap-px overflow-hidden rounded-sm bg-line md:grid-cols-2 lg:grid-cols-4">
          {dev.phases.map((phase, index) => (
            <li key={phase.name} className="bg-panel p-6">
              <p className="font-display text-5xl font-extrabold text-accent/40">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold uppercase">{phase.name}</h3>
              <p className="mt-2 text-sm text-muted">{phase.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <section id="join" className="slash-y bg-maroon px-4 pb-28 pt-28 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Join the team</h2>
            <p className="mt-3 text-white/85">
              Open to every major and class year, engineering or business. Applications run through Texas A&amp;M SAE.
            </p>
            <div className="mt-6">
              <ButtonLink href={dev.applyUrl} external>
                Apply through Texas A&amp;M SAE
              </ButtonLink>
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Support it instead?</h2>
            <p className="mt-3 text-white/85">Sponsors and donors keep the shop running and the program free for students.</p>
            <div className="mt-6">
              <ButtonLink href="/sponsors#inquire" variant="secondary">
                Become a sponsor
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
