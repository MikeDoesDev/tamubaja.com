import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // 60 is used for full-bleed hero photos that sit under dark overlays.
    qualities: [60, 75],
  },
  // The sponsor portal checks content/sponsor-access.yaml on every request, so ship the content files with it.
  outputFileTracingIncludes: {
    "/sponsor-portal": ["./content/**/*.yaml"],
    "/sponsor-portal/**": ["./content/**/*.yaml"],
  },
  // Give now lives on the Become a Sponsor page; keep old links working.
  async redirects() {
    return [{ source: "/give", destination: "/sponsors#donate", permanent: true }];
  },
};

export default nextConfig;
