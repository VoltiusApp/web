"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { deriveAuthKey } from "../../lib/crypto";
import { getChallenge, login } from "../../lib/api";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { account_id } = await getChallenge(email);
      const authKey = await deriveAuthKey(password, account_id);
      const auth = await login(authKey, account_id);

      sessionStorage.setItem("access_token", auth.jwt_token);
      sessionStorage.setItem("refresh_token", auth.refresh_token);
      sessionStorage.setItem("tier", auth.tier);
      if (auth.trial_ends_at) sessionStorage.setItem("trial_ends_at", String(auth.trial_ends_at));

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>Sign in to Voltius</h1>
        <p style={{ color: "var(--muted)", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Your password is never sent to our servers.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Email</label>
            <input ref={emailRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Master password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
          </div>

          {error && <p style={{ color: "var(--error)", fontSize: "0.875rem", margin: 0 }}>{error}</p>}

          <button type="submit" disabled={loading} style={btnStyle(loading)}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", color: "var(--muted)", fontSize: "0.875rem", textAlign: "center" }}>
          No account?{" "}
          <a href="/signup" style={{ color: "var(--accent)" }}>Create one</a>
        </p>
      </div>
    </main>
  );
}

const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.375rem" };
const labelStyle: React.CSSProperties = { fontSize: "0.875rem", color: "var(--fg)" };
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
