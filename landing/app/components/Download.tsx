import { Icon } from "@iconify/react";
import {
  GITHUB_LATEST_RELEASE_API_URL,
  GITHUB_REPO_URL,
} from "../lib/github";
import { getAssetsForPlatform, type Release } from "../lib/downloadAssets";
import CopyCommand from "./CopyCommand";
import MobileWaitlistForm from "./MobileWaitlistForm";

async function getLatestRelease(): Promise<Release | null> {
  try {
    const res = await fetch(
      GITHUB_LATEST_RELEASE_API_URL,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) return null;

    return res.json();
  } catch {
    return null;
  }
}

const platforms = [
  {
    name: "Windows",
    icon: "devicon:windows11",
    ext: ".msi / setup.exe",
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
] as const;

const mobilePlatforms = [
  { name: "iOS", icon: "lineicons:ios", platform: "ios" },
] as const;

export default async function Download() {
  const release = await getLatestRelease();
  const version = release?.tag_name ?? "latest";
  const assets = release?.assets ?? [];

  return (
    <section id="download" className="py-28 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-cyan-400 text-sm font-mono mb-3">— download</p>
        <h2 className="text-4xl font-bold text-white">Get Voltius</h2>
        <p className="mt-4 text-zinc-400">
          Free forever. No account needed. Single binary, auto-updates included.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map((p) => {
            const options = getAssetsForPlatform(assets, p.platform);
            return (
              <div
                key={p.name}
                className="group relative rounded-2xl border border-border bg-surface transition-all hover:border-zinc-600 hover:bg-[#16161f] focus-within:border-zinc-600 focus-within:bg-[#16161f]"
              >
                <div className="relative flex flex-col items-center gap-3 p-6">
                  {p.experimental && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      Experimental
                    </span>
                  )}
                  <Icon
                    icon={p.icon}
                    className="text-4xl text-zinc-300 group-hover:text-cyan-400 transition-colors"
                  />
                  <div>
                    <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">{p.ext}</p>
                  </div>
                </div>

                <div className="max-h-0 overflow-hidden px-3 opacity-0 transition-all duration-300 group-hover:max-h-96 group-hover:pb-3 group-hover:opacity-100 group-focus-within:max-h-96 group-focus-within:pb-3 group-focus-within:opacity-100">
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
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 max-w-sm mx-auto">
          {mobilePlatforms.map((p) => (
            <MobileWaitlistForm
              key={p.name}
              name={p.name}
              icon={p.icon}
              platform={p.platform}
            />
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-600 font-mono">
          {version} · AGPLv3 ·{" "}
          <a
            href={GITHUB_REPO_URL}
            className="hover:text-zinc-400 transition-colors"
          >
            View on GitHub ↗
          </a>
        </p>
      </div>
    </section>
  );
}
