import type { AuthResponse } from "./api";

export function storeSession(auth: AuthResponse) {
  sessionStorage.setItem("access_token", auth.jwt_token);
  sessionStorage.setItem("refresh_token", auth.refresh_token);
  sessionStorage.setItem("tier", auth.tier);
  if (auth.trial_ends_at) sessionStorage.setItem("trial_ends_at", String(auth.trial_ends_at));
}

/** Only same-site paths, so a crafted `?return=` cannot send a fresh session elsewhere. */
export function safeReturnPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return null;
  return raw;
}

export interface AccountNotice {
  tone: "success" | "warning";
  text: string;
}

const NOTICE_KEY = "account_notice";

export function setAccountNotice(notice: AccountNotice) {
  sessionStorage.setItem(NOTICE_KEY, JSON.stringify(notice));
}

export function peekAccountNotice(): AccountNotice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NOTICE_KEY);
    return raw ? (JSON.parse(raw) as AccountNotice) : null;
  } catch {
    return null;
  }
}

export function clearAccountNotice() {
  sessionStorage.removeItem(NOTICE_KEY);
}
