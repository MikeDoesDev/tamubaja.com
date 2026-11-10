import Link from "next/link";
import type { Site } from "@/lib/schemas";
import { MilestoneBar } from "./MilestoneBar";

type Drive = NonNullable<Site["crowdfunding"]>;

const dollars = (n: number) => `$${n.toLocaleString("en-US")}`;

/** Home-page band that points to the crowdfunding drive on /sponsors#crowdfunding. */
export function CrowdfundingBanner({ drive }: { drive: Drive }) {
  const milestones = [...drive.milestones].sort((a, b) => a.amount - b.amount);
  const goal = milestones.at(-1)!.amount;
  const next = milestones.find((m) => m.amount > drive.raised);

  return (
    <section aria-label="Crowdfunding" className="bg-maroon px-4 py-5 text-white sm:px-6 sm:py-6">
      <Link
        href="/sponsors#crowdfunding"
        className="group mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div className="min-w-0 flex-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            Fall 2026 crowdfunding
          </p>
          <p className="font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">
            {drive.title}
          </p>
          <p className="mt-2 max-w-2xl text-white/85">
            {next ? (
              <>
                Next up at {dollars(next.amount)}: {next.challenge}.
              </>
            ) : (
              <>Every milestone unlocked. Thank you, Aggies!</>
            )}
          </p>
          <div className="mt-3 flex max-w-xl items-center gap-3">
            <div className="flex-1">
              <MilestoneBar raised={drive.raised} milestones={drive.milestones} size="sm" />
            </div>
            <p className="shrink-0 text-sm text-white/80">
              {dollars(drive.raised)} of {dollars(goal)}
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-sm bg-white px-6 py-3 font-display text-lg font-bold uppercase tracking-wide text-maroon transition-colors group-hover:bg-white/90 md:self-center">
          Donate &amp; see the challenges <span aria-hidden="true">→</span>
        </span>
      </Link>
    </section>
  );
}
