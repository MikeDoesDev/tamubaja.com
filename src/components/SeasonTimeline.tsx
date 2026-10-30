"use client";

import Image from "next/image";
import { daysUntil, formatMilestoneDate, type Milestone } from "@/lib/milestones";
import { buildSeasonLog, type LogEntry } from "@/lib/seasonLog";
import type { Event } from "@/lib/schemas";
import { useToday } from "@/lib/useToday";

const short = (iso: string) => formatMilestoneDate(iso).replace(/, \d{4}$/, "");

function Marker({ entry }: { entry: LogEntry }) {
  if (entry.kind === "event") {
    return <span className="absolute left-[-1.6rem] top-1.5 h-3 w-3 rotate-45 rounded-[2px] border-2 border-accent bg-bg" aria-hidden="true" />;
  }
  if (entry.status === "done") {
    return (
      <span className="absolute left-[-1.95rem] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-bg" aria-hidden="true">
        ✓
      </span>
    );
  }
  if (entry.status === "next") {
    return <span className="absolute left-[-1.95rem] top-0 h-5 w-5 rounded-full border-2 border-accent bg-bg ring-4 ring-accent/25" aria-hidden="true" />;
  }
  return <span className="absolute left-[-1.85rem] top-0.5 h-4 w-4 rounded-full border-2 border-line bg-bg" aria-hidden="true" />;
}

