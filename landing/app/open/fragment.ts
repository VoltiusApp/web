// Mirrors the client's `parseDeepLink` https branch (voltius:
// src/services/deepLinkUrl.ts). The two repositories share no package, so the
// split logic is duplicated on purpose; keep them in step when a route is added.
//
// `isSessionId` there is a UUID check; mirrored here so a malformed fragment is
// rejected on the page rather than silently forwarded to a client that will
// drop it and leave the user staring at an unexplained failure.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isSessionId = (value: string): boolean => UUID_RE.test(value);

// Each route validates its own parameters here rather than trusting the app to
// reject a malformed one: an unparseable fragment must skip the hop entirely
// and render the invalid state, not bounce the user out to a scheme URL the
// client silently drops.
const ROUTE_VALIDATORS: Record<string, (params: URLSearchParams) => boolean> = {
  join: (params) => isSessionId(params.get("s") ?? "") && !!params.get("t"),
  verified: (params) => isSessionId(params.get("u") ?? ""),
};

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
  const validate = ROUTE_VALIDATORS[route];
  // The rebuilt URL is assembled from a whitelisted route plus re-serialized
  // parameters, so a hostile fragment cannot inject another scheme or authority.
  if (!validate) return null;

  const params = new URLSearchParams(queryAt === -1 ? "" : body.slice(queryAt + 1));
  if (!validate(params)) return null;

  const query = params.toString();
  const sessionId = params.get("s");
  const token = params.get("t");

  return {
    url: query ? `voltius://${route}?${query}` : `voltius://${route}`,
    code: route === "join" && sessionId && token ? `${sessionId}:${token}` : null,
  };
}
