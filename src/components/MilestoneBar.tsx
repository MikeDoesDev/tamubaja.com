import type { Site } from "@/lib/schemas";

type Milestone = NonNullable<Site["crowdfunding"]>["milestones"][number];

const short = (n: number) => (n >= 1000 ? `$${n / 1000}K` : `$${n}`);
const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Progress bar with a tick and label at every milestone. Made for the maroon panels (white on maroon). */
export function MilestoneBar({
  raised,
  milestones,
  size = "lg",
}: {
  raised: number;
  milestones: Milestone[];
  size?: "lg" | "sm";
}) {
  const sorted = [...milestones].sort((a, b) => a.amount - b.amount);
  const goal = sorted.at(-1)!.amount;
  const pos = (n: number) => Math.min(100, (n / goal) * 100);
  const bar = size === "lg" ? "h-3" : "h-2.5";
  const dot = size === "lg" ? "h-3.5 w-3.5" : "h-3 w-3";

  return (
    <div className="pb-5">
      <div
        className={`relative ${bar} rounded-full bg-white/20`}
        role="progressbar"
        aria-label="Crowdfunding progress"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={raised}
        aria-valuetext={`${dollars(raised)} of ${dollars(goal)}`}
      >
        <div className="h-full rounded-full bg-white" style={{ width: `${pos(raised)}%` }} />
        {sorted.map((m, i) => {
          const hit = raised >= m.amount;
          const last = i === sorted.length - 1;
          // Labels sit centered under each tick; the last one right-aligns so it stays inside the bar.
          // On phones, every other label is hidden so they don't collide (the highlight and goal always show).
          const showAlways = m.highlight || last || i % 2 === 1;
          return (
            <div
              key={m.amount}
              className="absolute top-1/2"
              style={{ left: `${pos(m.amount)}%` }}
              title={`${dollars(m.amount)}: ${m.challenge}`}
            >
              <span
                className={`absolute left-0 top-0 block ${dot} -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                  hit ? "border-white bg-white" : m.highlight ? "border-white bg-maroon" : "border-white/60 bg-maroon"
                }`}
              />
              <span
                className={`absolute top-3 whitespace-nowrap text-[10px] font-semibold leading-none ${
                  last ? "right-0" : "left-0 -translate-x-1/2"
                } ${hit || m.highlight ? "text-white" : "text-white/60"} ${showAlways ? "" : "hidden sm:block"}`}
              >
                {short(m.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
