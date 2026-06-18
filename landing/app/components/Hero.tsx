"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useFadeIn } from "../hooks/useFadeIn";
import {
  getBestDownloadAsset,
  type Platform,
  type Release,
} from "../lib/downloadAssets";
import { GITHUB_LATEST_RELEASE_API_URL, GITHUB_REPO_URL } from "../lib/github";
import CopyCommand from "./CopyCommand";

const LINUX_INSTALL_CMD = "curl -fsSL https://repo.voltius.app/setup.sh | sudo bash";
const MACOS_INSTALL_CMD = "brew install --cask voltiusapp/voltius/voltius";
const WINDOWS_INSTALL_CMD = "winget install --id Voltius.Voltius -e";

const INSTALL_CMD: Partial<Record<Platform, { label: string; command: string }>> = {
  windows: { label: "Install on Windows — via winget:", command: WINDOWS_INSTALL_CMD },
  macos: { label: "Install on macOS — via Homebrew:", command: MACOS_INSTALL_CMD },
  linux: {
    label: "Install on Linux — signed apt & dnf repo, auto-updating:",
    command: LINUX_INSTALL_CMD,
  },
};

type NavigatorWithUserAgentData = Navigator & {
  userAgentData?: {
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<{
      architecture?: string;
      platform?: string;
    }>;
  };
};

const badges = [
  {
    label: "Built with Rust",
    color: "text-orange-400 border-orange-400/30 bg-orange-400/10",
  },
  { label: "E2EE", color: "text-green-400 border-green-400/30 bg-green-400/10" },
  {
    label: "Cross-platform",
    color: "text-violet-400 border-violet-400/30 bg-violet-400/10",
  },
  { label: "Local-first", color: "text-zinc-300 border-zinc-600 bg-zinc-800/50" },
  {
    label: "Fully open source · AGPLv3",
    color: "text-green-400 border-green-500/30 bg-green-500/10",
    href: GITHUB_REPO_URL,
  },
];

// navigator.platform is "MacIntel" on both Intel and Apple Silicon, so it can't
// tell them apart. UA Client Hints `architecture` is authoritative when present
// (Chromium), but Safari/Firefox don't expose it — there we read the WebGL
// renderer: Apple Silicon GPUs report an "Apple" renderer, Intel/AMD GPUs don't.
// Default to Apple Silicon when the renderer is unavailable (masked / no WebGL).
function macIsAppleSilicon(architecture: string): boolean {
  if (architecture) return /arm|aarch64/.test(architecture);
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return true;
    const renderer = String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
    return /apple/i.test(renderer);
  } catch {
    return true;
  }
}

async function getDevice() {
  const nav = navigator as NavigatorWithUserAgentData;
  const ua = navigator.userAgent.toLowerCase();
  const highEntropy = await nav.userAgentData
    ?.getHighEntropyValues?.(["architecture", "platform"])
    .catch(() => null);
  const platform = (
    highEntropy?.platform ??
    nav.userAgentData?.platform ??
    navigator.platform
  ).toLowerCase();
  const architecture = (highEntropy?.architecture ?? "").toLowerCase();
  const isArm = /arm|aarch64/.test(`${architecture} ${ua} ${platform}`);

  // Android UA is "Linux; Android …", so it must be checked before Linux.
  if (platform.includes("android") || ua.includes("android")) {
    return { platform: "android" as Platform, isArm: true };
  }
  if (platform.includes("win") || ua.includes("windows")) {
    return { platform: "windows" as Platform, isArm };
  }
  if (platform.includes("mac") || ua.includes("mac os")) {
    return { platform: "macos" as Platform, isArm: macIsAppleSilicon(architecture) };
  }
  if (platform.includes("linux") || ua.includes("linux")) {
    return { platform: "linux" as Platform, isArm };
  }

  return null;
}

