"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthShell, { Field, LINK, PRIMARY_BUTTON } from "../AuthShell";
import { deriveAuthKey } from "../../lib/crypto";
import {
  ApiError, getChallenge, login, loginSecondFactor, passkeySignInHandle, twoFactorMessage,
  type AuthResponse, type TwoFactorChallenge,
} from "../../lib/api";
import { inlinePasskeyCode } from "../../lib/passkey";
import { useServerMeta } from "../../lib/serverMeta";
import { safeReturnPath, storeSession } from "../../lib/session";
import {
  EMPTY_TWO_FACTOR_ENTRY, PasskeyButton, TwoFactorField, entryProof, twoFactorPrompt, type TwoFactorEntry,
} from "../TwoFactorField";

export default function SigninPage() {
  return (
    <Suspense>
      <SigninContent />
    </Suspense>
  );
}

function SigninContent() {
  const router = useRouter();
  const returnTo = safeReturnPath(useSearchParams().get("return"));
  const meta = useServerMeta();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [twoFactor, setTwoFactor] = useState<TwoFactorEntry>(EMPTY_TWO_FACTOR_ENTRY);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => { emailRef.current?.focus(); }, []);

  function enter(auth: AuthResponse) {
    storeSession(auth);
    router.push(returnTo ?? "/account");
  }

  function backToPassword(message = "") {
    setChallenge(null);
    setTwoFactor(EMPTY_TWO_FACTOR_ENTRY);
    setError(message);
  }

  async function attempt(work: () => Promise<void>) {
    setError("");
    setLoading(true);
    try {
      await work();
    } catch (err) {
      const refusal = twoFactorMessage(err);
      // A bare 401 at the code step is the five-minute pending sign-in running out.
      if (!refusal && challenge && err instanceof ApiError && err.status === 401) {
        backToPassword("This sign-in took too long. Start again.");
      } else {
        setError(refusal ?? (err instanceof Error ? err.message : "Sign in failed."));
        setTwoFactor((entry) => ({ ...entry, value: "" }));
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    return attempt(async () => {
      const { account_id } = await getChallenge(email);
      const authKey = await deriveAuthKey(password, account_id);
      const result = await login(authKey, account_id);
      if ("challenge" in result) setChallenge(result.challenge);
      else enter(result.session);
    });
  }

  function handleCode(e: React.FormEvent) {
    e.preventDefault();
    const proof = entryProof(twoFactor);
    if (!challenge || !proof) return;
    return attempt(async () => enter(await loginSecondFactor(challenge.pending_token, proof)));
  }

  function handlePasskey() {
    if (!challenge) return;
    const { pending_token } = challenge;
    return attempt(async () => {
      const passkeyCode = await inlinePasskeyCode(() => passkeySignInHandle(pending_token));
      enter(await loginSecondFactor(pending_token, { passkeyCode }));
    });
  }

  return (
    <AuthShell
      below={
        meta === undefined ? null : meta?.registration_enabled === false ? (
          <p className="mt-5 text-center text-sm text-zinc-500">
            New accounts on this server are by invitation only.
          </p>
        ) : (
          <p className="mt-5 text-center text-sm text-zinc-500">
            No account?{" "}
            <a href={returnTo ? `/signup?return=${encodeURIComponent(returnTo)}` : "/signup"} className={LINK}>
              Create one
            </a>
          </p>
        )
      }
    >
      <h1 className="text-xl font-bold text-white mb-1">{challenge ? "Two-factor authentication" : "Welcome back"}</h1>
      <p className="text-sm text-zinc-500 mb-6">
        {challenge ? twoFactorPrompt(challenge.methods) : "Your password never leaves your device."}
      </p>

      {challenge ? (
        <form onSubmit={handleCode} className="flex flex-col gap-4">
          <PasskeyButton methods={challenge.methods} onClick={handlePasskey} disabled={loading} />
          <TwoFactorField entry={twoFactor} onChange={setTwoFactor} methods={challenge.methods} autoFocus />

          {error && (
            <p className="text-sm text-red-400 -mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !twoFactor.value.trim()}
            className={`mt-1 ${PRIMARY_BUTTON}`}
          >
            {loading ? "Verifying…" : "Verify"}
          </button>
          <button
            type="button"
            onClick={() => backToPassword()}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Back
          </button>
        </form>
      ) : (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} inputRef={emailRef} required />
        <Field label="Master password" type="password" value={password} onChange={setPassword} required />

        {error && (
          <p className="text-sm text-red-400 -mt-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`mt-1 ${PRIMARY_BUTTON}`}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      )}
    </AuthShell>
  );
}
