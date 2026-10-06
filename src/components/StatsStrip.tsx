import { CountUp } from "./CountUp";

export function StatsStrip({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section aria-label="Team highlights" className="border-y border-line bg-line">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:auto-cols-fr sm:grid-flow-col sm:grid-cols-none">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col bg-panel px-4 py-8 text-center">
            <dt className="mt-2 text-sm text-muted">{stat.label}</dt>
            <dd className="order-first font-display text-5xl font-extrabold text-accent">
              <CountUp value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
