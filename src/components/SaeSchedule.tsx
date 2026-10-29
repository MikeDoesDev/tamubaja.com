"use client";

import { formatMilestoneDate, withStatus } from "@/lib/milestones";
import { useToday } from "@/lib/useToday";

interface Session {
  date: string;
  time: string;
  room: string;
  note?: string;
}

const LABELS = { done: "Done", next: "Up next", upcoming: "Upcoming" } as const;

function weekday(isoDate: string) {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

/** The SAE development program's sessions, with past ones marked done in the visitor's browser. */
export function SaeSchedule({ sessions, builtAt }: { sessions: Session[]; builtAt: string }) {
  const today = useToday(builtAt);
  const items = withStatus(
    sessions.map((s) => ({ ...s, name: `${s.date}-${s.room}` })),
    today,
  );

  return (
    <ol className="divide-y divide-line overflow-hidden rounded-sm border border-line">
      {items.map((item) => (
        <li
          key={item.name}
          data-status={item.status}
          className={`grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[7rem_9rem_1fr_6rem] ${
            item.status === "next" ? "bg-panel-2" : "bg-panel"
          } ${item.status === "done" ? "opacity-60" : ""}`}
        >
          <p className="font-display text-lg font-bold uppercase leading-tight">
            <span className="text-muted">{weekday(item.date)} </span>
            {formatMilestoneDate(item.date).replace(/, \d{4}$/, "")}
          </p>
          <p className="text-sm text-muted">{item.time}</p>
          <p className="col-start-2 sm:col-start-auto">
            {item.room}
            {item.note && <span className="block text-sm text-accent sm:inline sm:before:content-['_·_']">{item.note}</span>}
          </p>
          <p
            className={`col-start-2 text-[11px] font-semibold uppercase tracking-[0.2em] sm:col-start-auto sm:text-right ${
              item.status === "upcoming" ? "text-muted" : "text-accent"
            }`}
          >
            {LABELS[item.status]}
          </p>
        </li>
      ))}
    </ol>
  );
}
