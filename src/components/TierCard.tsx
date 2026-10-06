import Link from "next/link";
import type { Tier } from "@/lib/schemas";

export function TierCard({ tier, lowerTierName }: { tier: Tier; lowerTierName?: string }) {
  return (
    <article
      aria-labelledby={`tier-${tier.id}`}
      className="flex flex-col rounded-sm border border-line bg-panel p-6"
      style={{ borderTop: `4px solid ${tier.badgeColor}` }}
    >
      <h3 id={`tier-${tier.id}`} className="font-display text-3xl font-extrabold uppercase">
        {tier.name}
      </h3>
      <p className="mt-1 font-display text-2xl font-bold text-accent">{tier.priceLabel}</p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <span aria-hidden="true" className="text-accent">
              ▸
            </span>
            {benefit}
          </li>
        ))}
        {lowerTierName && (
          <li className="flex gap-2 text-muted">
            <span aria-hidden="true">+</span>
            Everything in {lowerTierName}
          </li>
        )}
      </ul>
      <Link
        href={`/sponsors?interest=${tier.id}#inquire`}
        className="mt-6 inline-block text-sm font-semibold uppercase tracking-wide text-accent underline underline-offset-4 hover:text-ink"
      >
        Choose {tier.name}
      </Link>
    </article>
  );
}
