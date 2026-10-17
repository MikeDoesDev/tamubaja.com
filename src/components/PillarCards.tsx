import Image from "next/image";
import type { Site } from "@/lib/schemas";

/** "Why partner" cards: a photo on top, a short pitch below. Used on the homepage and the sponsor page. */
export function PillarCards({ pillars, headingLevel = "h3" }: { pillars: Site["sponsorPillars"]; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {pillars.map((pillar) => (
        <article key={pillar.title} className="overflow-hidden rounded-2xl border border-line bg-panel">
          {pillar.photo && (
            <div className="relative aspect-[16/10]">
              <Image src={pillar.photo} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className="p-6">
            <Heading className="font-display text-3xl font-extrabold uppercase">{pillar.title}</Heading>
            <p className="mt-2 text-muted">{pillar.body}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
