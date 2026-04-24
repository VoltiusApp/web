"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deriveAuthKey } from "../../lib/crypto";
import { register } from "../../lib/api";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
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

      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px]" />
      </div>
      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <a href="https://voltius.app" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo.png" alt="Voltius" width={32} height={32} />
          <span className="text-white font-semibold text-lg">Voltius</span>
        </a>

        {/* Badges */}
        <div className="flex justify-center gap-2 mb-6">
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-green-400/30 bg-green-400/10 text-green-400">E2EE</span>
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-zinc-600 bg-zinc-800/50 text-zinc-300">Zero-knowledge</span>
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">Free to start</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 shadow-[0_0_60px_rgba(6,182,212,0.04)]">
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Your master password never leaves your device.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} inputRef={emailRef} required />
            <Field
              label="Master password"
              type="password"
              value={password}
              onChange={setPassword}
              required
              hint="Min 12 characters — never sent to our servers."
            />
            <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />

            {error && <p className="text-sm text-red-400 -mt-1">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1e1e2e] disabled:text-zinc-500 disabled:cursor-default text-black font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-xs text-zinc-600 text-center mt-1">
              By continuing you agree to our{" "}
              <a href="https://voltius.app/terms" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2 transition-colors">
                Terms
              </a>{" "}
              and{" "}
              <a href="https://voltius.app/privacy" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-400 underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>.
            </p>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <a href="/signin" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}

function Field({
  label, type, value, onChange, inputRef, required, hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-zinc-300">{label}</label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
      />
      {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
    </div>
  );
}
