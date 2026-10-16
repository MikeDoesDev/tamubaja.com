import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { StudentDirectory } from "@/components/StudentDirectory";
import { getTeam } from "@/lib/content";
import { buildDirectory } from "@/lib/directory";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Student talent directory",
  description:
    "Browse the Texas A&M Baja SAE engineers and business students who design, build, and race our off-road car. Filter by subteam, major, and graduation year.",
  path: "/team/directory",
});

export default function DirectoryPage() {
  const team = getTeam();
  const people = buildDirectory(team);

  return (
    <>
      <PageHero
        eyebrow="Student directory"
        title="Meet the people behind the car"
        intro="Every engineer and business student on Texas A&M Baja SAE. Filter by subteam, major, or graduation year to find the talent you're looking for."
        actions={
          <>
            <ButtonLink href="/sponsors?interest=recruiting#inquire">Request our resume book</ButtonLink>
            <ButtonLink href="/team" variant="secondary">
              Back to the team
            </ButtonLink>
          </>
        }
      />
      <Section>
        <StudentDirectory people={people} subteams={team.subteams.map((subteam) => subteam.name)} />
      </Section>
    </>
  );
}
