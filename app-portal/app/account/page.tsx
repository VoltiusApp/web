"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCheckoutUrl } from "../../lib/api";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  teams: "Teams",
  business: "Business",
  pro_trial: "Pro (trial)",
};

const DOWNLOAD_URL = "https://voltius.app#download";
const TRIAL_EXPIRED_MODAL_KEY = "voltius_trial_expired_shown";

export default function AccountPage() {
  const router = useRouter();
  const [tier, setTier] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
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

    // Show modal once if trial has expired and we haven't shown it yet
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

  function handleSignOut() {
    sessionStorage.clear();
    router.replace("/signin");
  }

  if (!tier) return null;

  const isFreeTier = tier === "free" || tier === "pro_trial";

  return (
    <>
      {showTrialModal && (
        <TrialExpiredModal
          onUpgrade={(plan) => { setShowTrialModal(false); handleUpgrade(plan); }}
          onDismiss={() => setShowTrialModal(false)}
          loading={checkoutLoading}
        />
      )}

      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Your account</h1>
            <button onClick={handleSignOut} style={ghostBtn}>Sign out</button>
          </div>

          <div style={card}>
            <p style={{ margin: "0 0 0.5rem", color: "var(--muted)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current plan</p>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 600 }}>{PLAN_LABELS[tier] ?? tier}</p>
          </div>

          {isFreeTier && (
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", margin: 0 }}>
                Upgrade for real-time cloud sync, shared vaults, and more.
              </p>
              <button onClick={() => handleUpgrade("pro")} disabled={checkoutLoading} style={accentBtn}>
                {checkoutLoading ? "Opening checkout…" : "Upgrade to Pro — $7/mo"}
              </button>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <button
                  onClick={() => handleUpgrade("teams", teamsSeats)}
                  disabled={checkoutLoading}
                  style={{ ...outlineBtn, flex: 1 }}
                >
                  Get Teams — ${15 * teamsSeats}/mo ({teamsSeats} seats)
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <button
                    onClick={() => setTeamsSeats((s) => s + 1)}
                    style={seatsBtn}
                    aria-label="Add seat"
                  >▲</button>
                  <button
                    onClick={() => setTeamsSeats((s) => Math.max(3, s - 1))}
                    style={seatsBtn}
                    aria-label="Remove seat"
                  >▼</button>
                </div>
              </div>
              <p style={{ fontSize: "0.7rem", color: "var(--muted)", margin: "-0.25rem 0 0", textAlign: "right" }}>
                min. 3 seats · billed annually
              </p>
            </div>
          )}

          {error && <p style={{ color: "var(--error)", fontSize: "0.875rem", marginTop: "1rem" }}>{error}</p>}

          <div style={{ marginTop: "2rem" }}>
            <a href={DOWNLOAD_URL} style={accentBtn}>Download Voltius</a>
          </div>
        </div>
      </main>
    </>
  );
}

function TrialExpiredModal({ onUpgrade, onDismiss, loading }: {
  onUpgrade: (plan: string) => void;
  onDismiss: () => void;
  loading: boolean;
}) {
  return (
    <div style={overlay} onClick={onDismiss}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Your trial has ended</p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          You&apos;ve had 14 days to try Pro — hope it was useful. Upgrade to keep real-time sync and cloud features.
        </p>
        <button onClick={() => onUpgrade("pro")} disabled={loading} style={accentBtn}>
          {loading ? "Opening checkout…" : "Upgrade to Pro — $7/mo"}
        </button>
        <button onClick={() => onUpgrade("teams")} disabled={loading} style={{ ...outlineBtn, marginTop: "0.5rem" }}>
          Get Teams — from $45/mo (3 seats)
        </button>
        <button onClick={onDismiss} style={dismissBtn}>Maybe later</button>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex", alignItems: "center", justifyContent: "center",
  zIndex: 50, padding: "1.5rem",
};

const modal: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "1rem",
  maxWidth: 420, width: "100%",
  padding: "2rem",
};

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  padding: "1.25rem 1.5rem",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--muted)",
  cursor: "pointer",
  fontSize: "0.8rem",
  padding: "0.375rem 0.75rem",
};

const accentBtn: React.CSSProperties = {
  background: "var(--accent)",
  border: "none",
  borderRadius: "0.5rem",
  color: "#fff",
  cursor: "pointer",
  display: "block",
  fontSize: "0.9rem",
  fontWeight: 600,
  padding: "0.75rem",
  textAlign: "center",
  textDecoration: "none",
  width: "100%",
};

const outlineBtn: React.CSSProperties = {
  background: "transparent",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--fg)",
  cursor: "pointer",
  display: "block",
  fontSize: "0.9rem",
  padding: "0.75rem",
  textAlign: "center",
  width: "100%",
};

const seatsBtn: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.25rem",
  color: "var(--muted)",
  cursor: "pointer",
  fontSize: "0.6rem",
  lineHeight: 1,
  padding: "0.2rem 0.4rem",
  width: 28,
};

const dismissBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--muted)",
  cursor: "pointer",
  display: "block",
  fontSize: "0.8rem",
  marginTop: "0.75rem",
  padding: "0.25rem",
  textAlign: "center",
  width: "100%",
};
