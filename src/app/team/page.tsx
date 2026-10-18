import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { PersonPlaceholder } from "@/components/PersonPlaceholder";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { SubteamExplorer } from "@/components/SubteamExplorer";
import { getSite, getTeam } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Meet the team",
  description:
    "Meet the Aggie engineers and business students who design, build, test, and fund Texas A&M Baja SAE's car every year.",
  path: "/team",
});

export default function TeamPage() {
  const team = getTeam();
  const site = getSite();
  // Leads who run a subteam appear on that subteam's tile; the rest (project manager, chief engineer) get their own cards.
  const subteamLeadNames = new Set(team.subteams.flatMap((subteam) => subteam.leads.map((lead) => lead.name)));
  const programLeads = team.leads.filter((lead) => !subteamLeadNames.has(lead.name));

  return (
    <>
      <PageHero
        eyebrow="The team"
        title="The team behind car #51"
        intro="Aggie engineers and business students who design, build, test, and fund a new off-road car every year."
        image={site.teamPhoto}
        imageAlt="Texas A&M Baja SAE team with the car"
        actions={
          <ButtonLink href="/team/directory">Browse the student directory</ButtonLink>
        }
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
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={site.teamPhoto} alt="Texas A&M Baja SAE team group photo" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section id="subteams" className="topo-bg">
        <span id="leadership" className="block scroll-mt-24" />
        <Eyebrow>Six subteams, one car</Eyebrow>
        <SectionHeading>Who builds the car</SectionHeading>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Our program leads run the season; each subteam owns a part of the car. Pick a subteam to meet its people, or{" "}
          <Link href="/team/directory" className="font-semibold text-accent underline underline-offset-4 hover:text-ink">
            browse the full student directory
          </Link>
          .
        </p>

        {programLeads.length > 0 && (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {programLeads.map((lead) => (
              <li key={lead.name} className="flex items-center gap-5 rounded-2xl border border-accent/40 bg-panel p-5">
                <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-[#101214]">
                  {lead.photo ? <Image src={lead.photo} alt="" fill sizes="80px" className="object-cover" /> : <PersonPlaceholder />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{lead.role}</span>
                  <span className="block font-display text-3xl font-extrabold uppercase leading-tight">{lead.name}</span>
                  <span className="block text-sm text-muted">
                    {[lead.major, lead.classYear && `Class of ${lead.classYear}`].filter(Boolean).join(" · ")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <SubteamExplorer subteams={team.subteams} />
        </div>
      </Section>

      <section className="slash-y bg-maroon px-4 pb-28 pt-28 sm:px-6">
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
            <p className="mt-3 text-white/85">Open to every major and class year. See how new members get started.</p>
            <div className="mt-6">
              <ButtonLink href="/development" variant="secondary">
                How to join
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
