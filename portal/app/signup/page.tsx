"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { deriveAuthKey } from "../../lib/crypto";
import { register, getCheckoutUrl } from "../../lib/api";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan") ?? "pro";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    setLoading(true);
    try {
      const accountId = crypto.randomUUID();

      const authKey = await deriveAuthKey(password, accountId);
      const auth = await register(email, authKey, accountId);

      sessionStorage.setItem("access_token", auth.jwt_token);
      sessionStorage.setItem("refresh_token", auth.refresh_token);
      sessionStorage.setItem("tier", auth.tier);
      if (auth.trial_ends_at) sessionStorage.setItem("trial_ends_at", String(auth.trial_ends_at));

      // Redirect to checkout if plan is not free
      if (plan !== "free") {
        const { checkout_url } = await getCheckoutUrl(plan, auth.jwt_token);
        window.location.href = checkout_url;
      } else {
        router.push("/account");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Create your account</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          {plan !== "free" ? `Starting ${plan} free trial` : "Free plan — no card required"}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Field label="Email" type="email" value={email} onChange={setEmail} ref={emailRef} required />
          <Field label="Master password" type="password" value={password} onChange={setPassword} required
            hint="Min 12 characters. This password is never sent to our servers." />
          <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />

          {error && <p style={{ color: "var(--error)", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", margin: 0 }}>
            By creating an account you agree to our{" "}
            <a href="https://voltius.app/terms" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="https://voltius.app/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
              Privacy Policy
            </a>
            .
          </p>
        </form>

        <p style={{ marginTop: "1.5rem", color: "var(--muted)", fontSize: "0.875rem", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/signin" style={{ color: "var(--accent)" }}>Sign in</a>
        </p>
      </div>
    </main>
  );
}

const Field = Object.assign(
  function Field({
    label, type, value, onChange, hint, required, ref: _ref,
  }: {
    label: string; type: string; value: string;
    onChange: (v: string) => void; hint?: string; required?: boolean;
    ref?: React.Ref<HTMLInputElement>;
  }) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <label style={{ fontSize: "0.875rem", color: "var(--fg)" }}>{label}</label>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          style={inputStyle}
        />
        {hint && <p style={{ fontSize: "0.75rem", color: "var(--muted)", margin: 0 }}>{hint}</p>}
      </div>
    );
  },
  {},
);

const inputStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--fg)",
  fontSize: "0.9rem",
  padding: "0.625rem 0.875rem",
  outline: "none",
  width: "100%",
};

function btnStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "var(--border)" : "var(--accent)",
    border: "none",
    borderRadius: "0.5rem",
    color: "#fff",
    cursor: disabled ? "default" : "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    padding: "0.75rem",
    transition: "background 0.15s",
    width: "100%",
  };
}
