export type Asset = { name: string; browser_download_url: string };
export type Release = { tag_name: string; assets: Asset[] };
export type Platform = "windows" | "macos" | "linux" | "android";

type DownloadOption = {
  asset: Asset;
  label: string;
};

function isNonInstallableAsset(asset: Asset) {
  return (
    asset.name.endsWith(".sig") ||
    asset.name.endsWith(".sha256") ||
    // .app.tar.gz is the macOS auto-updater bundle, not a user download.
    asset.name.endsWith(".tar.gz")
  );
}

function hasAny(name: string, parts: string[]) {
  return parts.some((part) => name.includes(part));
}

function platformFor(asset: Asset): Platform | null {
  const name = asset.name.toLowerCase();

  if (isNonInstallableAsset(asset)) return null;
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
  if (hasAny(name, ["linux", ".appimage", ".deb", ".rpm"])) return "linux";
  if (name.endsWith(".apk") || name.includes("android")) return "android";

  return null;
}

export function labelForAsset(asset: Asset) {
  const name = asset.name.toLowerCase();
  const arch = hasAny(name, ["arm64", "aarch64"]) ? "ARM64" : "x64";

  if (name.endsWith(".msi")) return `${arch} installer (.msi)`;
  if (name.endsWith("-setup.exe")) return `${arch} setup (.exe)`;
  if (name.endsWith(".appimage")) return `${arch} AppImage`;
  if (name.endsWith(".deb")) return `${arch} deb`;
  if (name.endsWith(".rpm")) return `${arch} rpm`;
  if (name.endsWith(".dmg")) return `${arch} dmg`;
  // Android ships arm64-v8a only; the asset name may lack an arch token.
  if (name.endsWith(".apk")) return "arm64 APK";
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

  // Android ships a single arm64 .apk; its name may carry no arch token, so skip
  // the arch filter below (which would drop it for arm visitors) and serve it.
  if (platform === "android") return options[0]?.asset;

  const arch = isArm ? ["arm64", "aarch64"] : ["x64", "amd64", "x86_64"];
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

  // macOS: prefer the .dmg. The raw voltius_darwin_* binary opens as text when
  // double-clicked in Finder, so it must never be the auto-detected download.
  return (
    candidates.find(({ asset }) => asset.name.endsWith(".dmg"))?.asset ??
    candidates[0]?.asset
  );
}
