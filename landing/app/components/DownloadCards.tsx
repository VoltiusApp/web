"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { getAssetsForPlatform, type Asset, type Platform } from "../lib/downloadAssets";
import { GITHUB_REPO_URL } from "../lib/github";
import CopyCommand from "./CopyCommand";
import MobileWaitlistForm from "./MobileWaitlistForm";

type PlatformCard = {
  name: string;
  icon: string;
  ext: string;
  platform: Platform;
  experimental: boolean;
};

const platforms: readonly PlatformCard[] = [
  {
    name: "Windows",
    icon: "devicon:windows11",
    ext: "winget · .msi / setup.exe",
    platform: "windows",
    experimental: false,
  },
  {
    name: "macOS",
    icon: "wpf:macos",
    ext: "Apple Silicon",
    platform: "macos",
    experimental: true,
  },
  {
    name: "Linux",
    icon: "devicon:linux",
    ext: "apt / dnf · .deb / .rpm",
    platform: "linux",
    experimental: false,
  },
  {
    name: "Android",
    icon: "material-symbols:android",
    ext: "arm64 · sideload .apk",
    platform: "android",
    experimental: true,
  },
];

export default function DownloadCards({ assets }: { assets: Asset[] }) {
  // Hover reveals on desktop; touch devices have no hover, so tapping the card
  // header toggles the same panel. Both paths drive the panel's open classes.
  const [open, setOpen] = useState<Platform | null>(null);

  // One 6-col grid so every card is the same width: row 1 = the three desktop
  // platforms (each col-span-2); row 2 = Android + iOS, centered by starting
  // Android at column 2.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
      {platforms.map((p) => {
        const options = getAssetsForPlatform(assets, p.platform);
        const isOpen = open === p.platform;
        const span =
          p.platform === "android"
            ? "sm:col-span-2 sm:col-start-2"
            : "sm:col-span-2";
        return (
          <div
            key={p.name}
            className={`group relative rounded-2xl border border-border bg-surface transition-all hover:border-zinc-600 hover:bg-[#16161f] focus-within:border-zinc-600 focus-within:bg-[#16161f] ${span}`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : p.platform)}
              aria-expanded={isOpen}
              className="w-full relative flex flex-col items-center gap-3 p-6"
            >
              {p.experimental && (
                <span className="absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  Experimental
                </span>
              )}
              <Icon icon={p.icon} className="text-4xl text-zinc-300" />
              <div>
                <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {p.name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">{p.ext}</p>
              </div>
            </button>

            <div
              className={`overflow-hidden px-3 transition-all duration-500 ease-out group-hover:max-h-[34rem] group-hover:pb-3 group-hover:opacity-100 group-focus-within:max-h-[34rem] group-focus-within:pb-3 group-focus-within:opacity-100 ${
                isOpen ? "max-h-[34rem] pb-3 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {p.platform === "windows" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Recommended — winget (auto-updating)
                  </p>
                  <CopyCommand command="winget install --id Voltius.Voltius -e" />
                </div>
              )}
              {p.platform === "linux" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Recommended — apt / dnf (auto-updating)
                  </p>
                  <CopyCommand command="curl -fsSL https://repo.voltius.app/setup.sh | sudo bash" />
                </div>
              )}
              {p.platform === "macos" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Recommended — Homebrew (unsigned, skips Gatekeeper):
                  </p>
                  <CopyCommand command="brew install --cask --no-quarantine voltiusapp/voltius/voltius" />
                </div>
              )}
              {p.platform === "android" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Sideload — enable “Install unknown apps” for your browser,
                    then open the .apk. No auto-updates yet.
                  </p>
                </div>
              )}
              <div className="space-y-1 border-t border-white/5 pt-3">
                {options.length > 0 ? (
                  options.map(({ asset, label }) => (
                    <a
                      key={asset.name}
                      href={asset.browser_download_url}
                      className="block rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-cyan-400 transition-colors"
                    >
                      {label}
                    </a>
                  ))
                ) : (
                  <a
                    href={GITHUB_REPO_URL}
                    className="block rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors"
                  >
                    View release assets
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <MobileWaitlistForm
        name="iOS"
        icon="lineicons:ios"
        platform="ios"
        className="sm:col-span-2"
      />
    </div>
  );
}
