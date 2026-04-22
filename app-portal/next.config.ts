import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for wasm-bindgen output
  webpack(config) {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
