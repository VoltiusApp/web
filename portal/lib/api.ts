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

export function getChallenge(email: string): Promise<ChallengeResponse> {
  return request<ChallengeResponse>(
    `/v1/auth/challenge?email=${encodeURIComponent(email)}`,
  );
}

export function register(
  email: string,
  authKey: string,
  accountId: string,
  publicKey: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, auth_key: authKey, account_id: accountId, public_key: publicKey }),
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
