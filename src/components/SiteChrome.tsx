"use client";

import { usePathname } from "next/navigation";

/** Pages that render without the site header, banner, and footer (the Instagram link page). */
const BARE_PAGES = ["/links"];

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE_PAGES.includes(pathname)) return null;
  return <>{children}</>;
}
