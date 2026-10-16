import Link from "next/link";
import type { Tier } from "@/lib/schemas";

/** A clean sponsorship card: name, price, what's included, and one clear button. Gold is featured. */
export function TierCard({ tier, lowerTierName }: { tier: Tier; lowerTierName?: string }) {
  const featured = tier.id === "gold";
  const [low, high] = tier.priceLabel.split(/\s*[–-]\s*/);
  return (
    <article
      aria-labelledby={`tier-${tier.id}`}
      className={`flex flex-col rounded-3xl p-7 ${featured ? "bg-maroon text-white" : "bg-white text-bg"}`}
    >
      <div className="flex items-center justify-between">
        <h3 id={`tier-${tier.id}`} className="text-xl font-semibold">
          {tier.name}
        </h3>
        <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: tier.badgeColor }} />
      </div>
      {featured && (
        <span className="mt-3 self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Recruit and get seen</span>
      )}
      <p className="mt-6 whitespace-nowrap text-5xl font-normal tracking-tight">{low}</p>
      <p className={`mt-1 text-sm ${featured ? "text-white/70" : "text-[#5d6670]"}`}>{high ? `up to ${high}` : "and up"}</p>
      <ul className="mt-6 flex-1 space-y-2.5 text-sm">
        {tier.benefits.map((benefit) => (
          <li key={benefit} className="flex gap-2.5">
            <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${featured ? "bg-white" : "bg-accent"}`} />
            {benefit}
          </li>
        ))}
        {lowerTierName && (
          <li className={`flex gap-2.5 ${featured ? "text-white/70" : "text-[#5d6670]"}`}>
            <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-current" />
            Everything in {lowerTierName}
          </li>
        )}
      </ul>
      <Link
        href={`/sponsors?interest=${tier.id}#inquire`}
        className={`mt-8 flex h-12 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
          featured ? "bg-white text-bg hover:bg-white/85" : "bg-bg text-white hover:bg-maroon"
        }`}
      >
        Choose {tier.name}
      </Link>
    </article>
  );
}
