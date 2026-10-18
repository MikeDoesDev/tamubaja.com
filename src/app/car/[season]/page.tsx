import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Placement } from "@/components/CarHistory";
import { CtaBand } from "@/components/CtaBand";
import { Plate } from "@/components/Plate";
import { Eyebrow, Section } from "@/components/Section";
import { buildCarYears, carHref, carName, type CarYear } from "@/lib/cars";
import { getCar, getSeasons, getSite } from "@/lib/content";
import { ordinal } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

const allYears = () => buildCarYears(getSeasons(), getCar().garage);

export function generateStaticParams() {
  return allYears().map((year) => ({ season: year.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const year = allYears().find((entry) => entry.slug === season);
  if (!year) return {};
  const result = typeof year.overall === "number" ? `, ${ordinal(year.overall)} overall at ${year.event}` : year.event ? ` at ${year.event}` : "";
  return pageMetadata({
    title: `${carName(year)} (${year.season}) | Texas A&M Baja SAE`,
    description: `Texas A&M Baja SAE's ${year.season} off-road car${result}.${year.highlights.length ? ` ${year.highlights.join(". ")}.` : ""}`,
    path: carHref(year),
  });
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-panel p-5 sm:p-6">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</dt>
      <dd className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight">{children}</dd>
    </div>
  );
}

function Neighbor({ year, label, align }: { year?: CarYear; label: string; align: "left" | "right" }) {
  if (!year) return <span />;
  return (
    <Link
      href={carHref(year)}
      className={`group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent/50 ${align === "right" ? "text-right" : ""}`}
    >
      <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{label}</span>
      <span className="mt-1 block font-display text-2xl font-extrabold uppercase">
        {year.season}
        {year.number ? ` · #${year.number}` : ""}
      </span>
    </Link>
  );
}

export default async function CarYearPage({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const years = allYears();
  const index = years.findIndex((entry) => entry.slug === season);
  if (index === -1) notFound();
  const year = years[index];
  const site = getSite();

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        {year.photo && (
          <>
            <Image src={year.photo} alt="" fill preload quality={60} sizes="100vw" className="-z-20 object-cover opacity-45" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 to-bg/20" />
          </>
        )}
        {!year.photo && <div className="topo-bg absolute inset-0 -z-10 opacity-60" />}
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
          <Link href="/car#history" className="text-sm font-semibold text-muted hover:text-ink">
            ← All our cars
          </Link>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {year.number && <Plate number={year.number} className="!text-4xl" />}
            <Eyebrow>{year.season} season</Eyebrow>
          </div>
          <h1 className="mt-2 font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">{carName(year)}</h1>
          {year.event && (
            <p className="mt-4 text-lg text-muted">
              {year.event}
              {year.location && !year.event.includes(year.location) ? ` · ${year.location}` : ""}
            </p>
          )}
        </div>
      </section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {year.photo && (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                <Image src={year.photo} alt={`${carName(year)}, ${year.season}`} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              </div>
            )}
            {year.gallery.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {year.gallery.map((src) => (
                  <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line">
                    <Image src={src} alt={`${carName(year)}, ${year.season}`} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
            {year.description && <p className={`${year.photo ? "mt-6" : ""} text-lg text-muted`}>{year.description}</p>}
            {!year.photo && (
              <p className={`${year.description ? "mt-4" : ""} rounded-2xl border border-dashed border-line p-8 text-muted`}>
                We&apos;re still collecting photos and stories from this season. Raced on this car or have pictures?{" "}
                <a href={`mailto:${site.email}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                  Send them our way
                </a>
                .
              </p>
            )}
          </div>

          <div>
            <div className="flex items-start justify-between gap-6 rounded-2xl border border-line bg-panel p-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Competition</p>
                <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-none">{year.event ?? "To be announced"}</p>
              </div>
              <Placement year={year} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
              <Stat label="Season">{year.season}</Stat>
              <Stat label="Car number">{year.number ? `#${year.number}` : "—"}</Stat>
              <Stat label="Location">{year.location ?? "—"}</Stat>
              <Stat label="Livery">{year.livery ?? "—"}</Stat>
            </dl>

            {year.improvement && (
              <div className="mt-4 rounded-2xl border-l-4 border-maroon bg-maroon/25 p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Step forward</p>
                <p className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{year.improvement}</p>
              </div>
            )}

            {year.highlights.length > 0 && (
              <div className="mt-4 rounded-2xl border border-line bg-panel p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Recognition</p>
                <ul className="mt-3 space-y-2">
                  {year.highlights.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="text-accent">
                        ★
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <h2 className="font-display text-3xl font-extrabold uppercase">Specs</h2>
            {year.specs.length > 0 ? (
              <dl className="mt-5 divide-y divide-line">
                {year.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between gap-6 py-3">
                    <dt className="text-sm text-muted">{spec.label}</dt>
                    <dd className="text-right font-semibold">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-3 text-muted">
                We&apos;re pulling this car&apos;s spec sheet from the team archives. Check back soon.
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-line bg-panel p-6 sm:p-8">
            <h2 className="font-display text-3xl font-extrabold uppercase">The team behind it</h2>
            {year.leads.length > 0 ? (
              <ul className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {year.leads.map((lead) => (
                  <li key={`${lead.role}-${lead.name}`}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{lead.role}</p>
                    <p className="font-display text-xl font-bold uppercase">{lead.name}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted">
                Led this car or know who did?{" "}
                <a href={`mailto:${site.email}?subject=${encodeURIComponent(`${year.season} car leads`)}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                  Tell us
                </a>{" "}
                so we can credit the leads and members who built it.
              </p>
            )}
          </div>
        </div>

        <nav aria-label="More cars" className="mt-10 grid grid-cols-2 gap-4">
          <Neighbor year={years[index - 1]} label="← Newer" align="left" />
          <Neighbor year={years[index + 1]} label="Older →" align="right" />
        </nav>
      </Section>

      <CtaBand title="Put your name on the next car" body="Partner with us to ride on the next car at Rollout and competition." />
    </>
  );
}
