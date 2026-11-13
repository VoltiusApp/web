"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthShell, { LINK, PRIMARY_BUTTON } from "../../AuthShell";
import { ApiError, acceptInvitation, type InvitationDetails } from "../../../lib/api";
import { inviterLabel, roleLabel, useInvitation } from "../../../lib/invitation";
import { useServerMeta } from "../../../lib/serverMeta";
import { setAccountNotice } from "../../../lib/session";
import { INVITATION_NOT_FOUND, INVITATION_ON_OWN_SERVER, INVITATION_WITHDRAWN, joinedNotice } from "../../../lib/messages";

const SECONDARY_BUTTON =
  "block w-full py-3 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-300 hover:text-white text-sm font-semibold text-center transition-colors";

function acceptErrorMessage(err: unknown, invitation: InvitationDetails): string {
  if (err instanceof ApiError) {
    if (err.status === 403) {
      return `This invitation was sent to ${invitation.email ?? "a different address"}. Sign in with that account to accept it.`;
    }
    if (err.status === 404) return INVITATION_NOT_FOUND;
    if (err.status === 410) return INVITATION_WITHDRAWN;
  }
  return err instanceof Error ? err.message : "Something went wrong.";
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const invitation = useInvitation(token);
  const meta = useServerMeta();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage only exists after the static prerender
  useEffect(() => { setAuthToken(sessionStorage.getItem("access_token")); }, []);

  if (invitation === undefined) {
    return <AuthShell><p className="text-sm text-zinc-500 animate-pulse text-center">Loading invitation…</p></AuthShell>;
  }

  if (invitation === null) {
    return (
      <AuthShell>
        <h1 className="text-xl font-bold text-white mb-2">Invitation not found</h1>
        <p className="text-sm text-zinc-400 leading-relaxed">{INVITATION_NOT_FOUND}</p>
        <p className="mt-3 text-sm text-zinc-500 leading-relaxed">{INVITATION_ON_OWN_SERVER}</p>
        <a href="/signin" className={`mt-6 ${SECONDARY_BUTTON}`}>Go to sign in</a>
      </AuthShell>
    );
  }

  const details = invitation;
  const returnHere = encodeURIComponent(`/invite/${token}`);
  const canCreateAccount = meta?.registration_enabled !== false || meta?.team_invites_enabled !== false;

  async function accept() {
    if (!authToken) return;
    setAccepting(true);
    setError("");
    try {
      await acceptInvitation(token, authToken);
      setAccountNotice(joinedNotice(details.team_name));
      router.push("/account");
    } catch (err) {
      setError(acceptErrorMessage(err, details));
      setAccepting(false);
    }
  }

  function signOut() {
    sessionStorage.clear();
    setAuthToken(null);
    setError("");
  }

  return (
    <AuthShell>
      <h1 className="text-xl font-bold text-white mb-1">
        Join <span className="text-cyan-400">{details.team_name}</span>
      </h1>
      <p className="text-sm text-zinc-500 mb-6">
        {inviterLabel(details)} invited you as{" "}
        <span className="text-zinc-200 font-medium">{roleLabel(details.role)}</span>
        {details.email && <> · sent to <span className="text-zinc-300">{details.email}</span></>}
      </p>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {authToken ? (
        <div className="flex flex-col gap-3">
          <button onClick={() => void accept()} disabled={accepting} className={PRIMARY_BUTTON}>
            {accepting ? "Joining…" : `Accept and join ${details.team_name}`}
          </button>
          <button onClick={signOut} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            Use a different account
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <a href={`/signin?return=${returnHere}`} className={`block text-center ${PRIMARY_BUTTON}`}>
            Sign in to accept
          </a>
          {meta === undefined ? null : canCreateAccount ? (
            <a href={`/signup?invite=${encodeURIComponent(token)}`} className={SECONDARY_BUTTON}>
              Create an account
            </a>
          ) : (
            <p className="text-xs text-zinc-500 text-center">
              Account creation is closed on this server. Ask your administrator to create your account, then{" "}
              <a href={`/signin?return=${returnHere}`} className={LINK}>sign in</a>.
            </p>
          )}
        </div>
      )}
    </AuthShell>
  );
}
