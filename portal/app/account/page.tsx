"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCheckoutUrl, getPortalUrl, updateSeats, refreshJwt, getSubscription } from "../../lib/api";

const TRIAL_EXPIRED_MODAL_KEY = "voltius_trial_expired_shown";
const DOWNLOAD_URL = "https://voltius.app#download";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  teams: "Teams",
  business: "Business",
  pro_trial: "Pro (Trial)",
};

const PLAN_ORDER: Record<string, number> = { free: 0, pro: 1, teams: 2, business: 3 };

const allPlans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "",
    billingNote: "no account required",
    desc: "Local vault and Gist sync for everyone.",
    trial: null as string | null,
    noCreditCard: false,
    features: [
      "Local encrypted vault",
      "GitHub Gist sync",
      "All local SSH/SFTP features",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 7,
    period: "/ month",
    billingNote: "billed annually",
    desc: "Real-time sync and unlimited vaults for power users.",
    trial: "14-day free trial" as string | null,
    noCreditCard: true,
    features: [
      "Real-time cloud sync (CRDTs)",
      "Sub-second updates via SSE",
      "Unlimited private vaults",
      "Share terminal (1 guest)",
    ],
  },
  {
    id: "teams",
    name: "Teams",
    price: 15,
    period: "/ user / month",
    billingNote: "billed annually",
    desc: "Shared vaults, live terminals, and access control. 3-seat minimum.",
    trial: "14-day free trial" as string | null,
    noCreditCard: false,
    features: [
      "Everything in Pro",
      "Team vaults & invites",
      "Shared terminals (unlimited guests)",
      "Granular permissions & roles",
      "Audit logging",
    ],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [tier, setTier] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [teamsSeats, setTeamsSeats] = useState(3);
  const [hasLsSubscription, setHasLsSubscription] = useState(false);
  const [seats, setSeats] = useState<number | null>(null);

  useEffect(() => {
    // Ingest ?token= from desktop app handoff (Bug 7)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    if (urlToken) {
      sessionStorage.setItem("access_token", urlToken);
      window.history.replaceState({}, "", "/account");
    }

    const storedToken = sessionStorage.getItem("access_token");
    const effectiveToken = urlToken ?? storedToken;
    if (!effectiveToken) { router.replace("/signin"); return; }
    setToken(effectiveToken);

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
          const raw = atob(jwt_token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"));
          const payload = JSON.parse(raw) as { tier?: string; trial_ends_at?: number | null };
          if (payload.tier) {
            sessionStorage.setItem("tier", payload.tier);
            setTier(payload.tier);
          }
          if (payload.trial_ends_at != null) {
            sessionStorage.setItem("trial_ends_at", String(payload.trial_ends_at));
          } else {
            sessionStorage.removeItem("trial_ends_at");
          }
        } catch { /* fall through with stored values */ }
      } else {
        setTier(sessionStorage.getItem("tier") ?? "free");
      }

      // Fetch live subscription data (Bug 3)
      try {
        const sub = await getSubscription(activeToken);
        setHasLsSubscription(sub.has_ls_subscription);
        setSeats(sub.seats);
        if (sub.seats !== null) setTeamsSeats(sub.seats);
        setTier(sub.tier);
        sessionStorage.setItem("tier", sub.tier);
        if (sub.trial_ends_at != null) {
          sessionStorage.setItem("trial_ends_at", String(sub.trial_ends_at));
        } else {
          sessionStorage.removeItem("trial_ends_at");
        }
      } catch { /* fall through */ }

      // Trial expired modal
      const finalTier = sessionStorage.getItem("tier") ?? "free";
      const trialEndsAt = sessionStorage.getItem("trial_ends_at");
      const trialExpired =
        trialEndsAt &&
        Date.now() / 1000 > Number(trialEndsAt) &&
        finalTier === "free";
      if (trialExpired && !localStorage.getItem(TRIAL_EXPIRED_MODAL_KEY)) {
        setShowTrialModal(true);
        localStorage.setItem(TRIAL_EXPIRED_MODAL_KEY, "1");
      }
    };

    init();
  }, [router]);

  async function handleUpgrade(plan: string, seats?: number) {
    if (!token) return;
    setCheckoutLoading(true);
    setError("");
    try {
      const { checkout_url } = await getCheckoutUrl(plan, token, seats);
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open checkout.");
    } finally {
      setCheckoutLoading(false);
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

  function handleSignOut() {
    sessionStorage.clear();
    router.replace("/signin");
  }

  if (!tier) return null;

  // Trial users have tier="pro" + trial_ends_at set but no LS subscription yet
  const storedTrialEndsAt = typeof window !== "undefined"
    ? sessionStorage.getItem("trial_ends_at") : null;
  const onTrial = tier === "pro"
    && storedTrialEndsAt !== null
    && Date.now() / 1000 < Number(storedTrialEndsAt)
    && !hasLsSubscription;
  const displayTier = onTrial ? "pro_trial" : tier;
  const activePlanId = displayTier === "pro_trial" ? "pro" : (displayTier ?? "free");

  return (
    <>
      {showTrialModal && (
        <TrialExpiredModal
          onUpgrade={(plan, seats) => { setShowTrialModal(false); handleUpgrade(plan, seats); }}
          onDismiss={() => setShowTrialModal(false)}
          loading={checkoutLoading}
        />
      )}

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
            </a>
            <button
              onClick={handleSignOut}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-[#1e1e2e] hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Current plan */}
          <div className="mb-10">
            <p className="font-mono text-xs text-cyan-400 mb-3">— your plan</p>
            <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current plan</p>
                <p className="text-2xl font-bold text-white">{PLAN_LABELS[displayTier] ?? displayTier}</p>
                {onTrial && (
                  <p className="text-xs text-zinc-500 mt-1">Trial active — upgrade before it ends to keep sync.</p>
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

          {/* Plans */}
          <div>
            <p className="font-mono text-xs text-zinc-500 mb-5">— plans</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {allPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  activePlanId={activePlanId}
                  onTrial={onTrial}
                  hasLsSubscription={hasLsSubscription}
                  teamsSeats={teamsSeats}
                  onChangeTeamsSeats={setTeamsSeats}
                  onUpgrade={handleUpgrade}
                  onManage={handleManage}
                  onUpdateSeats={handleUpdateSeats}
                  checkoutLoading={checkoutLoading}
                  portalLoading={portalLoading}
                  seatsLoading={seatsLoading}
                />
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>
        </main>
      </div>
    </>
  );
}

function PlanCard({
  plan, activePlanId, onTrial, hasLsSubscription,
  teamsSeats, onChangeTeamsSeats, onUpgrade, onManage, onUpdateSeats,
  checkoutLoading, portalLoading, seatsLoading,
}: {
  plan: (typeof allPlans)[0];
  activePlanId: string;
  onTrial: boolean;
  hasLsSubscription: boolean;
  teamsSeats: number;
  onChangeTeamsSeats: (n: number) => void;
  onUpgrade: (plan: string, seats?: number) => void;
  onManage: () => void;
  onUpdateSeats: (seats: number) => void;
  checkoutLoading: boolean;
  portalLoading: boolean;
  seatsLoading: boolean;
}) {
  const isTeams = plan.id === "teams";
  const seats = isTeams ? teamsSeats : undefined;
  const displayPrice = isTeams ? plan.price * teamsSeats : plan.price;

  const currentOrder = PLAN_ORDER[activePlanId] ?? 0;
  const planOrder = PLAN_ORDER[plan.id] ?? 0;
  const isActive = plan.id === activePlanId;
  const isUpgrade = planOrder > currentOrder;

  const loading = checkoutLoading || portalLoading;

  function handleAction() {
    if (plan.id === "free" || hasLsSubscription) {
      onManage();
    } else {
      onUpgrade(plan.id, seats);
    }
  }

  const actionLabel = (() => {
    if (loading) return portalLoading ? "Opening…" : "Opening checkout…";
    if (plan.id === "free") return "Cancel subscription";
    if (isUpgrade) return plan.trial ? `Start free trial — ${plan.name}` : `Upgrade to ${plan.name}`;
    return `Switch to ${plan.name}`;
  })();

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300 ${
        isActive
          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10"
          : "border-[#1e1e2e] bg-[#111118] hover:border-zinc-700"
      }`}
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
          {plan.price === 0 ? (
            <span className="text-3xl font-bold text-white">Free</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-white">${displayPrice}</span>
              <span className="text-sm text-zinc-500">{plan.period}</span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">{plan.billingNote}</p>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{plan.desc}</p>
      </div>

      {/* Seat selector for teams */}
      {isTeams && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-zinc-500">Seats</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onChangeTeamsSeats(Math.max(3, teamsSeats - 1))}
              className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-xs transition-colors"
              aria-label="Remove seat"
            >−</button>
            <span className="w-8 text-center text-sm font-semibold text-white">{teamsSeats}</span>
            <button
              onClick={() => onChangeTeamsSeats(teamsSeats + 1)}
              className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-xs transition-colors"
              aria-label="Add seat"
            >+</button>
          </div>
          <span className="text-xs text-zinc-600">min. 3</span>
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
          {onTrial && plan.id === "pro" ? (
            <>
              <button
                onClick={() => onUpgrade("pro")}
                disabled={checkoutLoading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-cyan-500 hover:bg-cyan-400 text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] disabled:opacity-50"
              >
                {checkoutLoading ? "Opening checkout…" : "Upgrade to Pro →"}
              </button>
              <p className="-mt-1 text-center text-xs text-zinc-600">no credit card required</p>
            </>
          ) : (
            <>
              <button
                disabled
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-cyan-500/30 text-cyan-400 opacity-70 cursor-default"
              >
                Current plan
              </button>
              {activePlanId !== "free" && (
                <button
                  onClick={onManage}
                  disabled={portalLoading}
                  className="text-xs text-center text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50"
                >
                  {portalLoading ? "Opening…" : "Manage subscription →"}
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-default ${
              isUpgrade && plan.id !== "free"
                ? "bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
                : "border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white"
            }`}
          >
            {actionLabel}
          </button>
          {plan.trial && (
            <p className="-mt-1 text-center text-xs text-zinc-600">
              {plan.trial}{plan.noCreditCard ? " · no credit card required" : ""}
            </p>
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

function TrialExpiredModal({ onUpgrade, onDismiss, loading }: {
  onUpgrade: (plan: string, seats?: number) => void;
  onDismiss: () => void;
  loading: boolean;
}) {
  const [seats, setSeats] = useState(3);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xl font-bold text-white mb-1">Your trial has ended</p>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          Hope the 14 days were useful. Upgrade to keep real-time sync and cloud features.
        </p>

        <button
          onClick={() => onUpgrade("pro")}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
        >
          {loading ? "Opening checkout…" : "Upgrade to Pro — $7/mo"}
        </button>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => onUpgrade("teams", seats)}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            Get Teams — ${15 * seats}/mo ({seats} seats)
          </button>
          <div className="flex flex-col gap-1">
            <button onClick={() => setSeats((s) => s + 1)} className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white text-xs transition-colors" aria-label="Add seat">+</button>
            <button onClick={() => setSeats((s) => Math.max(3, s - 1))} className="w-7 h-7 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white text-xs transition-colors" aria-label="Remove seat">−</button>
          </div>
        </div>
        <p className="mt-1 text-xs text-zinc-600 text-right">min. 3 seats · billed annually</p>

        <button
          onClick={onDismiss}
          className="mt-4 w-full text-sm text-zinc-600 hover:text-zinc-400 transition-colors py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
