import { ButtonLink } from "./ButtonLink";

export function CtaBand({ title, body }: { title: string; body: string }) {
  return (
    <section className="slash-y bg-maroon px-4 pb-28 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-5xl font-extrabold uppercase leading-none sm:text-6xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
          <ButtonLink href="/sponsors#tiers" variant="secondary">
            See the tiers
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
