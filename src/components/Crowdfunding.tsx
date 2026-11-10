import Image from "next/image";
import type { Site } from "@/lib/schemas";
import { MilestoneBar } from "./MilestoneBar";

type Drive = NonNullable<Site["crowdfunding"]>;

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Crowdfunding drive: Venmo link and QR, a progress bar, and the milestone challenges unlocked along the way. */
export function Crowdfunding({ drive }: { drive: Drive }) {
  const milestones = [...drive.milestones].sort((a, b) => b.amount - a.amount);
  const goal = milestones[0].amount;

  return (
    <div className="overflow-hidden rounded-sm border border-line bg-panel">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="flex flex-col gap-6 bg-maroon p-6 text-white sm:p-10">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Fall 2026 crowdfunding</p>
            <h3 className="font-display text-4xl font-extrabold uppercase leading-none sm:text-5xl">{drive.title}</h3>
            <p className="mt-4 text-white/85">{drive.body}</p>
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="font-display text-3xl font-extrabold">{dollars(drive.raised)} raised</p>
              <p className="text-sm text-white/70">Goal {dollars(goal)}</p>
            </div>
            <div className="mt-4">
              <MilestoneBar raised={drive.raised} milestones={drive.milestones} />
            </div>
          </div>

          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <a
              href={drive.venmoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-sm bg-white p-3"
              aria-label={`Venmo QR code for @${drive.venmoHandle}`}
            >
              <Image src={drive.qrImage} alt="" width={148} height={150} className="h-[150px] w-[148px]" />
            </a>
            <div className="flex flex-col gap-3">
              <a
                href={drive.venmoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-white px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-maroon transition-colors hover:bg-white/90"
              >
                Venmo @{drive.venmoHandle} <span aria-hidden="true">→</span>
              </a>
              <p className="text-sm text-white/70">Scan the code or tap the button. Want a tax receipt? Give through the Foundation below.</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <p className="font-display text-2xl font-extrabold uppercase">Milestone challenges</p>
          <ol className="mt-5 divide-y divide-line">
            {milestones.map((m) => {
              const hit = drive.raised >= m.amount;
              return (
                <li
                  key={m.amount}
                  className={`flex items-center gap-4 py-3 ${m.highlight ? "-mx-3 rounded-sm bg-maroon px-3 text-white" : ""}`}
                >
                  <span
                    className={`w-24 shrink-0 font-display text-2xl font-extrabold ${m.highlight ? "text-white" : "text-accent"}`}
                  >
                    {dollars(m.amount)}
                  </span>
                  <span className={`flex-1 ${m.highlight ? "font-semibold" : hit ? "text-ink" : "text-muted"}`}>
                    {m.challenge}
                  </span>
                  {hit && (
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-wide">
                      <span aria-hidden="true">✓ </span>Unlocked
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}
