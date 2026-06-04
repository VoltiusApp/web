import { ImageResponse } from "next/og";
import { SITE_NAME } from "./lib/site";

export const alt = "Voltius - Local-first SSH, SFTP, and serial client";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0a0a0f",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: 72,
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "radial-gradient(circle, rgba(34,211,238,0.28), transparent 62%)",
            height: 680,
            left: 260,
            position: "absolute",
            top: -120,
            width: 680,
          }}
        />
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 36,
            display: "flex",
            flexDirection: "column",
            gap: 34,
            padding: 56,
            position: "relative",
            width: "100%",
          }}
        >
          <div style={{ color: "#67e8f9", display: "flex", fontSize: 28, letterSpacing: 4 }}>
            {SITE_NAME.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ fontSize: 78, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
              Local-first SSH & SFTP client
            </div>
            <div style={{ color: "#a1a1aa", fontSize: 32, lineHeight: 1.35, maxWidth: 850 }}>
              Fast infrastructure workflows with encrypted sync, SFTP, serial sessions, Docker,
              plugins, and no account required.
            </div>
          </div>
          <div style={{ color: "#22d3ee", display: "flex", fontSize: 26 }}>
            voltius.app
          </div>
        </div>
      </div>
    ),
    size
  );
}
