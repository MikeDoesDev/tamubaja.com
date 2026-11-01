import Link from "next/link";
import type { Metadata } from "next";
import { SIGN_IN_OPTIONS, signIn, signOut } from "@/auth";
import { ButtonLink } from "@/components/ButtonLink";
import { PersonPlaceholder } from "@/components/PersonPlaceholder";
import { Eyebrow, Section, SectionHeading } from "@/components/Section";
import { LinkedInIcon } from "@/components/SocialLinks";
import { getCar, getSite, getTiers } from "@/lib/content";
import { formatMilestoneDate, teamDate } from "@/lib/milestones";
import { canDownloadResumes, getPortalViewer, noteAppliesTo, resumeTier, type ApprovedViewer, type TierId } from "@/lib/portal";
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
    const resumes = canDownloadResumes(viewer);
    const tiers = getTiers().tiers;
    const tierName = (id: string) => tiers.find((t) => t.id === id)?.name ?? id;
    const isTeam = viewer.kind === "team";
    return (
      <>
        <PortalHeader
          eyebrow={isTeam ? "Sponsor portal · Team view" : `Sponsor portal · ${viewer.company}`}
          title={isTeam ? `Howdy, ${viewer.name.split(" ")[0]}` : `Welcome, ${viewer.company}`}
          intro={
            isTeam
              ? "You're seeing what our sponsors see, plus every tier's dates. Check that your own profile looks right."
              : "Your season dates, your partnership benefits, and the Aggies who design, build, and race car #51."
          }
        >
          <p className="mt-6 text-sm text-muted">
            Signed in as <span className="text-ink">{viewer.email}</span>
          </p>
          <SignOutButton />
        </PortalHeader>

        <Section className="bg-panel/40">
          <div className={`grid gap-10 ${isTeam ? "" : "lg:grid-cols-[1.6fr_1fr]"}`}>
            <div>
              <Eyebrow>{isTeam ? "Season calendar" : "Your season dates"}</Eyebrow>
              <SectionHeading>What&apos;s coming up</SectionHeading>
              <SponsorCalendar viewer={viewer} tierName={tierName} />
            </div>
            {!isTeam && <TierBenefits tier={viewer.tier} />}
          </div>
        </Section>

        <Section>
          <Eyebrow>The team</Eyebrow>
          <SectionHeading>Meet the team</SectionHeading>
          <p className="mt-4 max-w-2xl text-lg text-muted">Every student here chose to share their profile with our sponsors.</p>
          {PORTAL_IS_PLACEHOLDER && (
            <p className="mt-8 rounded-sm border-l-4 border-maroon bg-maroon/25 px-4 py-3 text-sm text-ink/90">
              These are sample profiles for testing. Real member profiles are coming soon.
            </p>
          )}
          {!resumes && (
            <p className="mt-8 rounded-sm border border-line bg-panel px-4 py-3 text-sm text-muted">
              Resume downloads are part of our {tierName(resumeTier())} tier and up.{" "}
              <Link href="/sponsors#tiers" className="font-semibold text-ink underline decoration-accent underline-offset-4">
                See the tiers
              </Link>{" "}
              or email {site.email} to upgrade.
            </p>
          )}
          {members.length ? (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <MemberProfile key={member.id} member={member} resumes={resumes} />
              ))}
            </ul>
          ) : (
            <p className="mt-10 text-muted">Profiles are on their way. Check back soon.</p>
          )}
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
            Interested in sponsoring? Every tier from Bronze up includes the sponsor portal: season dates, your benefits, and our team profiles.
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

