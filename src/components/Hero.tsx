import Image from "next/image";
import type { Site } from "@/lib/schemas";
import { ButtonLink } from "./ButtonLink";
import { Eyebrow } from "./Section";

export function Hero({ site }: { site: Site }) {
  return (
    <section className="relative isolate flex min-h-[85vh] items-end overflow-hidden">
      <Image
        src={site.heroImage}
        alt="Texas A&M Baja SAE car racing off-road"
        fill
        preload
        fetchPriority="high"
        quality={60}
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {site.heroVideo && (
        <video
          className="absolute inset-0 -z-20 hidden h-full w-full object-cover md:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={site.heroImage}
          aria-hidden="true"
        >
          <source src={site.heroVideo} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg via-bg/60 to-bg/10" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <Eyebrow>{site.name}</Eyebrow>
        <h1 className="max-w-4xl font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">
          {site.tagline}
        </h1>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
          <ButtonLink href="/car" variant="secondary">
            Meet the Car
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
