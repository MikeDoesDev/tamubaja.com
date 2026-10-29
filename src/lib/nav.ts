export interface NavLink {
  href: string;
  label: string;
  /** Shown in the header dropdown and indented in the mobile menu. */
  children?: { href: string; label: string; description?: string }[];
}

export const NAV_LINKS: NavLink[] = [
  {
    href: "/car",
    label: "Car",
    children: [
      { href: "/car#now", label: "Where we are now", description: "This season's build and what's next" },
      { href: "/car#process", label: "How we build it", description: "Design, review, build, test, compete" },
      { href: "/car#history", label: "Past cars and results", description: "Every car since 2018" },
    ],
  },
  {
    href: "/team",
    label: "Team",
    children: [
      { href: "/team#leadership", label: "Leadership", description: "Who runs the program" },
      { href: "/team#subteams", label: "Subteams", description: "Chassis to business, and who's on each" },
      { href: "/team/directory", label: "Student directory", description: "Search every student by major and year" },
    ],
  },
  {
    href: "/sponsors",
    label: "Partners",
    children: [
      { href: "/sponsors", label: "Partner with us", description: "Why sponsor, and how to start" },
      { href: "/partners", label: "Our partners", description: "The companies behind car #51" },
      { href: "/sponsors#tiers", label: "Sponsorship tiers", description: "What each level includes" },
      { href: "/sponsors#donate", label: "Donate", description: "Give as an individual or alum" },
    ],
  },
  {
    href: "/development",
    label: "Development",
    children: [
      { href: "/development#sae", label: "SAE program", description: "Sessions running this semester" },
      { href: "/development", label: "The program", description: "From first meeting to the car" },
      { href: "/development#join", label: "Join the team", description: "Open to every major and year" },
    ],
  },
];
