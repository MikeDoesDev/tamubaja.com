import { formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";

const LABELS = { done: "✓ Done", next: "Up next", upcoming: "Upcoming" } as const;

export function MilestoneTimeline({ milestones, today = new Date() }: { milestones: Milestone[]; today?: Date }) {
  const items = withStatus(milestones, today);
  return (
    <ol className="grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li
          key={item.name}
          data-status={item.status}
          className={`bg-panel p-5 ${item.status === "next" ? "outline-2 -outline-offset-2 outline-accent" : ""}`}
        >
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${item.status === "next" ? "text-accent" : "text-muted"}`}>
            {LABELS[item.status]}
          </p>
          <p className="mt-1 font-display text-2xl font-bold uppercase">{item.name}</p>
          <p className="mt-1 text-sm text-muted">
            {formatMilestoneDate(item.date)}
            {item.tentative ? " (tentative)" : ""}
          </p>
        </li>
      ))}
    </ol>
  );
}
