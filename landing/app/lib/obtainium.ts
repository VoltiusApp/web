import { GITHUB_OWNER, GITHUB_REPO_URL } from "./github";

export const ANDROID_APPLICATION_ID = "com.voltius.app";

const OBTAINIUM_APP_CONFIG = {
  id: ANDROID_APPLICATION_ID,
  url: GITHUB_REPO_URL,
  author: GITHUB_OWNER,
  name: "Voltius",
};

// The apps.obtainium redirect falls back to a "get Obtainium" page when the
// scheme has no handler, so the link still works on desktop.
export const OBTAINIUM_ADD_URL = `https://apps.obtainium.imranr.dev/redirect?r=obtainium://app/${encodeURIComponent(
  JSON.stringify(OBTAINIUM_APP_CONFIG)
)}`;
