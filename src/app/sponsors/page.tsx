import { ButtonLink } from "@/components/ButtonLink";
import { Faq } from "@/components/Faq";
import { InquiryForm } from "@/components/InquiryForm";
import { LogoWall } from "@/components/LogoWall";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { PageHero } from "@/components/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { TierCard } from "@/components/TierCard";
import { getCar, getFaq, getSite, getTiers } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sponsor the team",
  description:
    "Sponsorship tiers from $500, in-kind partnerships, and recruiting access to Texas A&M engineers. Put your logo on car #51.",
  path: "/sponsors",
});

export default function SponsorsPage() {
  const site = getSite();
  const { tiers, inKindCategories } = getTiers();
  const car = getCar();
  const faq = getFaq();
  // E2E_WEB3FORMS_KEY is only set by playwright.config.ts for tests.
  const accessKey = process.env.E2E_WEB3FORMS_KEY || site.web3formsKey;

  return (
    <>
      <PageHero
        eyebrow="Sponsorship"
        title="Partner with Texas A&M Baja"
        intro="Put your brand on a car designed, built, and raced by Aggie engineers, and meet the students behind it."
      />

      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {site.sponsorPillars.map((pillar) => (
            <div key={pillar.title} className="border-t-2 border-accent pt-5">
              <h2 className="font-display text-3xl font-extrabold uppercase">{pillar.title}</h2>
              <p className="mt-2 text-muted">{pillar.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="tiers" className="bg-panel/40">
        <Eyebrow>Financial sponsorship</Eyebrow>
        <SectionHeading>Sponsorship tiers</SectionHeading>
        <p className="mt-4 max-w-2xl text-muted">
          Each tier includes everything in the tiers below it. Packages are a starting point. We&apos;ll shape one around your goals.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => (
            <TierCard key={tier.id} tier={tier} lowerTierName={index > 0 ? tiers[index - 1].name : undefined} />
          ))}
        </div>
        <div className="mt-10 rounded-sm border border-line bg-panel p-6 sm:p-8">
          <h3 className="font-display text-3xl font-extrabold uppercase">Technical and in-kind donations</h3>
          <p className="mt-2 text-muted">Parts, tools, software, machining, and services keep the car moving. We gratefully accept:</p>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {inKindCategories.map((category) => (
              <div key={category.name}>
                <dt className="font-semibold">{category.name}</dt>
                <dd className="mt-1 text-sm text-muted">{category.examples}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <ButtonLink href="/sponsors?interest=inkind#inquire" variant="secondary">
              Offer an in-kind donation
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section>
        <Eyebrow>{car.buildSeason} season</Eyebrow>
        <SectionHeading>Where your logo goes</SectionHeading>
        <p className="mt-4 max-w-2xl text-muted">
          Sponsors who commit early ride on the car from first drive through Rollout and competition.
        </p>
        <div className="mt-8">
          <MilestoneTimeline milestones={car.milestones} />
        </div>
      </Section>

      <Section className="bg-panel/40">
        <SectionHeading>Current partners</SectionHeading>
        <div className="mt-10">
          <LogoWall size="lg" />
        </div>
      </Section>

      <Section>
        <SectionHeading>Sponsor FAQ</SectionHeading>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>

      <Section id="inquire" className="bg-panel/40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>Get started</Eyebrow>
            <SectionHeading>Become a sponsor</SectionHeading>
            <p className="mt-4 text-muted">
              Tell us a little about your company and we&apos;ll follow up with next steps. Want the full details first? Download our sponsorship packet.
            </p>
            <div className="mt-6">
              <ButtonLink href={site.packetPdf} variant="secondary" download>
                Download the packet (PDF)
              </ButtonLink>
            </div>
          </div>
          <InquiryForm accessKey={accessKey} email={site.email} />
        </div>
      </Section>
    </>
  );
}
