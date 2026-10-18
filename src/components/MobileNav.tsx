"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavLink } from "@/lib/nav";

/**
 * Phone menu: a full-screen sheet under the header. Each section is a big tap target that goes to
 * the page; the chevron beside it opens that section's sub-links. The page behind doesn't scroll.
 */
export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? "mobile-menu" : undefined}
        aria-label={open ? "Close" : "Menu"}
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-panel/70"
      >
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <span className={`absolute left-0 h-0.5 w-5 rounded-full bg-ink transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
          <span className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-ink transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 h-0.5 w-5 rounded-full bg-ink transition ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
        </span>
      </button>

      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="topo-bg fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col overflow-y-auto overscroll-contain border-t border-line bg-bg"
        >
          <ul className="flex-1 px-4 pt-4">
            {links.map((link) => {
              const isOpen = expanded === link.href;
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href} className="border-b border-line">
                  <div className="flex items-center">
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className={`flex-1 py-4 font-display text-3xl font-extrabold uppercase leading-none ${active ? "text-accent" : ""}`}
                    >
                      {link.label}
                    </Link>
                    {link.children && (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? "Hide" : "Show"} ${link.label} pages`}
                        onClick={() => setExpanded(isOpen ? null : link.href)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-line"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className={`h-5 w-5 text-accent transition-transform ${isOpen ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {link.children && isOpen && (
                    <ul className="mb-4 grid gap-2">
                      {link.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={close}
                            className="flex items-center justify-between rounded-xl border border-line bg-panel/80 px-4 py-3"
                          >
                            <span>
                              <span className="block font-semibold">{child.label}</span>
                              {child.description && <span className="block text-xs text-muted">{child.description}</span>}
                            </span>
                            <span aria-hidden="true" className="text-accent">
                              →
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 border-t border-line bg-bg/95 px-4 pb-6 pt-4 backdrop-blur">
            <Link
              href="/sponsors#inquire"
              onClick={close}
              className="block rounded-sm bg-accent px-5 py-3.5 text-center font-display text-lg font-bold uppercase text-bg"
            >
              Become a Sponsor
            </Link>
            <Link href="/development#join" onClick={close} className="mt-3 block text-center text-sm font-semibold text-muted">
              Want to join the team? <span className="text-ink underline decoration-accent underline-offset-4">Apply here</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
