import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // 60 is used for full-bleed hero photos that sit under dark overlays.
    qualities: [60, 75],
  },
};

export default nextConfig;
