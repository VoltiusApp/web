import { Icon } from "@iconify/react";
import {
  GITHUB_LATEST_RELEASE_API_URL,
  GITHUB_REPO_URL,
} from "../lib/github";

type Asset = { name: string; browser_download_url: string };
type Release = { tag_name: string; assets: Asset[] };

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

function findAsset(assets: Asset[], ...exts: string[]) {
  return assets.find((a) => exts.some((ext) => a.name.endsWith(ext)));
}

const platforms = [
  {
    name: "Windows",
    icon: "devicon:windows11",
    ext: ".msi",
    match: (assets: Asset[]) => findAsset(assets, ".msi", "_x64-setup.exe"),
    experimental: false,
  },
  {
    name: "macOS",
    icon: "wpf:macos",
    ext: ".dmg",
    match: (assets: Asset[]) => findAsset(assets, ".dmg"),
    experimental: true,
  },
  {
    name: "Linux",
    icon: "devicon:linux",
    ext: ".AppImage / .deb",
    match: (assets: Asset[]) => findAsset(assets, ".AppImage", ".deb"),
    experimental: false,
  },
];

const comingSoon = [
  { name: "Android", icon: "devicon:android" },
  { name: "iOS", icon: "cib:apple" },
];

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

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {platforms.map((p) => {
            const asset = p.match(assets);
            return (
              <a
                key={p.name}
                href={asset?.browser_download_url ?? GITHUB_REPO_URL}
                className="relative flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-surface hover:border-zinc-600 hover:bg-[#16161f] transition-all group"
              >
                {p.experimental && (
                  <span className="absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Experimental
                  </span>
                )}
                <Icon icon={p.icon} className="text-4xl text-zinc-300 group-hover:text-cyan-400 transition-colors" />
                <div>
                  <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.ext}</p>
                </div>
              </a>
            );
          })}
        </div>

        <details className="mt-4 text-left max-w-sm mx-auto group">
          <summary className="text-xs text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors list-none flex items-center gap-1 justify-center">
            <span className="text-amber-500">⚠</span> macOS setup note
          </summary>
          <div className="mt-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-left">
            <p className="text-xs text-zinc-400 mb-2">
              The app is unsigned. macOS will quarantine it — run this once after installing:
            </p>
            <code className="block text-xs font-mono text-amber-300 bg-[#0a0a0f] px-3 py-2 rounded-lg">
              xattr -d com.apple.quarantine /Applications/Voltius.app
            </code>
          </div>
        </details>

        <div className="mt-6 grid grid-cols-2 gap-4 max-w-xs mx-auto">
          {comingSoon.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-surface opacity-50 cursor-default select-none"
            >
              <Icon icon={p.icon} className="text-4xl text-zinc-500" />
              <div>
                <p className="font-semibold text-zinc-500">{p.name}</p>
                <p className="text-xs text-zinc-600 mt-0.5">Coming soon</p>
              </div>
            </div>
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
