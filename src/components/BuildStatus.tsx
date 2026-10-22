"use client";

import { daysUntil, formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";
import { useToday } from "@/lib/useToday";

/**
 * "Where we are now": what's up next with a countdown, what just finished, what follows, the next
 * milestone sponsors are part of, and a progress track grouped by phase.
 *
 * Status and the countdown come from the date in the visitor's browser (Central time), so nobody has
 * to update anything by hand and the numbers stay right between deploys.
 */
export function BuildStatus({
  milestones,
  buildSeason,
  builtAt,
}: {
  milestones: Milestone[];
  buildSeason: string;
  /** When the page was built (ISO string); the first paint uses it, then the browser's clock takes over. */
  builtAt: string;
}) {
  const today = useToday(builtAt);
  const items = withStatus(milestones, today);
  const done = items.filter((item) => item.status === "done");
  const latest = done.at(-1);
  const nextIndex = items.findIndex((item) => item.status === "next");
  const next = nextIndex >= 0 ? items[nextIndex] : undefined;
  const afterNext = nextIndex >= 0 ? items.slice(nextIndex + 1, nextIndex + 3) : [];
  const sponsorMoment = items.find((item) => item.status !== "done" && item.sponsorNote);
  const days = next ? daysUntil(next.date, today) : null;

  const phases: { name: string; items: typeof items }[] = [];
  for (const item of items) {
    const name = item.phase ?? "Season";
    const last = phases.at(-1);
    if (last && last.name === name) last.items.push(item);
    else phases.push({ name, items: [item] });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line border-t-4 border-t-maroon bg-panel">
      <div className="grid md:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Up next
          </p>
          <div>
            <p className="font-display text-4xl font-extrabold uppercase leading-[0.95] sm:text-5xl">
              {next ? next.name : "Season complete"}
            </p>
            {next && (
              <p className="mt-2 text-sm text-muted">
                {formatMilestoneDate(next.date)}
                {next.tentative ? " (tentative)" : ""}
              </p>
            )}
          </div>
          {days !== null && (
            <p className="flex items-end gap-3 border-t border-line pt-5">
              {days > 1 ? (
                <>
                  <span className="font-display text-7xl font-extrabold leading-[0.8] text-ink sm:text-8xl">{days}</span>
                  <span className="pb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Days to go</span>
                </>
              ) : (
                <span className="font-display text-5xl font-extrabold uppercase leading-none text-ink sm:text-6xl">
                  {days === 1 ? "Tomorrow" : "Today"}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 border-t border-line bg-panel-2/50 p-6 sm:p-8 md:border-l md:border-t-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Just finished</p>
            <p className="mt-2 font-display text-xl font-extrabold uppercase leading-tight">
              {latest ? latest.name : "Kicking off the season"}
            </p>
            {latest && <p className="mt-1 text-sm text-accent">✓ {formatMilestoneDate(latest.date)}</p>}
          </div>

          {afterNext.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">After that</p>
              <ul className="mt-2 divide-y divide-line">
                {afterNext.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-4 py-2 text-sm">
                    <span className="font-medium text-ink">{item.name}</span>
                    <span className="shrink-0 text-muted">
                      {formatMilestoneDate(item.date).replace(/, \d{4}$/, "")}
                      {item.tentative ? "*" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sponsorMoment && (
            <p className="mt-auto rounded-lg border-l-4 border-maroon bg-maroon/25 px-3 py-2 text-xs leading-snug text-ink/90">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/70">
                For sponsors · {sponsorMoment.name}, {formatMilestoneDate(sponsorMoment.date).replace(/, \d{4}$/, "")}
              </span>
              {sponsorMoment.sponsorNote}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line px-6 py-5 sm:px-8">
        <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>{buildSeason} build</span>
          <span>
            {done.length} of {items.length} milestones
          </span>
        </div>
        <div
          className="mt-3 flex gap-3"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={done.length}
          aria-label={`${buildSeason} build progress`}
        >
          {phases.map((phase, index) => {
            const active = phase.items.some((item) => item.status === "next");
            return (
              <div key={`${phase.name}-${index}`} className="min-w-0" style={{ flex: phase.items.length }}>
                <div className="flex gap-1">
                  {phase.items.map((item) => (
                    <span
                      key={item.name}
                      title={`${item.name} · ${formatMilestoneDate(item.date)}`}
                      className={`h-2.5 flex-1 rounded-full ${
                        item.status === "done"
                          ? "bg-accent"
                          : item.status === "next"
                            ? "animate-pulse bg-accent/45 motion-reduce:animate-none"
                            : "bg-panel-2"
                      }`}
                    />
                  ))}
                </div>
                <p
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-[11px] sm:tracking-[0.18em] ${active ? "text-ink" : "text-muted"}`}
                >
                  {phase.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
