const DEFAULT_API_URL = "https://api.voltius.app";

export const BUILD_TIME_API_URL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

export function trimApiUrl(url: string): string {
  return url.replace(/\/+$/, "");
}
