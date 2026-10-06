import { ButtonLink } from "@/components/ButtonLink";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { getSite } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Give",
  description:
    "Support Texas A&M Baja SAE with a tax-deductible gift through the Texas A&M Foundation, by check, or with in-kind donations.",
  path: "/give",
});

export default function GivePage() {
  const { giving, email } = getSite();
  const card = "rounded-sm border border-line bg-panel p-6 sm:p-8";

  return (
    <>
      <PageHero
        eyebrow="Give"
        title="Support the team"
        intro="Every gift helps buy materials, cover competition fees, and get car #51 to the start line. Gifts go through the Texas A&M Foundation and are tax-deductible."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          <article className={card}>
            <h2 className="font-display text-3xl font-extrabold uppercase">Give online</h2>
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-muted">
              {giving.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-muted">Account code</p>
            <p className="font-display text-4xl font-extrabold text-accent">{giving.accountCode}</p>
            <div className="mt-6">
              <ButtonLink href={giving.foundationUrl} external>
                Give through the Foundation
              </ButtonLink>
            </div>
          </article>
          <article className={card}>
            <h2 className="font-display text-3xl font-extrabold uppercase">Give by check</h2>
            <p className="mt-5 text-muted">
              Make checks payable to <strong className="text-ink">{giving.checkPayableTo}</strong> and mail to:
            </p>
            <address className="mt-4 not-italic text-lg">
              {giving.checkAddress.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </article>
        </div>
        <div className="mt-8 rounded-sm border border-dashed border-line p-6 sm:p-8">
          <h2 className="font-display text-3xl font-extrabold uppercase">Donating parts, tools, or services?</h2>
          <p className="mt-2 text-muted">Machining, materials, software, and discounts all help build the car.</p>
          <div className="mt-6">
            <ButtonLink href="/sponsors?interest=inkind#inquire" variant="secondary">
              Offer an in-kind donation
            </ButtonLink>
          </div>
        </div>
        <p className="mt-8 text-sm text-muted">
          Questions about giving? Email{" "}
          <a href={`mailto:${email}`} className="text-accent underline underline-offset-2">
            {email}
          </a>
          .
        </p>
      </Section>
    </>
  );
}
