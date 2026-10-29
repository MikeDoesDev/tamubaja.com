import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { SaeSchedule } from "@/components/SaeSchedule";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { getDevelopment, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Join Texas A&M Baja: development program, apprenticeships, and applying",
  description:
    "Join Texas A&M Baja SAE as a team member or apprentice. See the Texas A&M SAE development program schedule and apply on Pitcrew. Open to every major and class year.",
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
              <Eyebrow>{dev.sae.term} sessions</Eyebrow>
              <SectionHeading>{dev.sae.title}</SectionHeading>
              <p className="mt-4 text-lg text-muted">{dev.sae.intro}</p>
              <dl className="mt-6 space-y-3">
                {dev.sae.leads.map((lead) => (
                  <div key={lead.term}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                      {lead.term} {lead.names.length > 1 ? "leads" : "lead"}
                    </dt>
                    <dd className="font-display text-xl font-bold uppercase">{lead.names.join(" and ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <SaeSchedule sessions={dev.sae.sessions} builtAt={new Date().toISOString()} />
              {dev.sae.note && <p className="mt-3 text-sm text-muted">{dev.sae.note}</p>}
            </div>
          </div>
        </Section>
      )}

      <Section id="join" className="bg-panel/40">
        <Eyebrow>Joining the team</Eyebrow>
        <SectionHeading>Two ways in</SectionHeading>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {dev.paths.map((path) => (
            <article
              key={path.name}
              id={path.name.toLowerCase().replace(/[^a-z]+/g, "-")}
              className="flex flex-col rounded-sm border border-line bg-panel p-6"
            >
              <h3 className="font-display text-3xl font-extrabold uppercase leading-none">{path.name}</h3>
              <p className="mt-2 text-sm font-semibold text-accent">{path.who}</p>
              <p className="mt-4 text-muted">{path.description}</p>
              {path.points.length > 0 && (
                <ul className="mt-5 space-y-2 border-t border-line pt-5">
                  {path.points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Section>

      <section id="apply" className="slash-y bg-maroon px-4 pb-28 pt-28 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Apply on Pitcrew</h2>
            <p className="mt-3 text-white/85">
              Every Texas A&amp;M SAE team, Baja included, takes applications through Pitcrew, the SAE recruiting portal. One application covers
              team members and apprentices.
            </p>
            <div className="mt-6">
              <ButtonLink href={dev.applyUrl} external>
                Apply on Pitcrew
              </ButtonLink>
            </div>
          </div>
          <ol className="space-y-4">
            {dev.applySteps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="font-display text-3xl font-extrabold leading-none text-white/40">{String(index + 1).padStart(2, "0")}</span>
                <span className="pt-1 text-white/90">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
