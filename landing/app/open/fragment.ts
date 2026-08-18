// Mirrors the client's `parseDeepLink` https branch (voltius:
// src/services/deepLinkUrl.ts). The two repositories share no package, so the
// split logic is duplicated on purpose; keep them in step when a route is added.
const ROUTES = new Set(["join", "verified"]);

export type Target = {
  /** The scheme URL to hand to the OS. */
  url: string;
  /** `sessionId:token` for a join link, so an older client can still paste it. */
  code: string | null;
};

export function readFragment(hash: string): Target | null {
  const body = hash.replace(/^#/, "");
  if (!body) return null;

  const queryAt = body.indexOf("?");
  const route = queryAt === -1 ? body : body.slice(0, queryAt);
  // The rebuilt URL is assembled from a whitelisted route plus re-serialized
  // parameters, so a hostile fragment cannot inject another scheme or authority.
  if (!ROUTES.has(route)) return null;

  const params = new URLSearchParams(queryAt === -1 ? "" : body.slice(queryAt + 1));
  const query = params.toString();
  const sessionId = params.get("s");
  const token = params.get("t");

  return {
    url: query ? `voltius://${route}?${query}` : `voltius://${route}`,
    code: route === "join" && sessionId && token ? `${sessionId}:${token}` : null,
  };
}
