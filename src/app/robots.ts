import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/sponsor-portal", "/api/"] },
    sitemap: `${getSite().url}/sitemap.xml`,
  };
}
