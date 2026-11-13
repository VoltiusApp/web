"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell, { Field, LINK, PRIMARY_BUTTON } from "../AuthShell";
import { deriveAuthKey, deriveKek, generateUserSecrets, wrapUserSecrets, bytesToBase64 } from "../../lib/crypto";
import { register, registerErrorMessage, type InvitationDetails } from "../../lib/api";
import { useServerMeta } from "../../lib/serverMeta";
import { safeReturnPath, setAccountNotice, storeSession } from "../../lib/session";
import { inviterLabel, useInvitation } from "../../lib/invitation";
import { INVITATION_NOT_FOUND, REGISTRATION_CLOSED, joinedNotice } from "../../lib/messages";

export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const params = useSearchParams();
  const returnTo = safeReturnPath(params.get("return"));
  const inviteToken = params.get("invite");
  const invitation = useInvitation(inviteToken);
  const meta = useServerMeta();
  const registrationOpen = meta?.registration_enabled !== false;

  if (meta === undefined || (inviteToken && invitation === undefined)) {
    return <AuthShell><p className="text-sm text-zinc-500 animate-pulse text-center">Loading…</p></AuthShell>;
  }

  if (inviteToken && !invitation) {
    return (
      <Notice
        title="Invitation not found"
        body={INVITATION_NOT_FOUND}
        registrationOpen={registrationOpen}
      />
    );
  }

  if (!inviteToken && !registrationOpen) {
    return (
      <Notice
        title="Registration is closed"
        body={REGISTRATION_CLOSED}
        registrationOpen={false}
      />
    );
  }

  return (
    <SignupForm
      invite={inviteToken && invitation ? { token: inviteToken, details: invitation } : null}
      returnTo={returnTo}
    />
  );
}

function Notice({ title, body, registrationOpen }: { title: string; body: string; registrationOpen: boolean }) {
  return (
    <AuthShell
      below={
        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account? <a href="/signin" className={LINK}>Sign in</a>
        </p>
      }
    >
      <h1 className="text-xl font-bold text-white mb-2">{title}</h1>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
      {registrationOpen && (
        <a href="/signup" className={`mt-6 block text-center ${PRIMARY_BUTTON}`}>Create an account</a>
      )}
    </AuthShell>
  );
}

function SignupForm({ invite, returnTo }: {
  invite: { token: string; details: InvitationDetails } | null;
  returnTo: string | null;
}) {
  const router = useRouter();
  const lockedEmail = invite?.details.email ?? null;
  const [email, setEmail] = useState(lockedEmail ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => { (lockedEmail ? passwordRef : emailRef).current?.focus(); }, [lockedEmail]);

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
      const [authKey, kek] = await Promise.all([
        deriveAuthKey(password, accountId),
        deriveKek(password, accountId),
      ]);
      const { dek, x25519Private, x25519PublicB64 } = await generateUserSecrets();
      const wrappedUserSecrets = bytesToBase64(await wrapUserSecrets(kek, dek, x25519Private));
      const auth = await register({
        email, authKey, accountId, wrappedUserSecrets, publicKey: x25519PublicB64, invitation: invite?.token,
      });
      storeSession(auth);
      const withdrawn = auth.withdrawn_invitations?.map((w) => w.team_name) ?? [];
      if (withdrawn.length) {
        setAccountNotice({ tone: "warning", text: `Your invitation to ${withdrawn.join(", ")} was withdrawn. Ask for a new one.` });
      } else if (invite) {
        setAccountNotice(joinedNotice(invite.details.team_name));
      }
      router.push(invite ? "/account" : (returnTo ?? "/account"));
    } catch (err) {
      setError(registerErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const signinHref = invite ? `/signin?return=${encodeURIComponent(`/invite/${invite.token}`)}` : "/signin";

  return (
    <AuthShell
      above={
        <div className="flex justify-center gap-2 mb-6">
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-green-400/30 bg-green-400/10 text-green-400">E2EE</span>
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-zinc-600 bg-zinc-800/50 text-zinc-300">Zero-knowledge</span>
          {!invite && (
            <span className="font-mono text-xs px-3 py-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400">Free to start</span>
          )}
        </div>
      }
      below={
        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account? <a href={signinHref} className={LINK}>Sign in</a>
        </p>
      }
    >
      {invite ? (
        <>
          <h1 className="text-xl font-bold text-white mb-1">
            Join <span className="text-cyan-400">{invite.details.team_name}</span>
          </h1>
          <p className="text-sm text-zinc-500 mb-6">
            {inviterLabel(invite.details)} invited you. Create your account to accept.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Your master password never leaves your device.
          </p>
        </>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          inputRef={emailRef}
          required
          readOnly={lockedEmail !== null}
          hint={lockedEmail !== null ? "The address this invitation was sent to." : undefined}
        />
        <Field
          label="Master password"
          type="password"
          value={password}
          onChange={setPassword}
          inputRef={passwordRef}
          required
          hint="Min 12 characters — never sent to our servers."
        />
        <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} required />

        {error && <p className="text-sm text-red-400 -mt-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`mt-1 ${PRIMARY_BUTTON}`}
        >
          {loading ? "Creating account…" : invite ? "Create account and join" : "Create account"}
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
    </AuthShell>
  );
}