export default function Hero() {
  const badgesRef = useFadeIn(0);
  const headlineRef = useFadeIn(100);
  const subRef = useFadeIn(200);
  const subMetaRef = useFadeIn(240);
  const ctaRef = useFadeIn(300);
  const demoRef = useFadeIn(420);

  // Detect OS after mount so visitors get their package-manager command up
  // front instead of a raw asset download. SSR/first paint shows the default
  // Download button (no hydration mismatch); the command swaps in once detected.
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => {
    getDevice()
      .then((d) => setPlatform(d?.platform ?? null))
      .catch(() => {});
  }, []);

  async function handleDownloadClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    try {
      const device = await getDevice();
      if (!device) throw new Error("Unsupported platform");

      const res = await fetch(GITHUB_LATEST_RELEASE_API_URL);
      if (!res.ok) throw new Error("Release unavailable");

      const release = (await res.json()) as Release;
      const asset = getBestDownloadAsset(
        release.assets ?? [],
        device.platform,
        device.isArm
      );
      if (!asset) throw new Error("No matching asset");

      window.location.href = asset.browser_download_url;
    } catch {
      window.location.hash = "download";
    }
  }

  return (
    <section className="relative isolate min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none [background-position:0_25px] [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_center,black_24%,transparent_58%)]"
      />

      {/* Ambient glow — two layers for depth */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-50 bg-cyan-400/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div
        ref={badgesRef as React.RefObject<HTMLDivElement>}
        className="fade-in flex flex-col items-center gap-6 mb-8"
      >
        <Image
          src="/logo.png"
          alt="Voltius"
          width={72}
          height={72}
          loading="eager"
          className="shadow-lg shadow-black/40"
        />

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((b) => {
            const cls = `text-xs font-mono px-3 py-1 rounded-full border transition-opacity ${b.color}`;
            return "href" in b ? (
              <a
                key={b.label}
                href={b.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${cls} hover:opacity-80`}
              >
                {b.label}
              </a>
            ) : (
              <span key={b.label} className={cls}>
                {b.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Headline */}
      <h1
        ref={headlineRef as React.RefObject<HTMLHeadingElement>}
        className="fade-in text-5xl md:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]"
      >
        Fast by design.{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
          Private by default.
        </span>
      </h1>

      <p
        ref={subRef as React.RefObject<HTMLParagraphElement>}
        className="fade-in mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed"
      >
        Blazing fast, local-first, Zero-Knowledge SSH & SFTP client.
      </p>
      <p
        ref={subMetaRef as React.RefObject<HTMLParagraphElement>}
        className="fade-in mt-2 text-sm text-zinc-500 max-w-xl"
      >
        Free • Open Source • No Account Required
      </p>

      {/* CTAs */}
      <div
        ref={ctaRef as React.RefObject<HTMLDivElement>}
        className="fade-in mt-10 flex flex-col items-center gap-3 w-full"
      >
        {platform && INSTALL_CMD[platform] ? (
          <>
            <p className="text-sm text-zinc-400">{INSTALL_CMD[platform]!.label}</p>
            <CopyCommand command={INSTALL_CMD[platform]!.command} />
            <div className="flex flex-col sm:flex-row gap-4 items-center mt-1">
              <a
                href="#download"
                className="px-5 py-2.5 rounded-xl border border-[#1e1e2e] bg-surface hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-all duration-200"
              >
                Other downloads ↓
              </a>
              <a
                href="#demo"
                className="px-5 py-2.5 rounded-xl border border-[#1e1e2e] bg-surface hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-all duration-200"
              >
                See it in action ↓
              </a>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="#download"
              onClick={handleDownloadClick}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-200 shadow-[0_0_0_0_rgba(6,182,212,0)] hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]"
            >
              Download
            </a>
            <a
              href="#demo"
              className="px-6 py-3 rounded-xl border border-[#1e1e2e] bg-surface hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-all duration-200"
            >
              See it in action ↓
            </a>
          </div>
        )}
      </div>

      {/* Demo GIF */}
      <div
        ref={demoRef as React.RefObject<HTMLDivElement>}
        id="demo"
        className="fade-in mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border border-border ring-1 ring-cyan-400/20 shadow-[0_0_60px_rgba(34,211,238,0.22),0_28px_70px_rgba(0,0,0,0.65)]"
      >
        <div className="bg-[#0d0d12] aspect-video">
          <video
            src="https://pub-8ed71dde1bad496f9df2b3f5a84b69df.r2.dev/demo.mp4"
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
        </div>
      </div>
    </section>
  );
}
