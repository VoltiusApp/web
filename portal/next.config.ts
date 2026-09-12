import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  transpilePackages: ["@voltius/crypto-wasm"],
  // See landing/next.config.ts: the shared plan catalogue sits outside this app.
  turbopack: {
    root: path.join(__dirname, ".."),
    resolveAlias: { "@shared": path.join(__dirname, "..", "shared") },
  },
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