function Entry({ entry, days }: { entry: LogEntry; days: number | null }) {
  const label =
    entry.kind === "event"
      ? "Team event"
      : entry.status === "done"
        ? "Milestone · done"
        : entry.status === "next"
          ? "Up next"
          : "Milestone";
  return (
    <li className={`relative pb-8 ${entry.status === "upcoming" && entry.kind === "milestone" ? "opacity-75" : ""}`}>
      <Marker entry={entry} />
      <div
        className={`grid gap-x-5 gap-y-3 sm:grid-cols-[6rem_1fr] ${
          entry.status === "next" ? "-ml-4 -my-3 rounded-2xl border border-accent/60 bg-panel-2 px-4 py-3" : ""
        }`}
      >
        <p className="text-sm text-muted">
          <time dateTime={entry.date}>{short(entry.date)}</time>
          {entry.tentative ? <span className="block text-xs">tentative</span> : null}
        </p>
        <div className="min-w-0">
          <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${entry.kind === "event" || entry.status !== "upcoming" ? "text-accent" : "text-muted"}`}>
            {label}
          </p>
          <h3 className={`font-display font-extrabold uppercase leading-tight ${entry.status === "next" ? "text-3xl" : "text-xl"}`}>{entry.name}</h3>
          {entry.status === "next" && days !== null && (
            <p className="mt-1 text-sm text-ink">{days > 1 ? `${days} days to go` : days === 1 ? "Tomorrow" : "Today"}</p>
          )}
          {entry.description && <p className="mt-1 max-w-xl text-muted">{entry.description}</p>}
          {entry.photos.length > 0 && (
            <div className="mt-3 flex gap-2">
              {entry.photos.map((photo, index) => (
                <div key={photo} className="relative aspect-[4/3] w-1/3 max-w-44 overflow-hidden rounded-sm">
                  <Image src={photo} alt={index === 0 ? entry.name : ""} fill sizes="176px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
          {entry.link && (
            <a href={entry.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-accent underline-offset-4 hover:underline">
              See the post<span className="sr-only">: {entry.name}</span> →
            </a>
          )}
          {entry.sponsorNote && (
            <p className="mt-3 max-w-md rounded-lg border-l-4 border-maroon bg-maroon/25 px-3 py-2 text-xs leading-snug text-ink/90">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70">For sponsors</span>
              {entry.sponsorNote}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

/**
 * The season in one place: a summary panel (up next, countdown, progress) beside a single timeline
 * of build milestones and team events, grouped by phase. Status comes from the visitor's clock.
 */
export function SeasonTimeline({
  milestones,
  events,
  buildSeason,
  builtAt,
}: {
  milestones: Milestone[];
  events: Event[];
  buildSeason: string;
  builtAt: string;
}) {
  const today = useToday(builtAt);
  const log = buildSeasonLog(milestones, events, today);
  const steps = log.filter((entry) => entry.kind === "milestone");
  const done = steps.filter((entry) => entry.status === "done").length;
  const next = steps.find((entry) => entry.status === "next");
  const days = next ? daysUntil(next.date, today) : null;
  const sponsorMoment = steps.find((entry) => entry.status !== "done" && entry.sponsorNote);

  const phases: { name: string; entries: LogEntry[] }[] = [];
  for (const entry of log) {
    const last = phases.at(-1);
    if (last && last.name === entry.phase) last.entries.push(entry);
    else phases.push({ name: entry.phase, entries: [entry] });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[20rem_1fr] lg:gap-14">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-line border-t-4 border-t-maroon bg-panel p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Up next
          </p>
          <p className="mt-3 font-display text-3xl font-extrabold uppercase leading-[0.95]">{next ? next.name : "Season complete"}</p>
          {next && <p className="mt-1 text-sm text-muted">{formatMilestoneDate(next.date)}</p>}
          {days !== null && (
            <p className="mt-5 flex items-end gap-3 border-t border-line pt-5">
              {days > 1 ? (
                <>
                  <span className="font-display text-7xl font-extrabold leading-[0.8]">{days}</span>
                  <span className="pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Days to go</span>
                </>
              ) : (
                <span className="font-display text-5xl font-extrabold uppercase leading-none">{days === 1 ? "Tomorrow" : "Today"}</span>
              )}
            </p>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-baseline justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
              <span>{buildSeason} build</span>
              <span>
                {done} / {steps.length}
              </span>
            </div>
            <div
              className="mt-3 flex gap-1"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={steps.length}
              aria-valuenow={done}
              aria-label={`${buildSeason} build progress`}
            >
              {steps.map((entry) => (
                <span
                  key={entry.name}
                  title={`${entry.name} · ${formatMilestoneDate(entry.date)}`}
                  className={`h-2 flex-1 rounded-full ${
                    entry.status === "done" ? "bg-accent" : entry.status === "next" ? "animate-pulse bg-accent/45 motion-reduce:animate-none" : "bg-panel-2"
                  }`}
                />
              ))}
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {phases
                .filter((phase, index, all) => all.findIndex((p) => p.name === phase.name) === index)
                .map((phase) => {
                  const phaseSteps = steps.filter((entry) => entry.phase === phase.name);
                  const complete = phaseSteps.length > 0 && phaseSteps.every((entry) => entry.status === "done");
                  const active = phaseSteps.some((entry) => entry.status === "next");
                  return (
                    <li key={phase.name}>
                      <a href={`#phase-${phase.name.toLowerCase()}`} className={`flex justify-between hover:text-accent ${active ? "font-semibold text-ink" : "text-muted"}`}>
                        <span>{phase.name}</span>
                        <span>{complete ? "✓ Complete" : active ? "In progress" : "Upcoming"}</span>
                      </a>
                    </li>
                  );
                })}
            </ul>
          </div>

          {sponsorMoment && (
            <p className="mt-5 rounded-lg border-l-4 border-maroon bg-maroon/25 px-3 py-2 text-xs leading-snug text-ink/90">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70">
                For sponsors · {sponsorMoment.name}, {short(sponsorMoment.date)}
              </span>
              {sponsorMoment.sponsorNote}
            </p>
          )}
        </div>
      </aside>

      <div>
        {phases.map((phase, index) => (
          <section key={`${phase.name}-${index}`} id={`phase-${phase.name.toLowerCase()}`} className="scroll-mt-28">
            <h3 className="mb-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-extrabold leading-none text-ink/15">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl font-extrabold uppercase">{phase.name}</span>
            </h3>
            <ol className="ml-[0.6rem] border-l-2 border-line pl-8">
              {phase.entries.map((entry) => (
                <Entry key={`${entry.kind}-${entry.date}-${entry.name}`} entry={entry} days={days} />
              ))}
            </ol>
          </section>
        ))}
        <p className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-accent" aria-hidden="true" /> Build milestone
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rotate-45 rounded-[2px] border-2 border-accent" aria-hidden="true" /> Team event
          </span>
        </p>
      </div>
    </div>
  );
}
