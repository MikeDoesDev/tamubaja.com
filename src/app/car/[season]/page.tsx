import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Plate } from "@/components/Plate";
import { Eyebrow } from "@/components/Section";
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

/** Section label like a race stage: "01 / The season". */
function StageHeading({ n, id, children }: { n: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <span className="font-display text-sm font-bold tracking-[0.2em] text-accent">{n}</span>
      <span aria-hidden="true" className="hazard h-3 w-10 rounded-sm" />
      <h2 id={id} className="font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">
        {children}
      </h2>
    </div>
  );
}

function BoardCell({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`bg-bg/80 p-4 backdrop-blur sm:p-5 ${wide ? "col-span-2" : ""}`}>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">{label}</dt>
      <dd className="mt-1.5 font-display text-xl font-extrabold uppercase leading-tight sm:text-2xl">{children}</dd>
    </div>
  );
}

/** "17th Design" -> ["17th", "Design"]; anything else stays whole. */
function splitPlacing(item: string): [string | null, string] {
  const match = item.match(/^(\d+(?:st|nd|rd|th))\s+(.+)$/);
  return match ? [match[1], match[2]] : [null, item];
}

const KEY_SPECS = ["Dry weight", "Suspension travel", "Ground clearance", "Top speed", "Final drive", "Turning radius", "Engine output"];
const cleanLabel = (label: string) => label.replace(" (design)", "");

