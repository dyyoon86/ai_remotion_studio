import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin workspace root to silence multi-lockfile warning
  // (parent D:\vsworkspace has its own package-lock.json)
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow remote placeholder thumbnails (Picsum)
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
};

export default nextConfig;
