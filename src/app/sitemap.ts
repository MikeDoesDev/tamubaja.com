import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

const PAGES = [
  { path: "", priority: 1 },
  { path: "/sponsors", priority: 0.9 },
  { path: "/partners", priority: 0.8 },
  { path: "/car", priority: 0.7 },
  { path: "/team", priority: 0.7 },
  { path: "/development", priority: 0.6 },
  { path: "/give", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSite().url;
  return PAGES.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: page.priority,
  }));
}
