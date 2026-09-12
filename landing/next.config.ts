import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The plan catalogue lives above this app so both web apps share one copy.
  // Turbopack needs the workspace root widened and the alias spelled out;
  // tsconfig paths alone resolve for tsc but not for the bundler.
  turbopack: {
    root: path.join(__dirname, ".."),
    resolveAlias: { "@shared": path.join(__dirname, "..", "shared") },
  },
  async redirects() {
    return [
      // The in-app updater and the README send users to /download; the download
      // section lives on the home page. Temporary so a future real page isn't
      // shadowed by a cached 308.
      { source: "/download", destination: "/#download", permanent: false },
    ];
  },
};

export default nextConfig;
