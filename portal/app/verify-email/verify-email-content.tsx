"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { ApiError, resendVerificationEmail, verifyEmail } from "../../lib/api";

type VerifyState = "pending" | "inflight" | "success" | "expired" | "invalid" | "error";

export default function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<VerifyState>(token ? "pending" : "invalid");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const hasSession = typeof window !== "undefined" && Boolean(sessionStorage.getItem("access_token"));

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }

    setState("inflight");
    verifyEmail(token)
      .then((result) => {
        setEmail(result.email);
        setUserId(result.user_id ?? "");
        setState("success");
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 410) setState("expired");
        else if (err instanceof ApiError && err.status === 400) setState("invalid");
        else setState("error");
      });
  }, [token]);

  async function handleResend() {
    const authToken = sessionStorage.getItem("access_token");
    if (!authToken) return;

    setResending(true);
    setMessage("");
    try {
      await resendVerificationEmail(authToken);
      setResendSent(true);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  }

  const isTokenFailure = state === "expired" || state === "invalid";

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      <a href="https://voltius.app" className="flex items-center gap-2 mb-10 text-white font-semibold text-sm">
        <Image src="/logo.png" alt="Voltius" width={24} height={24} />
        Voltius
      </a>

      <div className="w-full max-w-sm bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-8 text-center space-y-6">
        {(state === "pending" || state === "inflight") && (
          <p className="text-sm text-zinc-500 animate-pulse">Verifying email...</p>
        )}

        {state === "success" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/12 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Email verified</h2>
              <p className="text-sm text-zinc-400">
                {userId
                  ? "Your email is verified. Open Voltius to pick up where you left off."
                  : "Your email is verified. Return to the Voltius app."}
              </p>
              {email && <p className="text-xs text-zinc-600 mt-2">{email}</p>}
            </div>
            {userId && (
              <a
                href={`voltius://verified?u=${encodeURIComponent(userId)}`}
                className="block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
                style={{ background: "#6366f1" }}
              >
                Open Voltius
              </a>
            )}
            <a
              href="/account"
              className={
                userId
                  ? "block w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                  : "block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
              }
              style={userId ? undefined : { background: "#6366f1" }}
            >
              {userId ? "Go to account →" : "Go to account >"}
            </a>
          </>
        )}

        {isTokenFailure && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                {state === "expired" ? "Verification link expired" : "Verification link invalid"}
              </h2>
              <p className="text-sm text-zinc-500">
                {hasSession
                  ? "Request a new link and check your inbox."
                  : "Sign in to request a new verification email."}
              </p>
            </div>

            {message && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{message}</p>}
            {resendSent && <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">Verification email sent.</p>}

            {hasSession ? (
              <button
                onClick={() => void handleResend()}
                disabled={resending}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
                style={{ background: "#6366f1", opacity: resending ? 0.6 : 1 }}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>
            ) : (
              <a
                href="/signin"
                className="block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
                style={{ background: "#6366f1" }}
              >
                Sign in
              </a>
            )}
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Verification unavailable</h2>
              <p className="text-sm text-zinc-500">Something went wrong while verifying your email. Please try the link again.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
