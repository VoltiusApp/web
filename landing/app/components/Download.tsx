import {
  GITHUB_LATEST_RELEASE_API_URL,
  GITHUB_REPO_URL,
} from "../lib/github";
import { type Release } from "../lib/downloadAssets";
import DownloadCards from "./DownloadCards";
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

        <div className="mt-12">
          <DownloadCards assets={assets} />
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
