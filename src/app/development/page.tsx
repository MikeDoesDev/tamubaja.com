import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SaeSchedule } from "@/components/SaeSchedule";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getDevelopment, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Join Texas A&M Baja: new member development program",
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

      {dev.sae && (
        <Section id="sae">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="inline-block rounded-sm border border-accent/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Running now
              </p>
              <div className="mt-4">
                <SectionHeading>{dev.sae.title}</SectionHeading>
              </div>
              <p className="mt-4 text-lg text-muted">{dev.sae.intro}</p>
              <dl className="mt-6 space-y-3">
                {dev.sae.leads.map((lead) => (
                  <div key={lead.term}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{lead.term} {lead.names.length > 1 ? "leads" : "lead"}</dt>
                    <dd className="font-display text-xl font-bold uppercase">{lead.names.join(" and ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <Eyebrow>{dev.sae.term} sessions</Eyebrow>
              <div className="mt-4">
                <SaeSchedule sessions={dev.sae.sessions} builtAt={new Date().toISOString()} />
              </div>
              {dev.sae.note && <p className="mt-3 text-sm text-muted">{dev.sae.note}</p>}
            </div>
          </div>
        </Section>
      )}

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
              Open to every major and class year, engineering or business. Applications run through Pitcrew, Texas A&amp;M SAE&apos;s recruiting portal.
            </p>
            <div className="mt-6">
              <ButtonLink href={dev.applyUrl} external>
                Apply on Pitcrew
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
