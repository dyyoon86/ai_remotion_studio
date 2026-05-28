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
  // Keep heavy server-only packages out of Turbopack's module graph.
  // @remotion/bundler pulls in esbuild + README.md files that Turbopack
  // can't parse, and @remotion/renderer spawns native chromium/encoders.
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/compositor-win32-x64-msvc",
    "@remotion/compositor-linux-x64-gnu",
    "@remotion/compositor-darwin-x64",
    "@remotion/compositor-darwin-arm64",
    "esbuild",
  ],
};

export default nextConfig;
