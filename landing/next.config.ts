import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
