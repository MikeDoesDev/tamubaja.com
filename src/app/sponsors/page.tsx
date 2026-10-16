import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { DonateCard } from "@/components/DonateCard";
import { Faq } from "@/components/Faq";
import { InquiryForm } from "@/components/InquiryForm";
import { PageHero } from "@/components/PageHero";
import { SocialLinks } from "@/components/SocialLinks";
import { SponsorGrid } from "@/components/SponsorGrid";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { TierCard } from "@/components/TierCard";
import { getFaq, getSite, getTiers } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Sponsor Texas A&M Baja SAE",
  description:
    "Sponsorship tiers from $500, in-kind partnerships, and recruiting access to Texas A&M engineers. Put your logo on car #51.",
  path: "/sponsors",
});

export default function SponsorsPage() {
  const site = getSite();
  const { tiers, inKindCategories } = getTiers();
  const faq = getFaq();
  // E2E_WEB3FORMS_KEY is only set by playwright.config.ts for tests.
  const accessKey = process.env.E2E_WEB3FORMS_KEY || site.web3formsKey;

  return (
    <>
      <PageHero
        eyebrow="Sponsorship"
        title="Partner with Texas A&M Baja"
        intro="Put your brand on a car designed, built, and raced by Aggie engineers, and meet the students behind it."
        actions={
          <>
            <ButtonLink href="#inquire">Start a partnership</ButtonLink>
            <ButtonLink href="#tiers" variant="secondary">
              See the tiers
            </ButtonLink>
          </>
        }
      />

      <Section id="partners" className="bg-panel/40">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>In good company</Eyebrow>
            <SectionHeading>Our current partners</SectionHeading>
          </div>
          <p className="max-w-md text-muted">From global manufacturers to local shops, these partners put car #51 on the dirt.</p>
        </div>
        <SponsorGrid featured />
      </Section>

      <Section>
        <Eyebrow>Why partner with us</Eyebrow>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {site.sponsorPillars.map((pillar) => (
            <article key={pillar.title} className="overflow-hidden rounded-2xl border border-line bg-panel">
              {pillar.photo && (
                <div className="relative aspect-[16/10]">
                  <Image src={pillar.photo} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h2 className="font-display text-3xl font-extrabold uppercase">{pillar.title}</h2>
                <p className="mt-2 text-muted">{pillar.body}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="tiers" className="topo-bg">
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
          <div className="mt-6 flex flex-wrap gap-4">
            <ButtonLink href="/sponsors?interest=inkind#inquire" variant="secondary">
              Offer an in-kind donation
            </ButtonLink>
            <ButtonLink href="#donate" variant="secondary">
              Make a monetary donation
            </ButtonLink>
          </div>
        </div>
      </Section>

      <Section id="inquire">
        <div className="grid overflow-hidden rounded-3xl border border-line bg-panel lg:grid-cols-[1fr_1.45fr]">
          <div className="relative isolate overflow-hidden bg-maroon p-8 sm:p-10">
            <Image src="/images/cars/car-51-rear.jpg" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="-z-20 object-cover opacity-40" />
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-t from-maroon via-maroon/90 to-maroon/40" />
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Get started</p>
            <h2 className="font-display text-5xl font-extrabold uppercase leading-none">Become a sponsor</h2>
            <p className="mt-4 text-white/85">
              Tell us a little about your company. A member of our business team will reach out with next steps.
            </p>
            <ol className="mt-8 space-y-5">
              {[
                ["Send an inquiry", "Takes about a minute. No commitment."],
                ["We reply within 2 business days", `From ${site.email}.`],
                ["Build your package", "Pick a tier or shape one around your goals."],
              ].map(([title, body], index) => (
                <li key={title} className="flex gap-4">
                  <span className="w-10 shrink-0 font-display text-3xl font-extrabold leading-none text-white/40">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="block text-sm text-white/70">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <SocialLinks site={site} align="start" />
          </div>
          <div className="p-8 sm:p-10">
            <InquiryForm accessKey={accessKey} email={site.email} />
          </div>
        </div>
      </Section>

      <Section id="donate" className="bg-panel/40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="lg:pt-6">
            <Eyebrow>Individuals and alumni</Eyebrow>
            <SectionHeading>Make a donation</SectionHeading>
            <p className="mt-4 text-lg text-muted">
              Not a company? Every gift helps buy materials, cover competition fees, and get the car to the start line.
              Gifts go through the Texas A&amp;M Foundation and are tax-deductible.
            </p>
            <ul className="mt-6 space-y-2 text-muted">
              <li>▸ Raw materials and machining time</li>
              <li>▸ Competition registration and travel</li>
              <li>▸ Tools and safety gear for new members</li>
            </ul>
          </div>
          <DonateCard giving={site.giving} />
        </div>
      </Section>

      <Section>
        <SectionHeading>Sponsor FAQ</SectionHeading>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>
    </>
  );
}
