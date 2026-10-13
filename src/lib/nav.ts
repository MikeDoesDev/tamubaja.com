export const NAV_LINKS = [
  { href: "/car", label: "Car" },
  { href: "/team", label: "Team" },
  { href: "/partners", label: "Partners" },
  { href: "/development", label: "Development" },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];
