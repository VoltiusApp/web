import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@voltius/crypto-wasm"],
  turbopack: {},
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
