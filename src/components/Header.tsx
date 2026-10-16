import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { ButtonLink } from "./ButtonLink";
import { MobileNav } from "./MobileNav";

export function Header() {
  const site = getSite();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`} className="relative block h-10 w-36">
          <Image src={site.logo} alt="" fill loading="eager" sizes="144px" className="object-contain object-left" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className="flex items-center gap-1 py-5 font-display text-lg font-bold uppercase tracking-wide text-muted transition-colors group-focus-within:text-ink group-hover:text-ink"
              >
                {link.label}
                {link.children && (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </Link>
              {link.children && (
                <div className="invisible absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 translate-y-1 pt-1 opacity-0 transition duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <ul className="overflow-hidden rounded-md border border-line bg-panel p-2 shadow-[0_24px_48px_-16px_rgb(0_0_0/70%)]">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} className="block rounded-sm px-3 py-2.5 transition-colors hover:bg-panel-2 focus-visible:bg-panel-2">
                          <span className="block text-sm font-semibold text-ink">{child.label}</span>
                          {child.description && <span className="mt-0.5 block text-xs text-muted">{child.description}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
        </nav>
        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}
