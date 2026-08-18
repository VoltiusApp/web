import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        // /open assigns location.href on mount with no user gesture; framing
        // protection stops a third-party page from iframing it to trigger an
        // unprompted scheme launch.
        source: "/open",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
