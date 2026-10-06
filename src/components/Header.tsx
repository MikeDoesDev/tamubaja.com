import Image from "next/image";
import Link from "next/link";
import { getSite } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { ButtonLink } from "./ButtonLink";
import { MobileNav } from "./MobileNav";

export function Header() {
  const site = getSite();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${site.name} home`} className="relative block h-10 w-36">
          <Image src={site.logo} alt="" fill preload sizes="144px" className="object-contain object-left" />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-lg font-bold uppercase tracking-wide text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <ButtonLink href="/sponsors#inquire">Become a Sponsor</ButtonLink>
        </nav>
        <MobileNav links={NAV_LINKS} />
      </div>
    </header>
  );
}
