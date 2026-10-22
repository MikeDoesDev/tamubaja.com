import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Plate } from "@/components/Plate";
import { buildCarYears, carHref, carName } from "@/lib/cars";
import { getCar, getSeasons, getSite, getSponsors } from "@/lib/content";
import { monoLogoPath } from "@/lib/sponsors";
import { ordinal } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

const allYears = () => buildCarYears(getSeasons(), getCar().garage);

export function generateStaticParams() {
  return allYears().map((year) => ({ season: year.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  const year = allYears().find((entry) => entry.slug === season);
  if (!year) return {};
  const result =
    typeof year.overall === "number"
      ? `, ${ordinal(year.overall)} overall at ${year.event}`
      : year.event
        ? ` at ${year.event}`
        : "";
  return pageMetadata({
    title: `${carName(year)} (${year.season}) | Texas A&M Baja SAE`,
    description: `Texas A&M Baja SAE's ${year.season} off-road car${result}.${year.highlights.length ? ` ${year.highlights.join(". ")}.` : ""}`,
    path: carHref(year),
  });
}

const label = "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted";

/** A full-width section with a numbered eyebrow and a big title, like a team's car-launch page. */
function Section({
  n,
  id,
  title,
  children,
}: {
  n: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={`${id}-title`} id={id} className="scroll-mt-32 border-t border-line py-14 sm:py-20">
      <p className="flex items-center gap-3 font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">
        <span>{n}</span>
        <span aria-hidden="true" className="h-px w-8 bg-maroon" />
      </p>
      <h2 id={`${id}-title`} className="mt-2 font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">
        {title}
      </h2>
      <div className="mt-8 sm:mt-10">{children}</div>
    </section>
  );
}

/** "17th Design" -> ["17th", "Design"]; anything else returns null. */
function splitPlacing(item: string): [string, string] | null {
  const match = item.match(/^(\d+(?:st|nd|rd|th))\s+(.+)$/);
  return match ? [match[1], match[2]] : null;
}

const cleanLabel = (text: string) => text.replace(" (design)", "");

/** Spec rows grouped the way an engineer reads a car: what drives it, what holds it up, how big it is. */
const SPEC_GROUPS: { name: string; match: RegExp }[] = [
  { name: "Powertrain", match: /engine|drivetrain|cvt|gearbox|final drive|axle|differential|transmission|top speed/i },
  { name: "Chassis & suspension", match: /chassis|frame|suspension|shock|wheel(?!base)|tire|steering|brake|upright|clearance|rigidity/i },
  { name: "Size & weight", match: /weight|turning|wheelbase|width|track|size/i },
];

function groupSpecs(specs: { label: string; value: string }[]) {
  const groups = SPEC_GROUPS.map((group) => ({ name: group.name, rows: [] as typeof specs }));
  const other: typeof specs = [];
  for (const spec of specs) {
    const index = SPEC_GROUPS.findIndex((group) => group.match.test(spec.label));
    if (index === -1) other.push(spec);
    else groups[index].rows.push(spec);
  }
  if (other.length) groups.push({ name: "Other", rows: other });
  return groups.filter((group) => group.rows.length > 0);
}

const STATIC_EVENTS = /design|cost|presentation/i;

type Result = { event: string; place: number | null; points: number; note?: string };

/** A placing: top-10 results get a maroon badge. */
function Place({ place }: { place: number | null }) {
  if (place === null) return <span className="text-muted">—</span>;
  return place <= 10 ? (
    <span className="inline-flex min-w-11 justify-center rounded-md bg-maroon px-2 py-0.5 font-display text-base font-bold text-white">
      {ordinal(place)}
    </span>
  ) : (
    <span className="font-display text-base font-bold">{ordinal(place)}</span>
  );
}

/** One group of events (static or dynamic) as a compact standings-style table. */
function EventTable({ title, rows }: { title: string; rows: Result[] }) {
  const total = rows.reduce((sum, row) => sum + row.points, 0);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-baseline justify-between border-b border-line px-5 py-4">
        <p className="font-display text-xl font-bold uppercase">{title}</p>
        <p className="text-sm text-muted">
          <span className="font-display text-xl font-bold text-ink">{Math.round(total * 10) / 10}</span> pts
        </p>
      </div>
      <table className="w-full border-collapse text-left">
        <thead className="sr-only">
          <tr>
            <th scope="col">Event</th>
            <th scope="col">Place</th>
            <th scope="col">Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.event} className="border-b border-line last:border-b-0">
              <th scope="row" className="px-5 py-3.5 text-[15px] font-medium">
                {row.event}
                {row.note && <span className="mt-0.5 block text-xs font-normal text-muted">{row.note}</span>}
              </th>
              <td className="w-20 py-3.5 text-right">
                <Place place={row.place} />
              </td>
              <td className="w-24 py-3.5 pr-5 text-right text-sm tabular-nums text-muted">{row.points} pts</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A big headline number for the hero band. */
function Stat({ k, value, sub }: { k: string; value: string; sub?: string }) {
  return (
    <div className="border-t border-ink/25 pt-4">
      <dt className={label}>{k}</dt>
      <dd className="mt-2">
        <span className="font-display text-4xl font-extrabold leading-none sm:text-5xl">{value}</span>
        {sub && <span className="mt-1.5 block text-sm text-muted">{sub}</span>}
      </dd>
    </div>
  );
}

const norm = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

export default async function CarYearPage({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  const years = allYears();
  const index = years.findIndex((entry) => entry.slug === season);
  if (index === -1) notFound();
  const year = years[index];
  const site = getSite();
  const logos = new Map(getSponsors().map((sponsor) => [norm(sponsor.name), sponsor.logo]));

  const ranked = typeof year.overall === "number";
  const overallText = ranked
    ? `${ordinal(year.overall as number)}${year.fieldSize ? ` of ${year.fieldSize}` : ""}`
    : year.overall === null
      ? "No overall result"
      : "To be announced";
  const placings = year.highlights
    .map(splitPlacing)
    .filter((p): p is [string, string] => p !== null);
  const recognition = year.highlights.filter((item) => !splitPlacing(item));
  const hasDesignValues = year.specs.some((spec) => spec.label.includes("(design)"));
  const rosterCount = year.roster.reduce((sum, group) => sum + group.members.length, 0);
  const specGroups = groupSpecs(year.specs);
  const staticRows = year.results.filter((row) => STATIC_EVENTS.test(row.event));
  const dynamicRows = year.results.filter((row) => !STATIC_EVENTS.test(row.event));
  const best = [...year.results]
    .filter((row) => row.place !== null)
    .sort((a, b) => (a.place as number) - (b.place as number))[0];
  const bestFromHighlights = placings[0];
  const newer = years[index - 1];
  const older = years[index + 1];
  const photos = [year.photo, ...year.gallery].filter((src): src is string => Boolean(src));

  const stats = [
    ranked
      ? { k: "Overall finish", value: ordinal(year.overall as number), sub: year.fieldSize ? `of ${year.fieldSize} teams` : undefined }
      : { k: "Overall finish", value: "—", sub: overallText },
    typeof year.points === "number"
      ? { k: "Points", value: String(Math.round(year.points)), sub: "of 1,000" }
      : null,
    year.teamSize
      ? { k: "Team", value: String(year.teamSize), sub: "students" }
      : rosterCount
        ? { k: "Team", value: String(rosterCount), sub: "named on the roster" }
        : null,
    best
      ? { k: "Best event", value: ordinal(best.place as number), sub: best.event }
      : bestFromHighlights
        ? { k: "Best event", value: bestFromHighlights[0], sub: bestFromHighlights[1] }
        : null,
  ].filter((stat): stat is { k: string; value: string; sub: string | undefined } => stat !== null);

  const sections = [
    { id: "season", title: "Overview" },
    { id: "results", title: "Results" },
    { id: "specs", title: "Specs" },
    { id: "team", title: "Team" },
    ...(year.sponsors.length ? [{ id: "sponsors", title: "Sponsors" }] : []),
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        {year.photo ? (
          <>
            <Image src={year.photo} alt="" fill preload quality={70} sizes="100vw" className="-z-20 object-cover opacity-60" />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/75 to-bg/20" />
            <div className="absolute inset-0 -z-10 bg-linear-to-r from-bg/80 via-bg/30 to-transparent" />
          </>
        ) : (
          <div className="topo-bg absolute inset-0 -z-10 opacity-40" />
        )}
        {year.number && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-10 -z-10 select-none font-display text-[13rem] font-extrabold leading-none text-white/[0.06] sm:text-[20rem]"
          >
            {year.number}
          </p>
        )}
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-14">
          <Link href="/car#history" className="text-sm font-semibold text-muted hover:text-ink">
            ← All our cars
          </Link>
          <p className={`${label} mt-20 !text-ink/70 sm:mt-32`}>
            {year.season} season
            {year.event ? ` · ${year.event}` : ""}
            {year.location ? ` · ${year.location}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {year.number && <Plate number={year.number} className="!text-3xl sm:!text-4xl" />}
            <h1 className="font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">{carName(year)}</h1>
          </div>
          {year.description && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/80">{year.description}</p>}

          {stats.length > 0 && (
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <Stat key={stat.k} k={stat.k} value={stat.value} sub={stat.sub} />
              ))}
            </dl>
          )}
        </div>
      </section>

      <nav aria-label="On this page" className="sticky top-16 z-30 border-b border-line bg-bg/95 backdrop-blur">
        <ul className="mx-auto flex max-w-6xl gap-6 overflow-x-auto px-4 text-sm font-semibold sm:gap-8 sm:px-6">
          {sections.map((section) => (
            <li key={section.id} className="shrink-0">
              <a
                href={`#${section.id}`}
                className="block border-b-2 border-transparent py-3.5 text-muted transition-colors hover:border-maroon hover:text-ink"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Section n="01" id="season" title="Season overview">
            <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
              <div>
                {year.story.length > 0 ? (
                  <div className="max-w-[68ch] space-y-5 text-[17px] leading-[1.75] text-ink/85">
                    {year.story.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <p className="max-w-[68ch] text-muted">
                    We&apos;re still writing this season&apos;s story. Raced on this car or have pictures?{" "}
                    <a href={`mailto:${site.email}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
                      Send them our way
                    </a>
                    .
                  </p>
                )}
              </div>
              <aside className="space-y-6">
                {year.improvement && (
                  <div className="rounded-2xl border border-line border-l-4 border-l-maroon bg-panel p-6">
                    <p className={label}>Key takeaway</p>
                    <p className="mt-2 font-display text-2xl font-bold uppercase leading-tight">{year.improvement}</p>
                  </div>
                )}
                {recognition.length > 0 && (
                  <div className="rounded-2xl border border-line bg-panel p-6">
                    <p className={label}>Also recognized</p>
                    <ul className="mt-3 space-y-2 text-[15px]">
                      {recognition.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </aside>
            </div>
            {photos.length > 0 && (
              <div className={`mt-12 grid gap-4 ${photos.length > 1 ? "sm:grid-cols-2" : ""}`}>
                {photos.map((src, i) => (
                  <figure key={src} className={photos.length > 2 && i === 0 ? "sm:col-span-2" : ""}>
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
                      <Image
                        src={src}
                        alt={year.captions[src] ?? `${carName(year)}, ${year.season}`}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                    <figcaption className="mt-3 text-sm text-muted">
                      {year.captions[src] ?? `${carName(year)}, ${year.season}`}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </Section>

          <Section n="02" id="results" title="Results">
            {ranked && year.fieldSize && (
              <div className="mb-8 rounded-2xl border border-line bg-panel p-6 sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className={label}>Overall · {year.event}</p>
                    <p className="mt-2 font-display text-5xl font-extrabold leading-none sm:text-6xl">
                      {ordinal(year.overall as number)}
                      <span className="ml-2 text-2xl text-muted sm:text-3xl">of {year.fieldSize}</span>
                    </p>
                  </div>
                  <p className="text-sm text-ink/80">Ahead of {year.fieldSize - (year.overall as number)} teams</p>
                </div>
                <div className="relative mt-6 h-2 rounded-full bg-line" aria-hidden="true">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-maroon"
                    style={{ width: `${(1 - ((year.overall as number) - 1) / year.fieldSize) * 100}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted" aria-hidden="true">
                  <span>Last</span>
                  <span>1st</span>
                </div>
              </div>
            )}
            {year.results.length > 0 ? (
              <>
                <div className="grid gap-6 lg:grid-cols-2">
                  {staticRows.length > 0 && <EventTable title="Static events" rows={staticRows} />}
                  {dynamicRows.length > 0 && <EventTable title="Dynamic events" rows={dynamicRows} />}
                </div>
                <p className="mt-4 text-xs text-muted">
                  Official Baja SAE results. Top-10 finishes are in maroon; a dash means SAE didn&apos;t publish a place.
                </p>
              </>
            ) : placings.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {placings.map(([place, event]) => (
                  <div key={event} className="rounded-2xl border border-line bg-panel p-5">
                    <p className="font-display text-3xl font-extrabold">{place}</p>
                    <p className="mt-1 text-sm text-muted">{event}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">Results for this season are coming soon.</p>
            )}
          </Section>

          <Section n="03" id="specs" title="Specifications">
            {specGroups.length > 0 ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {specGroups.map((group) => (
                    <div key={group.name} className="rounded-2xl border border-line bg-panel p-6">
                      <p className="font-display text-xl font-bold uppercase">{group.name}</p>
                      <dl className="mt-4 divide-y divide-line">
                        {group.rows.map((spec) => (
                          <div key={spec.label} className="py-3">
                            <dt className={label}>{cleanLabel(spec.label)}</dt>
                            <dd className="mt-1 text-[15px] leading-snug">{spec.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
                {hasDesignValues && (
                  <p className="mt-4 text-xs text-muted">
                    Weights, travel, clearance and similar figures are design-review targets; the built car can differ.
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted">We&apos;re pulling this car&apos;s spec sheet from the team archives. Check back soon.</p>
            )}
          </Section>

          <Section n="04" id="team" title="The team">
            {year.leads.length > 0 ? (
              <>
                <p className={`${label} mb-4`}>Leadership</p>
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {year.leads.map((lead, i) => (
                    <li
                      key={`${lead.role}-${lead.name}`}
                      className={`rounded-2xl border border-line p-5 ${i < 2 ? "border-t-4 border-t-maroon bg-panel-2" : "bg-panel"}`}
                    >
                      <p className={label}>{lead.role}</p>
                      <p className="mt-2 font-display text-xl font-bold uppercase leading-tight">{lead.name}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted">
                Led this car or know who did?{" "}
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(`${year.season} car leads`)}`}
                  className="font-semibold text-ink underline decoration-accent underline-offset-4"
                >
                  Tell us
                </a>{" "}
                so we can credit the leads and members who built it.
              </p>
            )}
            {year.roster.length > 0 && (
              <div className="mt-12">
                <p className={`${label} mb-4`}>
                  {year.teamSize && year.teamSize > rosterCount
                    ? `Named on the roster · ${rosterCount} of ${year.teamSize}`
                    : `Full roster · ${rosterCount} members`}
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {year.roster.map((group) => (
                    <div key={group.team} className="rounded-2xl border border-line bg-panel p-5">
                      <p className="flex items-baseline justify-between gap-3">
                        <span className="font-display text-lg font-bold uppercase">{group.team}</span>
                        <span className="text-xs text-muted">{group.members.length}</span>
                      </p>
                      <ul className="mt-3 space-y-1.5 text-[15px]">
                        {group.members.map((member) => {
                          const tag = member.match(/\(([^)]+)\)$/)?.[1];
                          const name = member.replace(/\s*\([^)]+\)$/, "");
                          const isLead = tag ? /lead/i.test(tag) : false;
                          return (
                            <li key={member} className="flex items-baseline justify-between gap-3">
                              <span className={isLead ? "font-semibold" : "text-ink/85"}>{name}</span>
                              {tag && (
                                <span
                                  className={`shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] ${isLead ? "text-accent" : "text-muted"}`}
                                >
                                  {tag}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>

          {year.sponsors.length > 0 && (
            <Section n="05" id="sponsors" title="Sponsors">
              <p className="max-w-[68ch] text-muted">The companies and groups that helped put this car on the track.</p>
              <ul className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border-l border-t border-line bg-panel sm:grid-cols-3 lg:grid-cols-4">
                {year.sponsors.map((sponsor) => {
                  const logo = logos.get(norm(sponsor));
                  return (
                    <li
                      key={sponsor}
                      className="flex h-28 items-center justify-center px-5 text-center shadow-[inset_-1px_-1px_0_var(--color-line)]"
                    >
                      {logo ? (
                        <span className="relative block h-10 w-full">
                          <Image src={monoLogoPath(logo)} alt={sponsor} fill sizes="200px" className="object-contain opacity-80" />
                        </span>
                      ) : (
                        <span className="font-display text-lg font-bold uppercase leading-tight text-ink/85">{sponsor}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          <nav aria-label="More cars" className="grid gap-4 border-t border-line py-12 sm:grid-cols-2">
            {[
              { year: newer, dir: "Newer car", align: "" },
              { year: older, dir: "Older car", align: "sm:text-right" },
            ].map(({ year: other, dir, align }) =>
              other ? (
                <Link
                  key={dir}
                  href={carHref(other)}
                  className={`group relative isolate block overflow-hidden rounded-2xl border border-line bg-panel p-6 transition-colors hover:border-accent ${align}`}
                >
                  {other.photo && (
                    <>
                      <Image src={other.photo} alt="" fill sizes="(min-width: 640px) 50vw, 100vw" className="-z-20 object-cover opacity-60 transition-opacity group-hover:opacity-80" />
                      <div className="absolute inset-0 -z-10 bg-linear-to-t from-panel via-panel/50 to-panel/10" />
                    </>
                  )}
                  <p className={label}>
                    {dir === "Newer car" ? "← " : ""}
                    {dir}
                    {dir === "Older car" ? " →" : ""}
                  </p>
                  <p className="mt-10 font-display text-3xl font-extrabold uppercase leading-none">{carName(other)}</p>
                  <p className="mt-1 text-sm text-muted">{other.season}</p>
                </Link>
              ) : (
                <span key={dir} className="hidden sm:block" />
              ),
            )}
          </nav>
        </div>
      </div>

      <CtaBand title="Put your name on the next car" body="Partner with us to ride on the next car at Rollout and competition." />
    </>
  );
}
