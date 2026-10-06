import Image from "next/image";
import { Eyebrow } from "./Section";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageAlt = "",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line">
      {image && (
        <>
          <Image src={image} alt={imageAlt} fill preload fetchPriority="high" quality={60} sizes="100vw" className="-z-20 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-linear-to-t from-bg to-bg/40" />
        </>
      )}
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 sm:px-6 sm:pb-20 sm:pt-28">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg text-muted">{intro}</p>}
      </div>
    </section>
  );
}
