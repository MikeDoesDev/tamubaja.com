"use client";

import Image from "next/image";
import { formatMilestoneDate, withStatus, type Milestone } from "@/lib/milestones";
import { useToday } from "@/lib/useToday";

const LABELS = { done: "Done", next: "Up next", upcoming: "Upcoming" } as const;

/**
 * The season as a track: milestones grouped by phase (Design → Build → Compete), each a stop on the
 * line. Finished stops are filled in; a milestone with a photo shows it.
 */
export function MilestoneTimeline({ milestones, builtAt }: { milestones: Milestone[]; builtAt: string }) {
  const today = useToday(builtAt);
  const items = withStatus(milestones, today);
  const phases: { name: string; items: typeof items }[] = [];
  for (const item of items) {
    const name = item.phase ?? "Season";
    const last = phases.at(-1);
    if (last && last.name === name) last.items.push(item);
    else phases.push({ name, items: [item] });
  }

  return (
    <div>
      <ol className="space-y-10">
        {phases.map((phase, phaseIndex) => {
          const phaseDone = phase.items.every((item) => item.status === "done");
          const phaseActive = phase.items.some((item) => item.status === "next");
          return (
            <li key={`${phase.name}-${phaseIndex}`} className="grid gap-5 lg:grid-cols-[11rem_1fr]">
              <p className="flex items-baseline gap-3 lg:flex-col lg:gap-1 lg:pt-6">
                <span className="font-display text-5xl font-extrabold leading-none text-ink/10">
                  {String(phaseIndex + 1).padStart(2, "0")}
                </span>
                <span className={`font-display text-2xl font-extrabold uppercase ${phaseActive ? "text-ink" : "text-muted"}`}>
                  {phase.name}
                </span>
                {phaseDone && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">✓ Complete</span>}
              </p>
              <ol className="grid gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
                {phase.items.map((item, itemIndex) => (
                  <li key={item.name} data-status={item.status} className="relative pt-7">
                    {/* the track */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 ${itemIndex === phase.items.length - 1 ? "right-0" : "right-[-1rem]"} top-[0.6rem] h-1 rounded-full ${item.status === "done" ? "bg-accent" : "bg-line"}`}
                    />
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                        item.status === "done"
                          ? "border-accent bg-accent text-bg"
                          : item.status === "next"
                            ? "border-accent bg-bg ring-4 ring-accent/25"
                            : "border-line bg-bg"
                      }`}
                    >
                      {item.status === "done" ? "✓" : ""}
                    </span>
                    <div
                      className={`overflow-hidden rounded-2xl border ${
                        item.status === "next" ? "border-accent/70 bg-panel-2" : "border-line bg-panel"
                      } ${item.status === "upcoming" ? "opacity-80" : ""}`}
                    >
                      {item.photo && (
                        <div className="relative aspect-[4/3]">
                          <Image src={item.photo} alt={item.name} fill sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
                        </div>
                      )}
                      <div className="p-4">
                        <p
                          className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
                            item.status === "upcoming" ? "text-muted" : "text-accent"
                          }`}
                        >
                          {LABELS[item.status]}
                        </p>
                        <p className="mt-1 font-display text-xl font-bold uppercase leading-tight">{item.name}</p>
                        <p className="mt-1 text-sm text-muted">
                          {formatMilestoneDate(item.date)}
                          {item.tentative ? " (tentative)" : ""}
                        </p>
                        {item.sponsorNote && (
                          <p className="mt-3 rounded-lg border-l-4 border-maroon bg-maroon/25 px-3 py-2 text-xs leading-snug text-ink/90">
                            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">For sponsors</span>
                            {item.sponsorNote}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
