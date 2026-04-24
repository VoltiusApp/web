const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.voltius.app";

async function request<T>(
  path: string,
  options?: RequestInit,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface ChallengeResponse {
  account_id: string;
}

export interface AuthResponse {
  jwt_token: string;
  refresh_token: string;
  tier: string;
  trial_ends_at: number | null;
}

export interface CheckoutResponse {
  checkout_url: string;
}

export interface PortalResponse {
  portal_url: string;
}

export function getChallenge(email: string): Promise<ChallengeResponse> {
  return request<ChallengeResponse>(
    `/v1/auth/challenge?email=${encodeURIComponent(email)}`,
  );
}

export function register(
  email: string,
  authKey: string,
  accountId: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, auth_key: authKey, account_id: accountId }),
  });
}

export function login(authKey: string, accountId: string): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ auth_key: authKey, account_id: accountId }),
  });
}

export function getCheckoutUrl(plan: string, token: string, seats?: number): Promise<CheckoutResponse> {
  return request<CheckoutResponse>(
    "/v1/billing/checkout",
    { method: "POST", body: JSON.stringify({ plan, ...(seats !== undefined && { seats }) }) },
    token,
  );
}

export function getPortalUrl(token: string): Promise<PortalResponse> {
  return request<PortalResponse>("/v1/billing/portal", { method: "POST" }, token);
}

export function updateSeats(seats: number, token: string): Promise<void> {
  return request<void>(
    "/v1/billing/seats",
    { method: "POST", body: JSON.stringify({ seats }) },
    token,
  );
}

export interface RefreshResponse {
  jwt_token: string;
}

export interface SubscriptionInfo {
  tier: string;
  seats: number | null;
  trial_ends_at: number | null;
  has_ls_subscription: boolean;
}

export function refreshJwt(refreshToken: string): Promise<RefreshResponse> {
  return request<RefreshResponse>("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export function getSubscription(token: string): Promise<SubscriptionInfo> {
  return request<SubscriptionInfo>("/v1/billing/subscription", {}, token);
}
