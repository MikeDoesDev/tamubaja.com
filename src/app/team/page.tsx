import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { LeadCard } from "@/components/LeadCard";
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

      {team.leads.length > 0 && (
        <Section id="leadership" className="bg-panel/40">
          <Eyebrow>Leadership</Eyebrow>
          <SectionHeading>Who runs the program</SectionHeading>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.leads.map((lead) => (
              <LeadCard key={lead.name} lead={lead} />
            ))}
          </ul>
        </Section>
      )}

      <Section id="subteams" className="topo-bg">
        <Eyebrow>Six subteams, one car</Eyebrow>
        <SectionHeading>Meet the subteams</SectionHeading>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Pick a subteam to see what it builds and who builds it, or{" "}
          <Link href="/team/directory" className="font-semibold text-accent underline underline-offset-4 hover:text-ink">
            browse the full student directory
          </Link>
          .
        </p>
        <div className="mt-8">
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
