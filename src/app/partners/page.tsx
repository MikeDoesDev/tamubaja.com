import { CtaBand } from "@/components/CtaBand";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { SponsorGrid } from "@/components/SponsorGrid";
import { getCar, getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sponsors and partners",
  description:
    "The companies and organizations powering Texas A&M Baja SAE. Every part of car #51 is built with their support.",
  path: "/partners",
});

export default function PartnersPage() {
  const car = getCar();

  return (
    <>
      <PageHero
        eyebrow="Our sponsors"
        title="Powered by our partners"
        intro="Every part of car #51, from the frame to the gearbox, is built with help from these companies. Thank you."
        image={getSite().heroImage}
        imageAlt="Car #51 with sponsor logos on its body panels"
      />
      <Section>
        <SponsorGrid showNames headingLevel="h2" />
      </Section>
      <CtaBand
        title="Join them"
        body={`Put your logo on the ${car.buildSeason} car alongside these partners.`}
      />
    </>
  );
}
