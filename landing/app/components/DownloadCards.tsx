"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { getAssetsForPlatform, type Asset, type Platform } from "../lib/downloadAssets";
import { GITHUB_REPO_URL } from "../lib/github";
import { OBTAINIUM_ADD_URL } from "../lib/obtainium";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "../lib/stores";
import CopyCommand from "./CopyCommand";

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
    ext: "Obtainium · Google Play · .apk",
    platform: "android",
    experimental: true,
  },
];

function CommunityInstall({
  label,
  maintainer,
  href,
  command,
}: {
  label: string;
  maintainer: string;
  href: string;
  command: string;
}) {
  return (
    <>
      <p className="text-[11px] text-zinc-500 mt-2.5 mb-1.5 px-1">
        {label} (community-maintained by{" "}
        <a href={href} className="underline hover:text-cyan-400">
          {maintainer}
        </a>
        , not built by our CI):
      </p>
      <CopyCommand command={command} />
    </>
  );
}

type CardId = Platform | "ios";

function StoreBadge({ href, src, alt, width, height, caption }: {
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-zinc-400 hover:bg-white/5 hover:text-cyan-400 transition-colors"
    >
      <Image src={src} alt={alt} width={width} height={height} className="h-9 w-auto shrink-0" />
      <span>{caption}</span>
    </a>
  );
}

// Hover reveals on desktop; touch devices have no hover, so tapping the card
// header toggles the same panel. Both paths drive the panel's open classes.
function Card({ name, icon, ext, experimental, span, open, onToggle, children }: {
  name: string;
  icon: string;
  ext: string;
  experimental: boolean;
  span: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`group relative rounded-2xl border border-border bg-surface transition-all hover:border-zinc-600 hover:bg-[#16161f] focus-within:border-zinc-600 focus-within:bg-[#16161f] ${span}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full relative flex flex-col items-center gap-3 p-6"
      >
        {experimental && (
          <span className="absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Experimental
          </span>
        )}
        <Icon icon={icon} className="text-4xl text-zinc-300" />
        <div>
          <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {name}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">{ext}</p>
        </div>
      </button>

      <div
        className={`overflow-hidden px-3 transition-all duration-500 ease-out group-hover:max-h-[44rem] group-hover:pb-3 group-hover:opacity-100 group-focus-within:max-h-[44rem] group-focus-within:pb-3 group-focus-within:opacity-100 ${
          open ? "max-h-[44rem] pb-3 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function DownloadCards({ assets }: { assets: Asset[] }) {
  const [open, setOpen] = useState<CardId | null>(null);
  const toggle = (id: CardId) => () => setOpen(open === id ? null : id);

  // One 6-col grid so every card is the same width: row 1 = the three desktop
  // platforms (each col-span-2); row 2 = Android + iOS, centered by starting
  // Android at column 2.
  return (
    <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
      {platforms.map((p) => {
        const options = getAssetsForPlatform(assets, p.platform);
        const span =
          p.platform === "android"
            ? "sm:col-span-2 sm:col-start-2"
            : "sm:col-span-2";
        return (
          <Card
            key={p.name}
            name={p.name}
            icon={p.icon}
            ext={p.ext}
            experimental={p.experimental}
            span={span}
            open={open === p.platform}
            onToggle={toggle(p.platform)}
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
                  <CommunityInstall
                    label="Arch — AUR"
                    maintainer="ezhkov"
                    href="https://aur.archlinux.org/account/ezhkov/"
                    command="yay -S voltius-bin"
                  />
                  <CommunityInstall
                    label="Flatpak — FlatPark, x86_64"
                    maintainer="jing2uo"
                    href="https://flatpark.org/apps/app.voltius.Voltius"
                    command="flatpak install https://dl.flatpark.org/app.voltius.Voltius.flatpakref"
                  />
                </div>
              )}
              {p.platform === "macos" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Recommended — Homebrew (auto-updating)
                  </p>
                  <CopyCommand command="brew install --cask voltiusapp/voltius/voltius" />
                  <p className="text-[11px] text-zinc-500 mt-2.5 px-1">
                    Signed and notarized by Apple. After updating from an older
                    version, macOS asks once for access to the keychain.
                  </p>
                </div>
              )}
              {p.platform === "android" && (
                <div className="border-t border-white/5 pt-3 pb-1">
                  <p className="text-[11px] text-zinc-500 mb-1.5 px-1">
                    Recommended — Obtainium (auto-updating)
                  </p>
                  <StoreBadge
                    href={OBTAINIUM_ADD_URL}
                    src="/obtainium-badge.png"
                    alt="Get it on Obtainium"
                    width={646}
                    height={250}
                    caption="Open on your phone — installs every release as it lands"
                  />
                  <p className="text-[11px] text-zinc-500 mt-2.5 mb-1.5 px-1">
                    Or from Google Play
                  </p>
                  <StoreBadge
                    href={GOOGLE_PLAY_URL}
                    src="/google-play-badge.png"
                    alt="Get it on Google Play"
                    width={646}
                    height={250}
                    caption="Updates through the Play Store"
                  />
                  <p className="text-[11px] text-zinc-500 mt-2.5 px-1">
                    Or sideload by hand — enable “Install unknown apps” for your
                    browser, then open the .apk. Updates are manual that way.
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
          </Card>
        );
      })}

      <Card
        name="iOS"
        icon="lineicons:ios"
        ext="App Store · iPhone"
        experimental={false}
        span="sm:col-span-2"
        open={open === "ios"}
        onToggle={toggle("ios")}
      >
        <div className="border-t border-white/5 pt-3 pb-1">
          <StoreBadge
            href={APP_STORE_URL}
            src="/app-store-badge.svg"
            alt="Download on the App Store"
            width={120}
            height={40}
            caption="iOS 16+, updates through the App Store"
          />
          <p className="text-[11px] text-zinc-500 mt-2.5 px-1">
            Not available in France yet: the French encryption declaration is
            still under review.
          </p>
        </div>
      </Card>
    </div>
  );
}
