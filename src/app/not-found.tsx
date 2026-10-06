import { ButtonLink } from "@/components/ButtonLink";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 py-24 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-3 font-display text-6xl font-extrabold uppercase leading-[0.9] sm:text-8xl">Wrong turn</h1>
      <p className="mt-4 max-w-xl text-lg text-muted">You&apos;re off course. This page doesn&apos;t exist.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ButtonLink href="/">Back to home</ButtonLink>
        <ButtonLink href="/sponsors" variant="secondary">
          Sponsor the team
        </ButtonLink>
      </div>
    </section>
  );
}