export default async function CarYearPage({ params }: { params: Promise<{ season: string }> }) {
  const { season } = await params;
  const years = allYears();
  const index = years.findIndex((entry) => entry.slug === season);
  if (index === -1) notFound();
  const year = years[index];
  const site = getSite();

  const keySpecs = KEY_SPECS.map((key) => year.specs.find((spec) => cleanLabel(spec.label) === key))
    .filter((spec): spec is CarYear["specs"][number] => Boolean(spec))
    .slice(0, 4);
  const sheetSpecs = year.specs.filter((spec) => !keySpecs.includes(spec));
  const hasDesignValues = year.specs.some((spec) => spec.label.includes("(design)"));
  const ranked = typeof year.overall === "number";
  const beat = ranked && year.fieldSize ? year.fieldSize - (year.overall as number) : null;
  const rosterCount = year.roster.reduce((sum, group) => sum + group.members.length, 0);
  const photos = year.gallery;
  const stages = [
    { id: "season", label: "The season" },
    { id: "results", label: "Results" },
    { id: "specs", label: "Spec sheet" },
    { id: "team", label: "Pit crew" },
  ];

  return (
    <>
      {/* HERO: photo, number, and the timing board */}
      <section className="relative isolate overflow-hidden border-b border-line">
        {year.photo ? (
          <>
            <Image src={year.photo} alt="" fill preload quality={70} sizes="100vw" className="-z-20 object-cover" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/75 to-bg/30" />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="topo-bg absolute inset-0 -z-10 opacity-60" />
        )}
        {year.number && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 bottom-24 -z-10 select-none font-display text-[16rem] font-extrabold leading-none text-transparent opacity-40 [-webkit-text-stroke:2px_rgba(255,255,255,0.35)] sm:text-[22rem] lg:bottom-10"
          >
            {year.number}
          </span>
        )}
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-12 sm:px-6 sm:pt-20">
          <Link href="/car#history" className="text-sm font-semibold text-muted hover:text-ink">
            ← All our cars
          </Link>
          <div className="mt-16 flex flex-wrap items-center gap-4 sm:mt-24">
            {year.number && <Plate number={year.number} className="!text-3xl" />}
            <span className="hazard h-4 w-16 rounded-sm" aria-hidden="true" />
            <Eyebrow>{year.season} season</Eyebrow>
          </div>
          <h1 className="mt-1 font-display text-6xl font-extrabold uppercase leading-[0.85] sm:text-8xl lg:text-9xl">{carName(year)}</h1>
          {year.description && <p className="mt-5 max-w-2xl text-lg text-ink/80">{year.description}</p>}

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
            <BoardCell label="Overall finish">
              {ranked ? (
                <>
                  <span className="text-accent">{ordinal(year.overall as number)}</span>
                  {year.fieldSize && <span className="text-base text-muted"> / {year.fieldSize}</span>}
                </>
              ) : year.overall === null ? (
                <span className="text-muted">No overall</span>
              ) : (
                <span className="text-muted">TBA</span>
              )}
            </BoardCell>
            <BoardCell label="Competition">{year.event ?? "To be announced"}</BoardCell>
            <BoardCell label="Location">{year.location ?? "—"}</BoardCell>
            <BoardCell label="Livery">{year.livery ?? "—"}</BoardCell>
          </dl>
        </div>
      </section>

      {/* STAGE NAV */}
      <nav aria-label="On this page" className="sticky top-[65px] z-30 border-b border-line bg-bg/95 backdrop-blur">
        <div className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
          {stages.map((stage, i) => (
            <a
              key={stage.id}
              href={`#${stage.id}`}
              className="shrink-0 border-b-2 border-transparent px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted transition-colors hover:border-maroon hover:text-ink"
            >
              <span className="text-accent">0{i + 1}</span> {stage.label}
            </a>
          ))}
        </div>
      </nav>

      {/* 01 THE SEASON */}
      <section aria-labelledby="season" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <StageHeading n="01" id="season">
            The season
          </StageHeading>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
            <div>
              {year.improvement && (
                <figure className="mb-8 border-l-4 border-maroon pl-5">
                  <figcaption className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Step forward</figcaption>
                  <p className="mt-1 font-display text-3xl font-extrabold uppercase leading-tight">{year.improvement}</p>
                </figure>
              )}
              {year.story.length > 0 ? (
                <div className="max-w-prose space-y-5 text-[17px] leading-[1.75] text-ink/85">
                  {year.story.map((paragraph, i) => (
                    <p key={paragraph} className={i === 0 ? "text-lg text-ink" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-line p-6 text-muted">
                  We&apos;re still writing this season&apos;s story. Raced on this car or have pictures?{" "}
                  <a href={`mailto:${site.email}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                    Send them our way
                  </a>
                  .
                </p>
              )}
            </div>

            <div className="space-y-3">
              {year.photo && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
                  <Image src={year.photo} alt={`${carName(year)}, ${year.season}`} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                </div>
              )}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((src, i) => (
                    <div
                      key={src}
                      className={`relative overflow-hidden rounded-xl border border-line ${photos.length % 2 === 1 && i === photos.length - 1 ? "col-span-2 aspect-[2/1]" : "aspect-[4/3]"}`}
                    >
                      <Image src={src} alt={`${carName(year)}, ${year.season}`} fill sizes="(min-width: 1024px) 22vw, 50vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 02 RESULTS */}
      <section aria-labelledby="results" className="relative isolate scroll-mt-28 border-y border-line bg-panel px-4 py-16 sm:px-6 sm:py-24">
        <div className="topo-bg absolute inset-0 -z-10 opacity-15" />
        <div className="mx-auto max-w-6xl">
          <StageHeading n="02" id="results">
            Results
          </StageHeading>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{year.event ?? "Competition"}</p>
              <p className="mt-2 font-display text-8xl font-extrabold uppercase leading-none text-accent sm:text-9xl">
                {ranked ? ordinal(year.overall as number) : year.overall === null ? "—" : "TBA"}
              </p>
              <p className="mt-2 font-display text-xl font-bold uppercase">
                {ranked ? `Overall${year.fieldSize ? ` out of ${year.fieldSize} teams` : ""}` : year.overall === null ? "No overall result" : "Result coming"}
              </p>
              {beat !== null && beat > 0 && <p className="mt-3 text-muted">Ahead of {beat} of the {year.fieldSize} teams in the field.</p>}
            </div>

            {ranked && year.fieldSize && (
              <div aria-hidden="true">
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
                  <span>1st</span>
                  <span>Field of {year.fieldSize}</span>
                  <span>{ordinal(year.fieldSize)}</span>
                </div>
                <div className="relative mt-3 h-14">
                  <div className="track-line absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" />
                  <div
                    className="absolute inset-y-0 left-0 rounded-l-lg bg-linear-to-r from-maroon/0 to-maroon/60"
                    style={{ width: `${((year.overall as number) / year.fieldSize) * 100}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${((year.overall as number) / year.fieldSize) * 100}%` }}
                  >
                    {year.number ? <Plate number={year.number} className="!text-xl shadow-lg" /> : <span className="block h-5 w-5 rounded-full bg-ink" />}
                  </div>
                </div>
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
                  <span>← Front of the pack</span>
                  <span>Back of the pack →</span>
                </div>
              </div>
            )}
          </div>

          {year.highlights.length > 0 && (
            <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {year.highlights.map((item) => {
                const [place, event] = splitPlacing(item);
                return (
                  <li key={item} className="rounded-xl border border-line bg-bg/60 p-5">
                    {place ? (
                      <>
                        <p className="font-display text-4xl font-extrabold uppercase leading-none">{place}</p>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-muted">{event}</p>
                      </>
                    ) : (
                      <p className="flex gap-2 font-semibold leading-snug">
                        <span aria-hidden="true" className="text-accent">
                          ★
                        </span>
                        {item}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* 03 SPEC SHEET */}
      <section aria-labelledby="specs" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <StageHeading n="03" id="specs">
            Spec sheet
          </StageHeading>
          {year.specs.length > 0 ? (
            <>
              {keySpecs.length > 0 && (
                <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
                  {keySpecs.map((spec) => (
                    <div key={spec.label} className="bg-panel p-5 sm:p-6">
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">{cleanLabel(spec.label)}</dt>
                      <dd className="mt-2 font-display text-2xl font-extrabold uppercase leading-tight sm:text-4xl">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {sheetSpecs.length > 0 && (
                <div className="mt-6 overflow-hidden rounded-xl border border-line">
                  <div className="flex items-center justify-between border-b border-line bg-panel-2 px-5 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">Tech sheet · {carName(year)}</p>
                    <span className="hazard h-3 w-12 rounded-sm" aria-hidden="true" />
                  </div>
                  <dl className="grid sm:grid-cols-2">
                    {sheetSpecs.map((spec, i) => (
                      <div
                        key={spec.label}
                        className={`grid grid-cols-[7rem_1fr] gap-4 border-b border-line px-5 py-3.5 sm:grid-cols-[10rem_1fr] ${i % 2 === 0 ? "sm:border-r" : ""}`}
                      >
                        <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">{cleanLabel(spec.label)}</dt>
                        <dd className="font-semibold leading-snug">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
              {hasDesignValues && <p className="mt-3 text-xs text-muted">Weights, travel, clearance and similar figures are design-review targets; the built car can differ.</p>}
            </>
          ) : (
            <p className="mt-8 rounded-xl border border-dashed border-line p-6 text-muted">We&apos;re pulling this car&apos;s spec sheet from the team archives. Check back soon.</p>
          )}
        </div>
      </section>

      {/* 04 PIT CREW */}
      <section aria-labelledby="team" className="scroll-mt-28 border-t border-line bg-panel px-4 py-16 sm:px-6 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <StageHeading n="04" id="team">
              Pit crew
            </StageHeading>
            {rosterCount > 0 && (
              <p className="font-display text-lg font-bold uppercase text-muted">
                <span className="text-ink">{rosterCount}</span> names on the roster
              </p>
            )}
          </div>

          {year.leads.length > 0 ? (
            <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {year.leads.map((lead) => (
                <li key={`${lead.role}-${lead.name}`} className="relative overflow-hidden rounded-xl border border-line bg-bg p-5">
                  <span aria-hidden="true" className="hazard absolute inset-x-0 top-0 h-1.5" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">{lead.role}</p>
                  <p className="mt-1.5 font-display text-xl font-bold uppercase leading-tight">{lead.name}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-muted">
              Led this car or know who did?{" "}
              <a href={`mailto:${site.email}?subject=${encodeURIComponent(`${year.season} car leads`)}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                Tell us
              </a>{" "}
              so we can credit the leads and members who built it.
            </p>
          )}

          {year.roster.length > 0 && (
            <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {year.roster.map((group) => (
                <div key={group.team}>
                  <dt className="flex items-baseline justify-between border-b border-line pb-2">
                    <span className="font-display text-lg font-bold uppercase">{group.team}</span>
                    <span className="text-xs text-muted">{group.members.length}</span>
                  </dt>
                  <dd className="mt-3 flex flex-wrap gap-1.5">
                    {group.members.map((member) => {
                      const tag = member.match(/\(([^)]+)\)$/)?.[1];
                      const name = member.replace(/\s*\([^)]+\)$/, "");
                      const isLead = tag?.toLowerCase().includes("lead");
                      return (
                        <span
                          key={member}
                          className={`rounded-full border px-2.5 py-1 text-xs ${isLead ? "border-maroon bg-maroon/40 font-semibold text-ink" : "border-line bg-bg/50 text-ink/80"}`}
                        >
                          {name}
                          {tag && <span className="ml-1 text-muted">· {tag}</span>}
                        </span>
                      );
                    })}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* SEASON STRIP */}
      <nav aria-label="Every car" className="border-t border-line px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">Every car we&apos;ve built</p>
          <ol className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
            {years.map((entry) => {
              const current = entry.slug === year.slug;
              return (
                <li key={entry.slug} className="shrink-0">
                  <Link
                    href={carHref(entry)}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-w-28 flex-col items-start gap-2 rounded-xl border p-3 transition-colors ${current ? "border-maroon bg-maroon/40" : "border-line bg-panel hover:border-accent/50"}`}
                  >
                    {entry.number ? <Plate number={entry.number} className="!text-base" /> : <span className="h-7 text-xs text-muted">No. —</span>}
                    <span className="font-display text-sm font-bold uppercase">{entry.season}</span>
                    <span className="text-[11px] text-muted">{typeof entry.overall === "number" ? `${ordinal(entry.overall)} overall` : entry.overall === null ? "No overall" : "In build"}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <div className="mt-6 flex justify-between text-sm font-semibold">
            {years[index - 1] ? <Link href={carHref(years[index - 1])} className="text-muted hover:text-ink">← Newer: {years[index - 1].season}</Link> : <span />}
            {years[index + 1] ? <Link href={carHref(years[index + 1])} className="text-muted hover:text-ink">Older: {years[index + 1].season} →</Link> : <span />}
          </div>
        </div>
      </nav>

      <CtaBand title="Put your name on the next car" body="Partner with us to ride on the next car at Rollout and competition." />
    </>
  );
}
