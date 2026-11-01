import Image from "next/image";
import Link from "next/link";
import { authConfigured } from "@/auth";
import { ButtonLink } from "@/components/ButtonLink";
import { DonateCard } from "@/components/DonateCard";
import { Faq } from "@/components/Faq";
import { InquiryForm } from "@/components/InquiryForm";
import { PillarCards } from "@/components/PillarCards";
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
      <section className="topo-bg border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-20 lg:pt-16">
          <div>
            <Eyebrow>Sponsorship</Eyebrow>
            <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">Partner with Texas A&amp;M Baja</h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              Put your brand on a car designed, built, and raced by Aggie engineers, and meet the students behind it.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="#inquire">Start a partnership</ButtonLink>
              <ButtonLink href="#tiers" variant="secondary">
                See the tiers
              </ButtonLink>
            </div>
            {authConfigured && (
              <p className="mt-6 text-sm text-muted">
                Already a sponsor?{" "}
                <Link
                  href="/sponsor-portal"
                  className="ml-1 inline-flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 font-display text-base font-bold uppercase tracking-wide text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                  </svg>
                  Sponsor login
                </Link>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative col-span-2 aspect-[16/9] overflow-hidden rounded-3xl border border-line">
              <Image
                src={site.heroImage}
                alt="Car #51 racing with sponsor logos on its body panels"
                fill
                preload
                quality={75}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_25%]"
              />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
              <Image src={site.teamPhoto} alt="The Texas A&M Baja SAE team" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
              <Image src="/images/cars/car-124-corner.jpg" alt="Car #124 cornering at competition" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Section className="bg-panel/40">
        <Eyebrow>Why partner with us</Eyebrow>
        <div className="mt-6">
          <PillarCards pillars={site.sponsorPillars} headingLevel="h2" />
        </div>
      </Section>

      <Section id="partners">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>In good company</Eyebrow>
            <SectionHeading>Our current partners</SectionHeading>
          </div>
          <p className="max-w-md text-muted">From global manufacturers to local shops, these partners put car #51 on the dirt.</p>
        </div>
        <SponsorGrid featured />
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

      <Section className="bg-panel/40">
        <SectionHeading>Sponsor FAQ</SectionHeading>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>
      <Section id="donate">
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

    </>
  );
}
