"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PLANS, PER_SEAT_PLAN_IDS, MIN_SEATS, planOrder, trialLabel, trialCardLabel } from "@shared/plans";
import Image from "next/image";
import { ApiError, apiBase, activateTrial, getPromos, type Promos, getCheckoutUrl, getPortalUrl, updateSeats, refreshJwt, getSubscription, cancelSubscription, resumeSubscription, resendVerificationEmail } from "../../lib/api";
import EditEmailModal from "./EditEmailModal";
import ChangePasswordModal from "./ChangePasswordModal";
import ChangeHandleModal from "./ChangeHandleModal";
import { useServerMeta } from "../../lib/serverMeta";
import { clearAccountNotice, peekAccountNotice } from "../../lib/session";

const DOWNLOAD_URL = "https://voltius.app#download";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  teams: "Teams",
  business: "Business",
  pro_trial: "Pro (Trial)",
  teams_trial: "Teams (Trial)",
};

const allPlans = PLANS.map((plan) => ({
  ...plan,
  trial: plan.trial ? `${trialLabel(plan.trial)} · ${trialCardLabel(plan.trial)}` : null,
}));

export default function AccountPage() {
  const router = useRouter();
  const [tier, setTier] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<"annual" | "monthly">("annual");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [promos, setPromos] = useState<Promos | null>(null);
  const [trialLoading, setTrialLoading] = useState<"pro" | "teams" | null>(null);
  const [highlightPlan, setHighlightPlan] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [teamsSeats, setTeamsSeats] = useState(3);
  const [hasLsSubscription, setHasLsSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [subscriptionCancelled, setSubscriptionCancelled] = useState(false);
  const [renewsAt, setRenewsAt] = useState<number | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [subscriptionActionLoading, setSubscriptionActionLoading] = useState<"cancel" | "resume" | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [emailUndeliverable, setEmailUndeliverable] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountId, setAccountId] = useState("");
  const [verificationResending, setVerificationResending] = useState(false);
  const [verificationResent, setVerificationResent] = useState(false);
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [accountHandle, setAccountHandle] = useState("");
  const [showChangeHandle, setShowChangeHandle] = useState(false);
  const [handleManaged, setHandleManaged] = useState(false);
  const [handleCopied, setHandleCopied] = useState(false);
  const [notice] = useState(peekAccountNotice);
  const [serverHost, setServerHost] = useState("");
  const meta = useServerMeta();
  const billingEnabled = meta?.billing_enabled !== false;

  useEffect(() => {
    // Ingest ?token= from desktop app handoff (Bug 7)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const planParam = params.get("plan");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the query string only exists after the static prerender
    setHighlightPlan(planParam === "pro" || planParam === "teams" ? planParam : null);
    if (urlToken) {
      sessionStorage.setItem("access_token", urlToken);
      window.history.replaceState({}, "", "/account");
    }

    const storedToken = sessionStorage.getItem("access_token");
    const effectiveToken = urlToken ?? storedToken;
    if (!effectiveToken) { router.replace("/signin"); return; }
    setToken(effectiveToken);

    clearAccountNotice();
    void apiBase().then((url) => setServerHost(new URL(url).host)).catch(() => {});

    const init = async () => {
      const refreshToken = sessionStorage.getItem("refresh_token");
      let activeToken = effectiveToken;

      // Refresh JWT to get latest tier from DB (Bug 4)
      if (refreshToken) {
        try {
          const { jwt_token } = await refreshJwt(refreshToken);
          sessionStorage.setItem("access_token", jwt_token);
          activeToken = jwt_token;
          setToken(jwt_token);
          const payload = decodeJwtPayload(jwt_token);
          if (payload.tier) {
            sessionStorage.setItem("tier", payload.tier);
            setTier(payload.tier);
          }
          if (payload.trial_ends_at != null) {
            sessionStorage.setItem("trial_ends_at", String(payload.trial_ends_at));
          } else {
            sessionStorage.removeItem("trial_ends_at");
          }
          setEmailVerified(payload.email_verified ?? null);
          setAccountEmail(payload.email ?? "");
        } catch { /* fall through with stored values */ }
      } else {
        setTier(sessionStorage.getItem("tier") ?? "free");
      }

      const payload = decodeJwtPayload(activeToken);
      setEmailVerified(payload.email_verified ?? null);
      setAccountEmail(payload.email ?? "");

      // Fetch live subscription data (Bug 3)
      try {
        const sub = await getSubscription(activeToken);
        applySubscription(sub);
      } catch { /* fall through */ }

      // Fetch account_id (needed for password/email change key derivation)
      try {
        const { getMe } = await import("../../lib/api");
        const me = await getMe(activeToken);
        setAccountId(me.account_id);
        setAccountEmail(me.email);
        setAccountHandle(me.handle);
        // Authoritative over the JWT claim above: the token predates a
        // verification the user may have completed since it was issued, and
        // this value now decides whether the handle control is offered.
        setEmailVerified(me.email_verified);
        setEmailUndeliverable(me.email_undeliverable === true);
        setHandleManaged(!!me.handle_managed);
      } catch { /* non-critical */ }

      // Which trials may still be started. Self-hosted servers answer 503:
      // no promos then, so no trial buttons and plain upgrades.
      try {
        setPromos(await getPromos(activeToken));
      } catch {
        setPromos(null);
      }
    };

    init();
  }, [router, reloadKey]);

  async function handleUpgrade(plan: string, seats?: number) {
    if (!token) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const { checkout_url } = await getCheckoutUrl(plan, token, seats, billingPeriod);
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleStartTrial(plan: "pro" | "teams") {
    if (!token) return;
    setTrialLoading(plan);
    setError("");
    try {
      await activateTrial(plan, token);
      // The effect refreshes the JWT, then reloads subscription, profile and promos.
      setReloadKey((k) => k + 1);
    } catch (err) {
      const code = err instanceof ApiError ? err.body?.error : null;
      if (code === "EMAIL_NOT_VERIFIED") {
        setError(`Verify your email to start a trial — we sent a link to ${accountEmail || "your email"}.`);
      } else if (code === "TRIAL_UNAVAILABLE") {
        // No trial left for this account: fall back to the plan's regular action.
        setReloadKey((k) => k + 1);
        if (hasLsSubscription) void handleManage();
        else void handleUpgrade(plan, plan === "teams" ? teamsSeats : undefined);
      } else {
        setError(err instanceof Error ? err.message : "Failed to start the trial.");
      }
    } finally {
      setTrialLoading(null);
    }
  }

  async function handleManage() {
    if (!token) return;
    setPortalLoading(true);
    setError("");
    try {
      const { portal_url } = await getPortalUrl(token);
      window.location.href = portal_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open billing portal.");
    } finally {
      setPortalLoading(false);
    }
  }

  function applySubscription(sub: Awaited<ReturnType<typeof getSubscription>>) {
    setHasLsSubscription(sub.has_ls_subscription);
    if (sub.seats !== null) setTeamsSeats(sub.seats);
    setTier(sub.tier);
    setSubscriptionStatus(sub.status);
    setSubscriptionCancelled(sub.cancelled);
    setRenewsAt(sub.renews_at);
    setEndsAt(sub.ends_at);
    sessionStorage.setItem("tier", sub.tier);
    if (sub.trial_ends_at != null) {
      sessionStorage.setItem("trial_ends_at", String(sub.trial_ends_at));
    } else {
      sessionStorage.removeItem("trial_ends_at");
    }
  }

  async function handleCancelSubscription() {
    if (!token) return;
    const confirmed = window.confirm("Cancel Pro at the end of the current billing period? You will keep Pro access until the cancellation date.");
    if (!confirmed) return;
    setSubscriptionActionLoading("cancel");
    setError("");
    try {
      applySubscription(await cancelSubscription(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel subscription.");
    } finally {
      setSubscriptionActionLoading(null);
    }
  }

  async function handleResumeSubscription() {
    if (!token) return;
    setSubscriptionActionLoading("resume");
    setError("");
    try {
      applySubscription(await resumeSubscription(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume subscription.");
    } finally {
      setSubscriptionActionLoading(null);
    }
  }

  async function handleResendVerification() {
    if (!token) return;
    setVerificationResending(true);
    setVerificationResent(false);
    setError("");
    try {
      await resendVerificationEmail(token);
      setVerificationResent(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setEmailUndeliverable(true);
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setVerificationResending(false);
    }
  }

  async function handleUpdateSeats(seats: number) {
    if (!token) return;
    setSeatsLoading(true);
    setError("");
    try {
      await updateSeats(seats, token);
      setTeamsSeats(seats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update seats.");
    } finally {
      setSeatsLoading(false);
    }
  }

  async function handleCopyHandle() {
    if (!accountHandle) return;
    try {
      await navigator.clipboard.writeText(`@${accountHandle}`);
      setHandleCopied(true);
      setTimeout(() => setHandleCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  }

  function handleSignOut() {
    sessionStorage.clear();
    router.replace("/signin");
  }

  if (!tier || meta === undefined) return null;

  // Trial users have tier="pro" + trial_ends_at set but no LS subscription yet
  const storedTrialEndsAt = typeof window !== "undefined"
    ? sessionStorage.getItem("trial_ends_at") : null;
  const onTrial = (tier === "pro" || tier === "teams")
    && storedTrialEndsAt !== null
    && Date.now() / 1000 < Number(storedTrialEndsAt)
    && !hasLsSubscription;
  const displayTier = onTrial ? `${tier}_trial` : tier;
  const activePlanId = onTrial ? tier : (displayTier ?? "free");

  return (
    <>
      <div className="relative min-h-screen overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/6 rounded-full blur-[140px]" />
        </div>
        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_60%)]" />

        {/* Nav */}
        <header className="border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="https://voltius.app" className="flex items-center gap-2 text-white font-semibold text-sm">
              <Image src="/logo.png" alt="Voltius" width={24} height={24} />
              Voltius
              {meta?.self_hosted && (
                <span className="ml-1 font-mono text-[11px] font-normal px-2 py-0.5 rounded-full border border-zinc-700 text-zinc-400">self-hosted</span>
              )}
            </a>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-[#1e1e2e] hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {showEditEmail && token && accountId && (
        <EditEmailModal
          currentEmail={accountEmail}
          accountId={accountId}
          token={token}
          onClose={() => setShowEditEmail(false)}
          onSuccess={(newEmail) => {
            setAccountEmail(newEmail);
            setEmailVerified(false);
            setEmailUndeliverable(false);
            setShowEditEmail(false);
          }}
        />
      )}

      {showChangeHandle && token && (
        <ChangeHandleModal
          currentHandle={accountHandle}
          token={token}
          onClose={() => setShowChangeHandle(false)}
          onSuccess={(newHandle) => {
            setAccountHandle(newHandle);
            setShowChangeHandle(false);
          }}
        />
      )}

      {showChangePassword && token && accountId && (
        <ChangePasswordModal
          accountId={accountId}
          token={token}
          onClose={() => setShowChangePassword(false)}
          onSuccess={(newJwt, newRefresh) => {
            sessionStorage.setItem("access_token", newJwt);
            sessionStorage.setItem("refresh_token", newRefresh);
            setToken(newJwt);
            setShowChangePassword(false);
          }}
        />
      )}

      <main className="max-w-5xl mx-auto px-6 py-12">
          {notice && (
            <div className={`mb-6 rounded-2xl border p-4 text-sm ${notice.tone === "success" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}>
              {notice.text}
            </div>
          )}
          {emailVerified === false && (
            <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm text-amber-100">
                {emailUndeliverable
                  ? `We couldn't deliver mail to ${accountEmail || "your email"}. Check the address and change it if it's wrong.`
                  : `Please verify your email — we sent a link to ${accountEmail || "your email"}.`}
              </p>
              <div className="flex items-center gap-3">
                {verificationResent && !emailUndeliverable && <span className="text-xs text-amber-200">Sent.</span>}
                <button
                  onClick={() => (emailUndeliverable ? setShowEditEmail(true) : void handleResendVerification())}
                  disabled={verificationResending}
                  className="shrink-0 px-4 py-2 rounded-xl bg-amber-300 hover:bg-amber-200 disabled:opacity-60 text-black font-semibold text-sm transition-colors"
                >
                  {emailUndeliverable ? "Change email" : verificationResending ? "Sending..." : "Resend"}
                </button>
              </div>
            </div>
          )}

          {/* Account settings */}
          <div className="mb-10">
            <p className="font-mono text-xs text-cyan-400 mb-3">— account</p>
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] divide-y divide-[#1e1e2e]">
              {/* Handle row */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Handle</p>
                  <p className="text-sm text-white">{accountHandle ? `@${accountHandle}` : "—"}</p>
                  <div className="mt-1">
                    {handleManaged ? (
                      <p className="text-xs text-zinc-500">Managed by your organization. Ask your administrator to change it.</p>
                    ) : (
                      <>
                        <p className="text-xs text-zinc-500">A custom handle makes you findable by people outside your teams.</p>
                        <p className="text-xs text-zinc-500">Your current handle already works for anyone you give it to.</p>
                      </>
                    )}
                    {emailVerified === false && (
                      <p className="text-xs text-amber-300 mt-1">Verify your email to choose a custom handle.</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {accountHandle && (
                    <button
                      onClick={() => void handleCopyHandle()}
                      className="px-4 py-2 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                    >
                      {handleCopied ? "Copied" : "Copy"}
                    </button>
                  )}
                  {/* Disabled with the reason rather than hidden — hiding it is
                      what made the old tier gate unreadable. */}
                  <button
                    onClick={() => setShowChangeHandle(true)}
                    disabled={emailVerified === false || handleManaged}
                    className="px-4 py-2 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[#1e1e2e] text-zinc-400 hover:text-white disabled:hover:text-zinc-400 text-sm font-semibold transition-colors"
                  >
                    Change handle
                  </button>
                </div>
              </div>
              {/* Email + password row */}
              <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm text-white">{accountEmail || "—"}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setShowEditEmail(true)}
                    className="px-4 py-2 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Change email
                  </button>
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="px-4 py-2 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Current plan */}
          <div className="mb-10">
            <p className="font-mono text-xs text-cyan-400 mb-3">{billingEnabled ? "— your plan" : "— your server"}</p>
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current plan</p>
                <p className="text-2xl font-bold text-white">{PLAN_LABELS[displayTier] ?? displayTier}</p>
                {!billingEnabled && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Self-hosted server{serverHost && <> · <span className="font-mono text-zinc-400">{serverHost}</span></>}. Every feature is included; billing does not apply here.
                  </p>
                )}
                {onTrial && billingEnabled && (
                  <p className="text-xs text-zinc-500 mt-1">Trial active — upgrade before it ends to keep cloud sync and your encrypted backup. Devices on the same network keep syncing for free.</p>
                )}
              </div>
              <a
                href={DOWNLOAD_URL}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              >
                Download app
              </a>
            </div>
          </div>

          {billingEnabled && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-xs text-zinc-500">— plans</p>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111118] border border-[#1e1e2e]">
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    billingPeriod === "annual"
                      ? "bg-cyan-500 text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Annual
                </button>
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-[#1e1e2e] text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {allPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  billingPeriod={billingPeriod}
                  activePlanId={activePlanId}
                  onTrial={onTrial}
                  hasLsSubscription={hasLsSubscription}
                  subscriptionStatus={subscriptionStatus}
                  subscriptionCancelled={subscriptionCancelled}
                  renewsAt={renewsAt}
                  endsAt={endsAt}
                  teamsSeats={teamsSeats}
                  onChangeTeamsSeats={setTeamsSeats}
                  onUpgrade={handleUpgrade}
                  trialAvailable={
                    plan.id === "pro" ? promos?.pro_trial_available === true
                    : plan.id === "teams" ? promos?.teams_trial_available === true
                    : false
                  }
                  trialLoading={trialLoading === plan.id}
                  highlighted={highlightPlan === plan.id}
                  onStartTrial={handleStartTrial}
                  onManage={handleManage}
                  onUpdateSeats={handleUpdateSeats}
                  subscriptionActionLoading={subscriptionActionLoading}
                  onCancelSubscription={handleCancelSubscription}
                  onResumeSubscription={handleResumeSubscription}
                  checkoutLoading={checkoutLoading}
                  portalLoading={portalLoading}
                  seatsLoading={seatsLoading}
                />
              ))}
            </div>
          </div>
          )}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        </main>
      </div>
    </>
  );
}

type JwtPayload = {
  tier?: string;
  trial_ends_at?: number | null;
  email_verified?: boolean;
  email?: string;
};

function decodeJwtPayload(token: string): JwtPayload {
  try {
    const raw = atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(raw) as JwtPayload;
  } catch {
    return {};
  }
}

function formatBillingDate(timestamp: number | null): string | null {
  if (timestamp == null) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp * 1000));
}

function PlanCard({
  plan, billingPeriod, activePlanId, onTrial, hasLsSubscription,
  subscriptionStatus, subscriptionCancelled, renewsAt, endsAt,
  teamsSeats, onChangeTeamsSeats, onUpgrade, onManage, onUpdateSeats,
  trialAvailable, trialLoading, highlighted, onStartTrial,
  subscriptionActionLoading, onCancelSubscription, onResumeSubscription,
  checkoutLoading, portalLoading, seatsLoading,
}: {
  plan: (typeof allPlans)[0];
  billingPeriod: "annual" | "monthly";
  activePlanId: string;
  onTrial: boolean;
  hasLsSubscription: boolean;
  subscriptionStatus: string | null;
  subscriptionCancelled: boolean;
  renewsAt: number | null;
  endsAt: number | null;
  teamsSeats: number;
  onChangeTeamsSeats: (n: number) => void;
  onUpgrade: (plan: string, seats?: number) => void;
  trialAvailable: boolean;
  trialLoading: boolean;
  highlighted: boolean;
  onStartTrial: (plan: "pro" | "teams") => void;
  onManage: () => void;
  onUpdateSeats: (seats: number) => void;
  subscriptionActionLoading: "cancel" | "resume" | null;
  onCancelSubscription: () => void;
  onResumeSubscription: () => void;
  checkoutLoading: boolean;
  portalLoading: boolean;
  seatsLoading: boolean;
}) {
  const isPerSeat = PER_SEAT_PLAN_IDS.includes(plan.id);
  // Mirrors teamsSeats so the field can hold a transient value while typing,
  // but still follows the +/- buttons, which change it from outside.
  const [seatDraft, setSeatDraft] = useState(String(teamsSeats));
  const [draftFor, setDraftFor] = useState(teamsSeats);
  if (draftFor !== teamsSeats) {
    setDraftFor(teamsSeats);
    setSeatDraft(String(teamsSeats));
  }
  const seats = isPerSeat ? teamsSeats : undefined;
  const unitPrice = billingPeriod === "annual" ? plan.annualPrice : plan.monthlyPrice;
  const displayPrice = isPerSeat ? unitPrice * teamsSeats : unitPrice;
  const displayPeriod = isPerSeat ? "/ month" : plan.period;
  const billingNote = plan.annualPrice === 0 ? "no account required"
    : billingPeriod === "annual" ? "billed annually"
    : "billed monthly";

  const currentOrder = planOrder(activePlanId);
  const isActive = plan.id === activePlanId;
  const isUpgrade = planOrder(plan.id) > currentOrder;

  const loading = checkoutLoading || portalLoading || trialLoading;
  const renewalDate = formatBillingDate(renewsAt);
  const cancellationDate = formatBillingDate(endsAt ?? renewsAt);
  const showProLifecycle = plan.id === "pro" && isActive && hasLsSubscription && !onTrial;

  const trialRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (highlighted && trialAvailable) trialRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [highlighted, trialAvailable]);

  function handleAction() {
    if (trialAvailable && (plan.id === "pro" || plan.id === "teams")) {
      onStartTrial(plan.id);
    } else if (plan.id === "free" || hasLsSubscription) {
      onManage();
    } else {
      onUpgrade(plan.id, seats);
    }
  }

  const actionLabel = (() => {
    if (trialLoading) return "Starting trial…";
    if (loading) return portalLoading ? "Opening…" : "Opening checkout…";
    if (plan.id === "free") return "Cancel subscription";
    if (trialAvailable) return `Start free trial — ${plan.name}`;
    if (isUpgrade) return `Upgrade to ${plan.name}`;
    return `Switch to ${plan.name}`;
  })();

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300 ${
        isActive
          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
          : "border-[#1e1e2e] bg-[#111118] hover:border-zinc-700"
      } ${highlighted && trialAvailable && !isActive ? "ring-2 ring-cyan-400/60" : ""}`}
    >
      {isActive && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500 text-black">
          {onTrial ? "Trial active" : "Current plan"}
        </span>
      )}

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
        <div className="mt-1 flex items-baseline gap-1">
          {plan.annualPrice === 0 ? (
            <>
              <span className="text-3xl font-bold text-white">$0</span>
              {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
            </>
          ) : (
            <>
              <span className="text-3xl font-bold text-white">${displayPrice}</span>
              <span className="text-sm text-zinc-500">{displayPeriod}</span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {billingPeriod === "annual" && plan.savings ? (
            <span className="text-cyan-500">{plan.savings}</span>
          ) : (
            billingNote
          )}
        </p>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{plan.desc}</p>
      </div>

      {/* Seat selector for teams */}
      {isPerSeat && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-zinc-500">Seats</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeTeamsSeats(Math.max(MIN_SEATS, teamsSeats - 1))}
              className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-xs transition-colors"
              aria-label="Remove seat"
            >−</button>
            <input
              type="number"
              min={MIN_SEATS}
              inputMode="numeric"
              value={seatDraft}
              onChange={(e) => {
                setSeatDraft(e.target.value);
                const n = Number(e.target.value);
                // Commit only a usable value; a half-typed "1" on the way to
                // "10" must not snap the field back to the minimum.
                if (Number.isInteger(n) && n >= MIN_SEATS) onChangeTeamsSeats(n);
              }}
              onBlur={() => {
                const n = Number(seatDraft);
                const clamped = Number.isInteger(n) && n >= MIN_SEATS ? n : MIN_SEATS;
                setSeatDraft(String(clamped));
                onChangeTeamsSeats(clamped);
              }}
              aria-label="Seats"
              className="w-12 text-center text-sm font-semibold text-white bg-transparent border border-transparent rounded-lg focus:border-zinc-600 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={() => onChangeTeamsSeats(teamsSeats + 1)}
              className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-xs transition-colors"
              aria-label="Add seat"
            >+</button>
          </div>
          <span className="text-xs text-zinc-600">min. {MIN_SEATS}</span>
          {isActive && (
            <button
              onClick={() => onUpdateSeats(teamsSeats)}
              disabled={seatsLoading}
              className="ml-auto text-xs px-2.5 py-1 rounded-lg border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              {seatsLoading ? "Updating…" : "Update"}
            </button>
          )}
        </div>
      )}

      {/* CTA */}
      {isActive ? (
        <div className="flex flex-col gap-2">
          {onTrial && (plan.id === "pro" || plan.id === "teams") ? (
            <>
              <button
                onClick={() => onUpgrade(plan.id, seats)}
                disabled={checkoutLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50"
              >
                {checkoutLoading ? "Opening checkout…" : `Upgrade to ${plan.name} →`}
              </button>
            </>
          ) : (
            <>
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-cyan-500/30 text-cyan-400 opacity-70 cursor-default"
              >
                Current plan
              </button>
              {showProLifecycle && (
                <div className="rounded-xl border border-[#1e1e2e] bg-[#0a0a0f] p-3 text-xs text-zinc-500 leading-relaxed">
                  {subscriptionCancelled ? (
                    <p>Cancels on {cancellationDate ?? "the period end"}. You keep Pro until then.</p>
                  ) : (
                    <p>{subscriptionStatus === "active" && renewalDate ? `Renews on ${renewalDate}.` : "Your Pro subscription is active."}</p>
                  )}
                </div>
              )}
              {showProLifecycle && subscriptionCancelled ? (
                <button
                  onClick={onResumeSubscription}
                  disabled={subscriptionActionLoading !== null}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all duration-200 disabled:opacity-50"
                >
                  {subscriptionActionLoading === "resume" ? "Resuming…" : "Resume subscription"}
                </button>
              ) : showProLifecycle ? (
                <button
                  onClick={onCancelSubscription}
                  disabled={subscriptionActionLoading !== null}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[#1e1e2e] hover:border-red-500/50 text-zinc-400 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  {subscriptionActionLoading === "cancel" ? "Cancelling…" : "Cancel subscription"}
                </button>
              ) : null}
              {activePlanId !== "free" && (
                <button
                  onClick={onManage}
                  disabled={portalLoading}
                  className="text-xs text-center text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? "Opening…" : "Manage billing →"}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            ref={trialRef}
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-default ${
              (isUpgrade || trialAvailable) && plan.id !== "free"
                ? "bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                : "border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white"
            }`}
          >
            {actionLabel}
          </button>
          {plan.trial && trialAvailable && (
            <p className="-mt-1 text-center text-xs text-zinc-600">{plan.trial}</p>
          )}
        </div>
      )}

      {/* Features */}
      <ul className="flex flex-col gap-2 mt-auto">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
