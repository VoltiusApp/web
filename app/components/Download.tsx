import { Icon } from "@iconify/react";

const GITHUB_REPO = "Voltius/voltius";

type Asset = { name: string; browser_download_url: string };
type Release = { tag_name: string; assets: Asset[] };

async function getLatestRelease(): Promise<Release | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
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
  },
  {
    name: "macOS",
    icon: "wpf:macos",
    ext: ".dmg",
    match: (assets: Asset[]) => findAsset(assets, ".dmg"),
  },
  {
    name: "Linux",
    icon: "devicon:linux",
    ext: ".AppImage / .deb",
    match: (assets: Asset[]) => findAsset(assets, ".AppImage", ".deb"),
  },
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
                href={asset?.browser_download_url ?? `https://github.com/${GITHUB_REPO}/releases/latest`}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-surface hover:border-zinc-600 hover:bg-[#16161f] transition-all group"
              >
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

        <p className="mt-8 text-xs text-zinc-600 font-mono">
          {version} · AGPLv3 ·{" "}
          <a
            href={`https://github.com/${GITHUB_REPO}`}
            className="hover:text-zinc-400 transition-colors"
          >
            View on GitHub ↗
          </a>
        </p>
      </div>
    </section>
  );
}
