import type { Site } from "@/lib/schemas";

type Social = { key: string; label: string; href: string; icon: React.ReactNode };

const svgProps = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: false } as const;

const InstagramIcon = (
  <svg {...svgProps} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
    <circle cx="12" cy="12" r="4.25" />
    <circle cx="17.6" cy="6.4" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const LinkedInIcon = (
  <svg {...svgProps} fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

/** A black pill of social icons that turn their brand color on hover, with a tooltip above. */
export function SocialLinks({ site, align = "center" }: { site: Site; align?: "center" | "start" }) {
  const socials: Social[] = [
    { key: "instagram", label: "Instagram", href: site.socials.instagram, icon: InstagramIcon },
    ...(site.socials.linkedin ? [{ key: "linkedin", label: "LinkedIn", href: site.socials.linkedin, icon: LinkedInIcon }] : []),
  ];

  return (
    <div className={`social-links${align === "start" ? " social-links--start" : ""}`}>
      <ul className="social-links__pill">
      {socials.map((social) => {
        const external = !social.href.startsWith("mailto:");
        return (
          <li key={social.key} className="social-links__item">
            <a
              href={social.href}
              data-social={social.key}
              aria-label={social.label}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {social.icon}
            </a>
            <span className="social-links__tooltip" aria-hidden="true">
              {social.label}
            </span>
          </li>
        );
      })}
      </ul>
    </div>
  );
}
