"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { NavLink } from "@/lib/nav";

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen((value) => !value)}
        className="rounded-sm border border-line px-3 py-2 font-display text-sm font-bold uppercase"
      >
        {open ? "Close" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="absolute inset-x-0 top-16 border-b border-line bg-bg px-4 pb-6 pt-2">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block border-b border-line py-4 font-display text-2xl font-bold uppercase"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/sponsors#inquire"
            onClick={close}
            className="mt-6 block rounded-sm bg-accent px-5 py-3 text-center font-display text-lg font-bold uppercase text-bg"
          >
            Become a Sponsor
          </Link>
        </nav>
      )}
    </div>
  );
}
