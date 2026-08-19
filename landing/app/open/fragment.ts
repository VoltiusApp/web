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
// Mirrors `SETTINGS_SECTIONS` in voltius (src/stores/uiStore.ts). A section the
// app cannot render must fail here rather than open an empty modal.
const SETTINGS_SECTIONS = new Set([
  "appearance", "account", "sync", "vaults", "plugins", "integrations", "terminal",
  "sftp", "portForwarding", "hosts", "shortcuts", "diagnostics", "about",
]);

// Mirrors `MAX_ENTRY_ID` in voltius (src/services/deepLinkUrl.ts).
const MAX_ENTRY_ID = 200;

// Mirrors `HANDLE_RE` in voltius (src/services/deepLinkUrl.ts), itself the
// server's `validate_custom_handle` rule.
const HANDLE_RE = /^[a-z0-9][a-z0-9_-]{1,28}[a-z0-9]$/;

// Mirrors `isValidPluginId` in voltius (src/plugins/pluginId.ts). The leading
// alphanumeric is what keeps `__meta__` and `..` unclaimable, so it is not
// cosmetic — a plugin id becomes a directory name on the client.
const PLUGIN_ID_RE = /^[a-z0-9][a-z0-9._-]*$/;
const PLUGIN_ID_MAX_LENGTH = 64;

// Mirrors `MAX_SOURCE_ID` and `MAX_CATALOG_ID` in voltius (src/services/deepLinkUrl.ts).
const MAX_SOURCE_ID = 100;
const MAX_CATALOG_ID = 100;

const ROUTE_VALIDATORS: Record<string, (params: URLSearchParams) => boolean> = {
  join: (params) => isSessionId(params.get("s") ?? "") && !!params.get("t"),
  verified: (params) => isSessionId(params.get("u") ?? ""),
  // The inbox id is opaque — entries are re-derived from server state — so only
  // its length is checked; an id the app no longer holds just opens the centre.
  notification: (params) => (params.get("n") ?? "").length <= MAX_ENTRY_ID,
  settings: (params) => SETTINGS_SECTIONS.has(params.get("section") ?? ""),
  billing: () => true,
  invite: (params) => HANDLE_RE.test((params.get("h") ?? "").replace(/^@/, "").toLowerCase()),
  // The source is a catalogue *id* the client resolves against its own configured
  // sources, never a URL — so only its length is checked here.
  "plugin-install": (params) => {
    const id = params.get("id") ?? "";
    return (
      id.length > 0 &&
      id.length <= PLUGIN_ID_MAX_LENGTH &&
      PLUGIN_ID_RE.test(id) &&
      (params.get("src") ?? "").length <= MAX_SOURCE_ID
    );
  },
  // The catalogue id is opaque — the client fetches the catalogue at confirm time —
  // so only its presence and length are checked.
  "snippet-install": (params) => {
    const id = params.get("id") ?? "";
    return id.length > 0 && id.length <= MAX_CATALOG_ID;
  },
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
