export type Asset = { name: string; browser_download_url: string };
export type Release = { tag_name: string; assets: Asset[] };
export type Platform = "windows" | "macos" | "linux";

type DownloadOption = {
  asset: Asset;
  label: string;
};

function isSignature(asset: Asset) {
  return asset.name.endsWith(".sig");
}

function hasAny(name: string, parts: string[]) {
  return parts.some((part) => name.includes(part));
}

function platformFor(asset: Asset): Platform | null {
  const name = asset.name.toLowerCase();

  if (isSignature(asset)) return null;
  if (
    hasAny(name, [
      "windows",
      "_x64-setup.exe",
      "_arm64-setup.exe",
      "_en-us.msi",
    ])
  ) {
    return "windows";
  }
  if (hasAny(name, ["darwin", "macos", ".dmg"])) return "macos";
  if (hasAny(name, ["linux", ".appimage", ".deb"])) return "linux";

  return null;
}

export function labelForAsset(asset: Asset) {
  const name = asset.name.toLowerCase();
  const arch = hasAny(name, ["arm64", "aarch64"]) ? "ARM64" : "x64";

  if (name.endsWith(".msi")) return `${arch} installer (.msi)`;
  if (name.endsWith("-setup.exe")) return `${arch} setup (.exe)`;
  if (name.endsWith(".appimage")) return `${arch} AppImage`;
  if (name.endsWith(".deb")) return `${arch} deb`;
  if (name.endsWith(".dmg")) return `${arch} dmg`;
  return `${arch} portable`;
}

export function getAssetsForPlatform(
  assets: Asset[],
  platform: Platform
): DownloadOption[] {
  return assets
    .filter((asset) => platformFor(asset) === platform)
    .map((asset) => ({ asset, label: labelForAsset(asset) }));
}

export function getBestDownloadAsset(
  assets: Asset[],
  platform: Platform,
  isArm = false
) {
  const options = getAssetsForPlatform(assets, platform);
  const arch = isArm ? ["arm64", "aarch64"] : ["x64", "amd64"];
  const matchingArch = options.filter(({ asset }) =>
    hasAny(asset.name.toLowerCase(), arch)
  );
  if (isArm && matchingArch.length === 0) return undefined;

  const candidates = matchingArch.length > 0 ? matchingArch : options;

  if (platform === "windows") {
    return (
      candidates.find(({ asset }) => asset.name.endsWith(".msi"))?.asset ??
      candidates.find(({ asset }) => asset.name.endsWith("-setup.exe"))?.asset
    );
  }

  if (platform === "linux") {
    return (
      candidates.find(({ asset }) => asset.name.startsWith("voltius_linux_"))
        ?.asset ??
      candidates.find(({ asset }) => asset.name.endsWith(".AppImage"))?.asset ??
      candidates[0]?.asset
    );
  }

  return (
    candidates.find(({ asset }) => asset.name.startsWith("voltius_darwin_"))
      ?.asset ??
    candidates[0]?.asset
  );
}
