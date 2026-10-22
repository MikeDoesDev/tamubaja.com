import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/CtaBand";
import { Plate } from "@/components/Plate";
import { buildCarYears, carHref, carName } from "@/lib/cars";
import { getCar, getSeasons, getSite } from "@/lib/content";
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

const label =
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted";

/** A report section: number and title in the left column, content on the right, ruled on top. */
function ReportSection({
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
    <section
      aria-labelledby={id}
      className="grid gap-6 border-t border-line py-12 sm:py-14 lg:grid-cols-[14rem_1fr] lg:gap-12"
    >
      <div>
        <p className="font-display text-sm font-bold tracking-[0.15em] text-accent">
          {n}
        </p>
        <h2
          id={id}
          className="mt-1 font-display text-2xl font-bold uppercase leading-tight"
        >
          {title}
        </h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** A two-column ruled table: label on the left, value on the right. */
function RuledTable({
  rows,
  head,
}: {
  rows: {
    key: string;
    label: React.ReactNode;
    value: React.ReactNode;
    strong?: boolean;
  }[];
  head?: [string, string];
}) {
  return (
    <table className="w-full border-collapse text-left">
      {head && (
        <thead>
          <tr className="border-b border-ink/40">
            <th
              scope="col"
              className={`${label} w-2/5 pb-2 pr-6 font-semibold`}
            >
              {head[0]}
            </th>
            <th scope="col" className={`${label} pb-2 font-semibold`}>
              {head[1]}
            </th>
          </tr>
        </thead>
      )}
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-line align-top">
            <th
              scope="row"
              className={`w-2/5 py-3 pr-6 text-sm font-normal text-muted ${row.strong ? "!font-semibold !text-ink" : ""}`}
            >
              {row.label}
            </th>
            <td
              className={`py-3 text-[15px] ${row.strong ? "font-semibold" : ""}`}
            >
              {row.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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

/** A placing chip: top-10 results stand out. */
function Place({ place }: { place: number | null }) {
  if (place === null) return <span className="text-muted">—</span>;
  return place <= 10 ? (
    <span className="inline-block rounded bg-maroon px-2 py-0.5 font-semibold text-white">{ordinal(place)}</span>
  ) : (
    <span>{ordinal(place)}</span>
  );
}

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
  const hasDesignValues = year.specs.some((spec) =>
    spec.label.includes("(design)"),
  );
  const rosterCount = year.roster.reduce(
    (sum, group) => sum + group.members.length,
    0,
  );
  const newer = years[index - 1];
  const older = years[index + 1];

  const teamText = year.teamSize
    ? `${year.teamSize} students`
    : rosterCount
      ? `${rosterCount} named`
      : null;
  const pointsText =
    typeof year.points === "number"
      ? `${Math.round(year.points)} of 1,000`
      : null;
  const summary = [
    { k: "Overall finish", v: overallText },
    pointsText
      ? { k: "Points", v: pointsText }
      : { k: "Competition", v: year.event ?? "To be announced" },
    { k: "Team", v: teamText ?? "—" },
    { k: "Location", v: year.location ?? "—" },
  ];
  const specGroups = groupSpecs(year.specs);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        {year.photo ? (
          <>
            <Image
              src={year.photo}
              alt=""
              fill
              preload
              quality={70}
              sizes="100vw"
              className="-z-20 object-cover opacity-50"
            />
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/80 to-bg/40" />
          </>
        ) : (
          <div className="topo-bg absolute inset-0 -z-10 opacity-40" />
        )}
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pt-16">
          <Link
            href="/car#history"
            className="text-sm font-semibold text-muted hover:text-ink"
          >
            ← All our cars
          </Link>
          <p className={`${label} mt-16 sm:mt-24`}>
            {year.season} season{year.event ? ` · ${year.event}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {year.number && (
              <Plate number={year.number} className="!text-3xl" />
            )}
            <h1 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-7xl">
              {carName(year)}
            </h1>
          </div>
          {year.description && (
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink/80">
              {year.description}
            </p>
          )}

          <dl className="mt-10 grid grid-cols-2 border-t border-ink/40 sm:grid-cols-4">
            {summary.map((item, i) => (
              <div
                key={item.k}
                className={`border-b border-line py-4 pr-4 sm:border-b-0 ${i > 0 ? "sm:border-l sm:pl-5" : ""}`}
              >
                <dt className={label}>{item.k}</dt>
                <dd
                  className={`mt-1.5 text-lg font-semibold leading-snug ${i === 0 && ranked ? "text-accent" : ""}`}
                >
                  {item.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="px-4 sm:px-6">
        <div className="mx-auto max-w-6xl pb-8 pt-4">
          <ReportSection n="01" id="season" title="Season overview">
            {year.improvement && (
              <div className="mb-8 border-l-2 border-accent pl-5">
                <p className={label}>Key takeaway</p>
                <p className="mt-1.5 text-xl font-semibold leading-snug">
                  {year.improvement}
                </p>
              </div>
            )}
            {year.story.length > 0 ? (
              <div className="max-w-[68ch] space-y-5 text-base leading-[1.75] text-ink/85">
                {year.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <p className="max-w-[68ch] text-muted">
                We&apos;re still writing this season&apos;s story. Raced on this
                car or have pictures?{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="font-semibold text-ink underline decoration-accent underline-offset-4"
                >
                  Send them our way
                </a>
                .
              </p>
            )}
            {(year.photo || year.gallery.length > 0) && (
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
                {[year.photo, ...year.gallery]
                  .filter((src): src is string => Boolean(src))
                  .map((src) => (
                    <figure key={src}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line">
                        <Image
                          src={src}
                          alt={year.captions[src] ?? `${carName(year)}, ${year.season}`}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <figcaption className="mt-2 text-xs text-muted">
                        {year.captions[src] ?? `${carName(year)}, ${year.season}`}
                      </figcaption>
                    </figure>
                  ))}
              </div>
            )}
          </ReportSection>

          <ReportSection n="02" id="results" title="Results">
            {year.results.length > 0 ? (
              <>
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-ink/40">
                      <th scope="col" className={`${label} pb-2 pr-4 font-semibold`}>Event</th>
                      <th scope="col" className={`${label} w-24 pb-2 pr-4 font-semibold`}>Place</th>
                      <th scope="col" className={`${label} w-20 pb-2 text-right font-semibold`}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 text-[15px] font-semibold">
                        Overall
                      </th>
                      <td className="py-3 pr-4 text-[15px] font-semibold text-accent">{overallText}</td>
                      <td className="py-3 text-right text-[15px] font-semibold tabular-nums">
                        {typeof year.points === "number" ? Math.round(year.points) : "—"}
                      </td>
                    </tr>
                    {year.results.map((result) => (
                      <tr key={result.event} className="border-b border-line align-top">
                        <th scope="row" className="py-3 pr-4 text-sm font-normal text-ink/85">
                          {result.event}
                          {result.note && <span className="block text-xs text-muted">{result.note}</span>}
                        </th>
                        <td className="py-3 pr-4 text-sm">
                          <Place place={result.place} />
                        </td>
                        <td className="py-3 text-right text-sm tabular-nums text-ink/85">{result.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs text-muted">
                  Official Baja SAE results. A dash means SAE didn&apos;t publish a place for that event; top-10 finishes are highlighted.
                </p>
              </>
            ) : (
              <RuledTable
                head={["Event", "Placing"]}
                rows={[
                  {
                    key: "overall",
                    label: `Overall${year.event ? ` · ${year.event}` : ""}`,
                    value: overallText,
                    strong: true,
                  },
                  ...placings.map(([place, event]) => ({
                    key: event,
                    label: event,
                    value: place,
                  })),
                ]}
              />
            )}
            {ranked && year.fieldSize && (
              <div className="mt-8">
                <div className="relative h-1.5 rounded-full bg-line" aria-hidden="true">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent/60"
                    style={{
                      width: `${((year.overall as number) / year.fieldSize) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg bg-accent"
                    style={{
                      left: `${((year.overall as number) / year.fieldSize) * 100}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-muted">
                  <span>1st</span>
                  <span>{ordinal(year.fieldSize)}</span>
                </div>
                <p className="mt-2 text-sm text-ink/85">
                  Finished {ordinal(year.overall as number)} of {year.fieldSize}, ahead of{" "}
                  {year.fieldSize - (year.overall as number)} teams.
                </p>
              </div>
            )}
            {recognition.length > 0 && (
              <div className="mt-8">
                <p className={label}>Also recognized</p>
                <ul className="mt-3 space-y-2 text-[15px]">
                  {recognition.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span aria-hidden="true" className="text-accent">
                        —
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ReportSection>

          <ReportSection n="03" id="specs" title="Specifications">
            {year.specs.length > 0 ? (
              <>
                <div className="grid gap-x-12 gap-y-10 xl:grid-cols-2">
                  {specGroups.map((group) => (
                    <div key={group.name}>
                      <p className={`${label} mb-2 !text-accent`}>{group.name}</p>
                      <RuledTable
                        rows={group.rows.map((spec) => ({
                          key: spec.label,
                          label: cleanLabel(spec.label),
                          value: spec.value,
                        }))}
                      />
                    </div>
                  ))}
                </div>
                {hasDesignValues && (
                  <p className="mt-3 text-xs text-muted">
                    Weights, travel, clearance and similar figures are
                    design-review targets; the built car can differ.
                  </p>
                )}
              </>
            ) : (
              <p className="text-muted">
                We&apos;re pulling this car&apos;s spec sheet from the team
                archives. Check back soon.
              </p>
            )}
          </ReportSection>

          <ReportSection n="04" id="team" title="Team">
            {year.leads.length > 0 ? (
              <>
                <p className={`${label} mb-3`}>Leadership</p>
                <RuledTable
                  rows={year.leads.map((lead) => ({
                    key: `${lead.role}-${lead.name}`,
                    label: lead.role,
                    value: lead.name,
                  }))}
                />
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
              <div className="mt-10">
                <p className={`${label} mb-3`}>
                  {year.teamSize && year.teamSize > rosterCount
                    ? `Named on the roster · ${rosterCount} of ${year.teamSize}`
                    : `Full roster · ${rosterCount} members`}
                </p>
                <RuledTable
                  rows={year.roster.map((group) => ({
                    key: group.team,
                    label: (
                      <>
                        {group.team}{" "}
                        <span className="text-muted/70">
                          ({group.members.length})
                        </span>
                      </>
                    ),
                    value: group.members.map((member, i) => {
                      const isLead = /\(.*lead.*\)$/i.test(member);
                      const name = member.replace(/\s*\([^)]+\)$/, "");
                      const tag = member.match(/\(([^)]+)\)$/)?.[1];
                      return (
                        <span key={member}>
                          {i > 0 && ", "}
                          <span
                            className={isLead ? "font-semibold" : "text-ink/85"}
                          >
                            {name}
                          </span>
                          {tag && <span className="text-muted"> ({tag})</span>}
                        </span>
                      );
                    }),
                  }))}
                />
              </div>
            )}
          </ReportSection>

          {year.sponsors.length > 0 && (
            <ReportSection n="05" id="sponsors" title="Sponsors">
              <p className="max-w-[68ch] text-muted">
                The companies and groups that helped put this car on the track.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {year.sponsors.map((sponsor) => (
                  <li
                    key={sponsor}
                    className="rounded-full border border-line bg-panel px-3.5 py-1.5 text-sm font-medium"
                  >
                    {sponsor}
                  </li>
                ))}
              </ul>
            </ReportSection>
          )}

          <nav
            aria-label="More cars"
            className="grid grid-cols-2 gap-6 border-t border-line pt-8"
          >
            {newer ? (
              <Link href={carHref(newer)} className="group">
                <span className={label}>← Newer</span>
                <span className="mt-1 block font-semibold group-hover:text-accent">
                  {newer.season}
                  {newer.number ? ` · Car #${newer.number}` : ""}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {older ? (
              <Link href={carHref(older)} className="group text-right">
                <span className={label}>Older →</span>
                <span className="mt-1 block font-semibold group-hover:text-accent">
                  {older.season}
                  {older.number ? ` · Car #${older.number}` : ""}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </div>
      </div>

      <CtaBand
        title="Put your name on the next car"
        body="Partner with us to ride on the next car at Rollout and competition."
      />
    </>
  );
}
