import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadCard } from "@/components/LeadCard";
import { PageHero } from "@/components/PageHero";
import { Section, SectionHeading } from "@/components/Section";
import { getSite, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The team",
  description:
    "Meet the Aggie engineers and business students who design, build, test, and fund Texas A&M Baja SAE's car every year.",
  path: "/team",
});

export default function TeamPage() {
  const team = getTeam();
  const site = getSite();

  return (
    <>
      <PageHero
        eyebrow="The team"
        title="The team behind car #51"
        intro="Aggie engineers and business students who design, build, test, and fund a new off-road car every year."
      />

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading>Our story</SectionHeading>
            <div className="mt-6 space-y-4 text-lg text-muted">
              {team.story.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image src={site.teamPhoto} alt="Texas A&M Baja SAE team group photo" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      {team.leads.length > 0 && (
        <Section className="bg-panel/40">
          <SectionHeading>Leadership</SectionHeading>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.leads.map((lead) => (
              <LeadCard key={lead.name} lead={lead} />
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <SectionHeading>Subteams</SectionHeading>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
          {team.subteams.map((subteam) => (
            <li key={subteam.name} className="bg-panel p-6">
              <h3 className="font-display text-2xl font-extrabold uppercase">{subteam.name}</h3>
              <p className="mt-1 text-sm text-muted">{subteam.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <section className="slash-top bg-maroon px-4 pb-20 pt-28 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Hiring engineers?</h2>
            <p className="mt-3 text-white/85">Sponsors get our resume book and can recruit at team meetings.</p>
            <div className="mt-6">
              <ButtonLink href="/sponsors?interest=recruiting#inquire">Request our resume book</ButtonLink>
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-none">Want to join?</h2>
            <p className="mt-3 text-white/85">Open to every major and class year. Applications run through Texas A&amp;M SAE.</p>
            <div className="mt-6">
              <ButtonLink href="https://apply.tamusae.org/" variant="secondary" external>
                Join the team
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