function MemberProfile({ member, resumes }: { member: PortalMember; resumes: boolean }) {
  const details = [member.major, member.classYear && `Class of ${member.classYear}`].filter(Boolean).join(" · ");
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative aspect-square bg-[#101214]">
        {member.hasPhoto ? (
          // Served through a signed-in-only route, so it can't go through the public image optimizer.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/sponsor-portal/photo/${encodeURIComponent(member.id)}`} alt={member.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <PersonPlaceholder />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {member.subteam && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{member.subteam}</p>}
        <h3 className="mt-1 font-display text-2xl font-extrabold uppercase leading-tight">{member.name}</h3>
        {details && <p className="mt-1 text-sm text-muted">{details}</p>}
        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {member.hasResume && resumes && (
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

const ymd = (iso: string) => iso.replaceAll("-", "");
const nextDay = (iso: string) => new Date(Date.parse(`${iso}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);

/** An all-day "add to Google Calendar" link. */
function googleCalendarLink(name: string, iso: string, details: string) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: `Texas A&M Baja: ${name}`, dates: `${ymd(iso)}/${ymd(nextDay(iso))}`, details });
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Upcoming season milestones, with the notes meant for this sponsor's tier (team members see all of them). */
function SponsorCalendar({ viewer, tierName }: { viewer: ApprovedViewer; tierName: (id: string) => string }) {
  const today = teamDate(new Date());
  const all = getCar().milestones;
  const upcoming = all.filter((m) => m.date >= today);
  const done = all.length - upcoming.length;
  if (!upcoming.length) return <p className="mt-6 text-muted">The season is wrapped. Next season&apos;s dates are coming soon.</p>;
  return (
    <>
      <p className="mt-4 text-muted">
        {done} of {all.length} milestones done this season. Dates marked tentative can still move.
      </p>
      <ol className="mt-8 divide-y divide-line border-y border-line">
        {upcoming.map((m) => {
          const note = m.sponsorNote && noteAppliesTo(viewer, m.forTiers) ? m.sponsorNote : undefined;
          const forYou = Boolean(note) && viewer.kind === "sponsor";
          const audience = m.forTiers.length ? m.forTiers.map(tierName).join(", ") : "All sponsors";
          return (
            <li key={m.name} className="grid gap-x-6 gap-y-2 py-5 sm:grid-cols-[6.5rem_1fr_auto] sm:items-baseline">
              <time dateTime={m.date} className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">
                {formatMilestoneDate(m.date).replace(/, \d{4}$/, "")}
                {m.tentative && <span className="block text-[10px] tracking-[0.2em] text-muted">Tentative</span>}
              </time>
              <div>
                <p className="font-display text-2xl font-extrabold uppercase leading-tight">
                  {m.name}
                  {forYou && <span className="ml-3 align-middle rounded-sm bg-maroon px-2 py-0.5 font-sans text-[10px] font-semibold tracking-[0.2em] text-white">For you</span>}
                </p>
                {note && (
                  <p className="mt-1 text-sm text-ink/85">
                    {viewer.kind === "team" && <span className="font-semibold text-accent">{audience}: </span>}
                    {note}
                  </p>
                )}
              </div>
              <a
                href={googleCalendarLink(m.name, m.date, note ?? "Texas A&M Baja SAE season milestone")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                Add to calendar<span className="sr-only">: {m.name}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}

/** Everything this sponsor's tier includes (each tier includes the ones below it). */
function TierBenefits({ tier }: { tier: TierId }) {
  const tiers = getTiers().tiers;
  const index = tiers.findIndex((t) => t.id === tier);
  const current = tiers[index];
  if (!current) return null;
  const benefits = tiers.slice(0, index + 1).reverse().flatMap((t) => t.benefits);
  return (
    <aside className="self-start rounded-2xl border border-line border-t-4 bg-panel p-6 sm:p-8" style={{ borderTopColor: current.badgeColor }}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your partnership</p>
      <p className="mt-2 font-display text-4xl font-extrabold uppercase leading-none" style={{ color: current.badgeColor }}>
        {current.name}
      </p>
      <ul className="mt-6 space-y-2 text-sm text-ink/90">
        {benefits.map((benefit) => (
          <li key={benefit}>▸ {benefit}</li>
        ))}
      </ul>
    </aside>
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
