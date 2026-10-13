import { formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";

/**
 * "Where we are now": the last finished milestone, what's up next, and how far along the season is.
 * Status comes from the date, same as MilestoneTimeline, so nobody has to update it by hand.
 */
export function BuildStatus({
  milestones,
  buildSeason,
  today = new Date(),
}: {
  milestones: Milestone[];
  buildSeason: string;
  today?: Date;
}) {
  const items = withStatus(milestones, today);
  const done = items.filter((item) => item.status === "done");
  const latest = done.at(-1);
  const next = items.find((item) => item.status === "next");
  const percent = Math.round((done.length / items.length) * 100);
  const daysToNext = next
    ? Math.max(0, Math.ceil((Date.parse(`${next.date}T00:00:00Z`) - today.getTime()) / 86_400_000))
    : null;

  return (
    <div className="rounded-sm border border-line bg-panel p-6 sm:p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Just finished</p>
          <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight">
            {latest ? latest.name : "Kicking off the season"}
          </p>
          {latest && <p className="mt-1 text-sm text-muted">✓ {formatMilestoneDate(latest.date)}</p>}
        </div>
        <div className="md:border-l md:border-line md:pl-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Up next</p>
          <p className="mt-2 font-display text-3xl font-extrabold uppercase leading-tight">{next ? next.name : "Season complete"}</p>
          {next && (
            <p className="mt-1 text-sm text-muted">
              {formatMilestoneDate(next.date)}
              {next.tentative ? " (tentative)" : ""}
              {daysToNext !== null && daysToNext > 0 ? ` · in ${daysToNext} ${daysToNext === 1 ? "day" : "days"}` : ""}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-baseline justify-between text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>{buildSeason} build</span>
          <span>
            {done.length} of {items.length} milestones
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-panel-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={done.length}
          aria-label={`${buildSeason} build progress`}
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}
