"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getInvitation, acceptInvitation } from "../../../lib/api";
import type { InvitationDetails } from "../../../lib/api";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner", manager: "Manager", editor: "Editor",
  member: "Member", "connect-only": "Connect-Only",
};

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "accepting" | "done" | "expired" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const authToken = typeof window !== "undefined" ? sessionStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) return;
    getInvitation(token)
      .then((inv) => { setInvitation(inv); setState("ready"); })
      .catch(() => setState("expired"));
  }, [token]);

  const handleAccept = async () => {
    if (!authToken) {
      // Save return URL and redirect to sign in
      sessionStorage.setItem("invite_return", `/invite/${token}`);
      router.push(`/signin?return=/invite/${token}`);
      return;
    }
    setState("accepting");
    try {
      await acceptInvitation(token, authToken);
      setState("done");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      <a href="https://voltius.app" className="flex items-center gap-2 mb-10 text-white font-semibold text-sm">
        <Image src="/logo.png" alt="Voltius" width={24} height={24} />
        Voltius
      </a>

      <div className="w-full max-w-sm bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-8 text-center space-y-6">
        {state === "loading" && (
          <p className="text-sm text-zinc-500 animate-pulse">Loading invitation…</p>
        )}

        {state === "expired" && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1">Invitation not found</h2>
              <p className="text-sm text-zinc-500">This invitation may have expired or already been accepted.</p>
            </div>
            <a href="https://voltius.app" className="block text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Go to voltius.app →
            </a>
          </>
        )}

        {(state === "ready" || state === "accepting" || state === "error") && invitation && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/12 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>

            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                Join <span className="text-indigo-400">{invitation.team_name}</span>
              </h2>
              <p className="text-sm text-zinc-400">
                {invitation.inviter_email} invited you as{" "}
                <span className="text-zinc-200 font-medium">
                  {ROLE_LABELS[invitation.role] ?? invitation.role}
                </span>
              </p>
            </div>

            {state === "error" && (
              <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{errorMsg}</p>
            )}

            {!authToken && (
              <p className="text-xs text-zinc-600">
                You&apos;ll need to sign in or create an account to accept.
              </p>
            )}

            <button
              onClick={() => void handleAccept()}
              disabled={state === "accepting"}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity"
              style={{ background: "#6366f1", opacity: state === "accepting" ? 0.6 : 1 }}
            >
              {state === "accepting"
                ? "Joining…"
                : authToken
                  ? `Accept & Join ${invitation.team_name}`
                  : "Sign in to accept"
              }
            </button>

            {!authToken && (
              <p className="text-xs text-zinc-600">
                No account?{" "}
                <a
                  href={`/signup?return=/invite/${token}`}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Create one for free
                </a>
              </p>
            )}
          </>
        )}

        {state === "done" && invitation && (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/12 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-1">You&apos;re in!</h2>
              <p className="text-sm text-zinc-400">
                You&apos;ve joined <span className="text-zinc-200 font-medium">{invitation.team_name}</span>.
                Open Voltius to access the shared vault.
              </p>
            </div>
            <a
              href="/account"
              className="block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
              style={{ background: "#6366f1" }}
            >
              Go to account →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
