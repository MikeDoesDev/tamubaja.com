import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SIGN_IN_OPTIONS, signIn, signOut } from "@/auth";
import { ButtonLink } from "@/components/ButtonLink";
import { PersonPlaceholder } from "@/components/PersonPlaceholder";
import { Eyebrow, Section } from "@/components/Section";
import { LinkedInIcon } from "@/components/SocialLinks";
import { getSite } from "@/lib/content";
import { getPortalViewer } from "@/lib/portal";
import { PORTAL_IS_PLACEHOLDER, getPortalMembers, type PortalMember } from "@/lib/portalMembers";

export const metadata: Metadata = {
  title: "Sponsor portal",
  description: "Private recruiting page for Texas A&M Baja SAE sponsors.",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: "That sign-in was cancelled or blocked. Try again, or use the other option.",
  Configuration: "Sign-in hit a setup problem on our end. Please email us and we'll get you in.",
};

async function startSignIn(formData: FormData) {
  "use server";
  const provider = String(formData.get("provider"));
  if (!SIGN_IN_OPTIONS.some((option) => option.id === provider)) return;
  await signIn(provider, { redirectTo: "/sponsor-portal" });
}

async function endSession() {
  "use server";
  await signOut({ redirectTo: "/sponsor-portal" });
}

export default async function SponsorPortalPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const site = getSite();
  const viewer = await getPortalViewer();
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong signing you in. Please try again.") : null;

  if (viewer.state === "approved") {
    const members = await getPortalMembers();
    return (
      <>
        <PortalHeader
          eyebrow={`Sponsor portal · ${viewer.company}`}
          title="Meet the team"
          intro="The Aggies who design, build, and race car #51. Every student here chose to share their profile with our sponsors."
        >
          <p className="mt-6 text-sm text-muted">
            Signed in as <span className="text-ink">{viewer.email}</span>
          </p>
          <SignOutButton />
        </PortalHeader>
        <Section>
          {PORTAL_IS_PLACEHOLDER && (
            <p className="mb-8 rounded-sm border-l-4 border-maroon bg-maroon/25 px-4 py-3 text-sm text-ink/90">
              These are sample profiles for testing. Real member profiles are coming soon.
            </p>
          )}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberProfile key={member.id} member={member} />
            ))}
          </ul>
          <p className="mt-10 text-sm text-muted">
            Want to meet someone in person or come recruit at a team meeting? Email{" "}
            <a href={`mailto:${site.email}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
              {site.email}
            </a>
            .
          </p>
        </Section>
      </>
    );
  }

  if (viewer.state === "not-approved" || viewer.state === "unverified") {
    return (
      <PortalHeader eyebrow="Sponsor portal" title="This page is for Texas A&M Baja sponsors">
        <div className="mt-6 max-w-2xl space-y-4 text-lg text-muted">
          {viewer.state === "not-approved" ? (
            <p>
              You&apos;re signed in as <span className="text-ink">{viewer.email}</span>, which isn&apos;t on our sponsor list yet. If your
              company sponsors the team, email us and we&apos;ll add you.
            </p>
          ) : (
            <p>
              We couldn&apos;t confirm the email address on that account{viewer.email ? ` (${viewer.email})` : ""}. Try signing in a
              different way, or email us and we&apos;ll sort it out.
            </p>
          )}
          <p>
            Interested in sponsoring? Bronze tier and up includes access to our team profiles and resumes.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href={`mailto:${site.email}`}>
            Email {site.email}
          </ButtonLink>
          <ButtonLink href="/sponsors#tiers" variant="secondary">
            See the tiers
          </ButtonLink>
        </div>
        <SignOutButton label="Sign in with a different account" />
      </PortalHeader>
    );
  }

  return (
    <PortalHeader
      eyebrow="Sponsor portal"
      title="Sponsor login"
      intro="Sign in with your company email to meet our team and download member resumes. Access is for sponsors at Bronze tier and up."
    >
      {viewer.state === "not-configured" ? (
        <p className="mt-8 max-w-xl rounded-sm border border-line bg-panel p-6 text-muted">
          Sponsor sign-in isn&apos;t switched on yet. In the meantime, email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-ink underline decoration-accent underline-offset-4">
            {site.email}
          </a>{" "}
          and we&apos;ll send you our resume book.
        </p>
      ) : (
        <div className="mt-8 max-w-md rounded-2xl border border-line border-t-4 border-t-maroon bg-panel p-6 sm:p-8">
          {errorMessage && (
            <p role="alert" className="mb-5 rounded-sm border-l-4 border-maroon bg-maroon/25 px-3 py-2 text-sm text-ink/90">
              {errorMessage}
            </p>
          )}
          <div className="grid gap-3">
            {SIGN_IN_OPTIONS.map((option) => (
              <form key={option.id} action={startSignIn}>
                <input type="hidden" name="provider" value={option.id} />
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-3 rounded-sm border border-ink/40 px-5 py-3 font-display text-lg font-bold uppercase tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink/10"
                >
                  <span className="h-5 w-5">{option.id === "google" ? GoogleMark : MicrosoftMark}</span>
                  {option.label}
                </button>
              </form>
            ))}
          </div>
          <p className="mt-5 text-sm text-muted">
            Not a sponsor yet?{" "}
            <Link href="/sponsors#inquire" className="font-semibold text-ink underline decoration-accent underline-offset-4">
              Start a partnership
            </Link>{" "}
            or email {site.email}.
          </p>
        </div>
      )}
    </PortalHeader>
  );
}

function PortalHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="topo-bg border-b border-line">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.9] sm:text-7xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-lg text-muted">{intro}</p>}
        {children}
      </div>
    </section>
  );
}

function SignOutButton({ label = "Sign out" }: { label?: string }) {
  return (
    <form action={endSession} className="mt-4">
      <button type="submit" className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
        {label}
      </button>
    </form>
  );
}

function MemberProfile({ member }: { member: PortalMember }) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative aspect-square bg-[#101214]">
        {member.photo ? (
          <Image src={member.photo} alt={member.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
        ) : (
          <PersonPlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {member.subteam && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{member.subteam}</p>}
        <h2 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{member.name}</h2>
        <p className="mt-1 text-sm text-muted">
          {member.major} · Class of {member.classYear}
        </p>
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {member.hasResume && (
            <a
              href={`/sponsor-portal/resume/${encodeURIComponent(member.id)}`}
              className="inline-flex items-center justify-center rounded-sm bg-accent px-4 py-2 font-display text-base font-bold uppercase tracking-wide text-bg transition-colors hover:bg-ink"
            >
              Download resume
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-ink/40 px-4 py-2 font-display text-base font-bold uppercase tracking-wide text-ink transition-colors hover:border-ink hover:bg-ink/10"
            >
              <span className="h-4 w-4">{LinkedInIcon}</span>
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

const GoogleMark = (
  <svg viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);

const MicrosoftMark = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
    <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
    <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
    <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
  </svg>
);
