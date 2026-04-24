"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getCheckoutUrl, getPortalUrl, updateSeats } from "../../lib/api";

const TRIAL_EXPIRED_MODAL_KEY = "voltius_trial_expired_shown";
const DOWNLOAD_URL = "https://voltius.app#download";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  teams: "Teams",
  business: "Business",
  pro_trial: "Pro (Trial)",
};

const upgradePlans = [
  {
    id: "pro",
    name: "Pro",
    price: 7,
    period: "/ month",
    billingNote: "billed annually",
    desc: "Real-time sync and unlimited vaults for power users.",
    highlight: true,
    trial: "14-day free trial",
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
    highlight: false,
    trial: "14-day free trial",
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

  useEffect(() => {
    const t = sessionStorage.getItem("access_token");
    const r = sessionStorage.getItem("tier");
    const trialEndsAt = sessionStorage.getItem("trial_ends_at");
    if (!t) { router.replace("/signin"); return; }
    setToken(t);
    setTier(r ?? "free");

    const trialExpired =
      trialEndsAt &&
      Date.now() / 1000 > Number(trialEndsAt) &&
      (r === "free" || r === "pro_trial");

    if (trialExpired && !localStorage.getItem(TRIAL_EXPIRED_MODAL_KEY)) {
      setShowTrialModal(true);
      localStorage.setItem(TRIAL_EXPIRED_MODAL_KEY, "1");
    }
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

  const isFreeTier = tier === "free" || tier === "pro_trial";
  const isPaidTier = tier === "pro" || tier === "teams" || tier === "business";

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
                <p className="text-2xl font-bold text-white">{PLAN_LABELS[tier] ?? tier}</p>
                {tier === "pro_trial" && (
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

          {/* Upgrade section */}
          {isFreeTier && (
            <div>
              <p className="font-mono text-xs text-zinc-500 mb-5">— upgrade your plan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upgradePlans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    teamsSeats={teamsSeats}
                    onChangeTeamsSeats={setTeamsSeats}
                    onUpgrade={handleUpgrade}
                    loading={checkoutLoading}
                  />
                ))}
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </div>
          )}

          {/* Manage section for paid users */}
          {isPaidTier && (
            <div>
              <p className="font-mono text-xs text-zinc-500 mb-5">— manage subscription</p>
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6 flex flex-col gap-6">

                {/* Seat management for Teams */}
                {tier === "teams" && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Seats</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setTeamsSeats((s) => Math.max(3, s - 1))}
                          className="w-8 h-8 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-sm transition-colors"
                          aria-label="Remove seat"
                        >−</button>
                        <span className="w-10 text-center text-lg font-semibold text-white">{teamsSeats}</span>
                        <button
                          onClick={() => setTeamsSeats((s) => s + 1)}
                          className="w-8 h-8 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] text-zinc-400 hover:text-white hover:border-zinc-600 text-sm transition-colors"
                          aria-label="Add seat"
                        >+</button>
                      </div>
                      <span className="text-xs text-zinc-600">min. 3 · ${15 * teamsSeats}/mo billed annually</span>
                      <button
                        onClick={() => handleUpdateSeats(teamsSeats)}
                        disabled={seatsLoading}
                        className="ml-auto px-4 py-2 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-default"
                      >
                        {seatsLoading ? "Updating…" : "Update seats"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Change plan */}
                {tier !== "business" && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Change plan</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {upgradePlans
                        .filter((p) => p.id !== tier)
                        .map((plan) => (
                          <button
                            key={plan.id}
                            onClick={() => handleUpgrade(plan.id, plan.id === "teams" ? teamsSeats : undefined)}
                            disabled={checkoutLoading}
                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-left transition-colors disabled:opacity-50 disabled:cursor-default group"
                          >
                            <div>
                              <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{plan.name}</p>
                              <p className="text-xs text-zinc-600">${plan.id === "teams" ? plan.price * teamsSeats : plan.price}{plan.period}</p>
                            </div>
                            <span className="text-xs text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity">Switch →</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* Billing portal */}
                <div className="pt-2 border-t border-[#1e1e2e]">
                  <button
                    onClick={handleManage}
                    disabled={portalLoading}
                    className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-default"
                  >
                    {portalLoading ? "Opening…" : "Manage billing, invoices & cancellation →"}
                  </button>
                </div>
              </div>
              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

function PlanCard({
  plan, teamsSeats, onChangeTeamsSeats, onUpgrade, loading,
}: {
  plan: (typeof upgradePlans)[0];
  teamsSeats: number;
  onChangeTeamsSeats: (n: number) => void;
  onUpgrade: (plan: string, seats?: number) => void;
  loading: boolean;
}) {
  const isTeams = plan.id === "teams";
  const displayPrice = isTeams ? plan.price * teamsSeats : plan.price;
  const seats = isTeams ? teamsSeats : undefined;

  return (
    <div
      className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-300 ${
        plan.highlight
          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
          : "border-[#1e1e2e] bg-[#111118] hover:border-zinc-700"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500 text-black">
          Recommended
        </span>
      )}

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">${displayPrice}</span>
          <span className="text-sm text-zinc-500">{plan.period}</span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">{plan.billingNote}</p>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{plan.desc}</p>
      </div>

      {/* Seat selector for teams */}
      {isTeams && (
        <div className="flex items-center gap-3">
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
        </div>
      )}

      {/* CTA */}
      <button
        onClick={() => onUpgrade(plan.id, seats)}
        disabled={loading}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-default ${
          plan.highlight
            ? "bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            : "border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white"
        }`}
      >
        {loading ? "Opening checkout…" : `Start free trial — ${plan.name}`}
      </button>
      <p className="-mt-2 text-center text-xs text-zinc-600">{plan.trial} · no credit card required</p>

      {/* Features */}
      <ul className="flex flex-col gap-2">
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
