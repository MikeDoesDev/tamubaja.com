export const NAV_LINKS = [
  { href: "/car", label: "Car" },
  { href: "/team", label: "Team" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/give", label: "Give" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
