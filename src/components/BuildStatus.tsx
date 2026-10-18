import { formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";

/**
 * "Where we are now": what's up next with a countdown, what just finished, and a segmented progress
 * track (one segment per milestone). Status comes from the date, so nobody has to update it by hand.
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
  const daysToNext = next
    ? Math.max(0, Math.ceil((Date.parse(`${next.date}T00:00:00Z`) - today.getTime()) / 86_400_000))
    : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="grid md:grid-cols-[1.4fr_1fr]">
        <div className="relative p-6 sm:p-8">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60 motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Up next
          </p>
          <div className="mt-3 grid items-end gap-6 sm:grid-cols-[1fr_auto]">
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
            {daysToNext !== null && daysToNext > 0 && (
              <p className="text-right">
                <span className="block font-display text-6xl font-extrabold leading-none text-accent">{daysToNext}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                  {daysToNext === 1 ? "Day to go" : "Days to go"}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="border-t border-line bg-panel-2/50 p-6 sm:p-8 md:border-l md:border-t-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Just finished</p>
          <p className="mt-3 font-display text-2xl font-extrabold uppercase leading-tight">
            {latest ? latest.name : "Kicking off the season"}
          </p>
          {latest && <p className="mt-1 text-sm text-muted">✓ {formatMilestoneDate(latest.date)}</p>}
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
          className="mt-3 flex gap-1"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={done.length}
          aria-label={`${buildSeason} build progress`}
        >
          {items.map((item) => (
            <span
              key={item.name}
              title={item.name}
              className={`h-2.5 flex-1 rounded-full ${
                item.status === "done" ? "bg-accent" : item.status === "next" ? "animate-pulse bg-accent/45 motion-reduce:animate-none" : "bg-panel-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
