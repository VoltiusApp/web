const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.voltius.app";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
    throw new ApiError(res.status, text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export interface ChallengeResponse {
  account_id: string;
}

export interface AuthResponse {
  jwt_token: string;
  refresh_token: string;
  tier: string;
  trial_ends_at: number | null;
  wrapped_user_secrets?: string | null;
}

export interface MeResponse {
  email: string;
  display_name: string;
  account_id: string;
  tier: string;
  trial_ends_at: number | null;
  email_verified: boolean;
  wrapped_user_secrets: string | null;
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
  wrappedUserSecrets?: string,
  x25519Public?: string,
): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      auth_key: authKey,
      account_id: accountId,
      ...(wrappedUserSecrets && { wrapped_user_secrets: wrappedUserSecrets }),
      ...(x25519Public && { public_key: x25519Public }),
    }),
  });
}

export function getMe(token: string): Promise<MeResponse> {
  return request<MeResponse>("/v1/auth/me", {}, token);
}

export function updateDisplayName(displayName: string, token: string): Promise<void> {
  return request<void>(
    "/v1/auth/display-name",
    { method: "PUT", body: JSON.stringify({ display_name: displayName }) },
    token,
  );
}

export function updateEmail(newEmail: string, authKey: string, token: string): Promise<void> {
  return request<void>(
    "/v1/auth/email",
    { method: "PUT", body: JSON.stringify({ new_email: newEmail, auth_key: authKey }) },
    token,
  );
}

export function updatePassword(
  oldAuthKey: string,
  newAuthKey: string,
  newWrappedUserSecrets: string,
  token: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    "/v1/auth/password",
    {
      method: "PUT",
      body: JSON.stringify({
        old_auth_key: oldAuthKey,
        new_auth_key: newAuthKey,
        new_wrapped_user_secrets: newWrappedUserSecrets,
      }),
    },
    token,
  );
}

export function login(authKey: string, accountId: string): Promise<AuthResponse> {
  return request<AuthResponse>("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ auth_key: authKey, account_id: accountId }),
  });
}

export function verifyEmail(token: string): Promise<{ email: string }> {
  return request<{ email: string }>("/v1/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function resendVerificationEmail(token: string): Promise<void> {
  return request<void>("/v1/auth/resend-verification-email", { method: "POST" }, token);
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
  status: string | null;
  cancelled: boolean;
  renews_at: number | null;
  ends_at: number | null;
  seats: number | null;
  used_seats: number | null;
  trial_ends_at: number | null;
  has_ls_subscription: boolean;
}

export interface InvitationDetails {
  team_name: string;
  inviter_email: string;
  role: string;
  expires_at: number;
}

export function getInvitation(token: string): Promise<InvitationDetails> {
  return request<InvitationDetails>(`/v1/invitations/${encodeURIComponent(token)}`);
}

export function acceptInvitation(token: string, authToken: string): Promise<void> {
  return request<void>(
    `/v1/invitations/${encodeURIComponent(token)}/accept`,
    { method: "POST" },
    authToken,
  );
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

export function cancelSubscription(token: string): Promise<SubscriptionInfo> {
  return request<SubscriptionInfo>("/v1/billing/subscription/cancel", { method: "POST" }, token);
}

export function resumeSubscription(token: string): Promise<SubscriptionInfo> {
  return request<SubscriptionInfo>("/v1/billing/subscription/resume", { method: "POST" }, token);
}
