"use client";

import { useEffect, useRef, useState } from "react";
import AuthShell, { PRIMARY_BUTTON } from "../../AuthShell";
import { beginPasskey, type PasskeyCeremony, type PasskeyPurpose } from "../../../lib/api";
import { askPasskey, passkeyMessage, passkeysSupported } from "../../../lib/passkey";

const COPY: Record<PasskeyPurpose, { title: string; body: (email: string) => string; action: string }> = {
  sign_in: {
    title: "Finish signing in",
    body: (email) => `Use your passkey to finish signing in to Voltius as ${email}.`,
    action: "Use passkey",
  },
  step_up: {
    title: "Confirm it's you",
    body: (email) => `Use your passkey to confirm a change to the Voltius account ${email}.`,
    action: "Use passkey",
  },
  register: {
    title: "Add a passkey",
    body: (email) => `Create a passkey for the Voltius account ${email}.`,
    action: "Create passkey",
  },
};

type Phase =
  | { kind: "loading" }
  | { kind: "ready"; ceremony: PasskeyCeremony; error: string; working: boolean }
  | { kind: "done"; openApp?: string }
  | { kind: "stopped"; message: string };

export default function PasskeyPage() {
  const fragment = useRef<string | null>(null);
  const handle = useRef("");
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  useEffect(() => {
    // The handle is a one-time secret: read it once, then keep it out of the address bar and history.
    if (fragment.current === null) {
      fragment.current = window.location.hash.slice(1);
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (fragment.current === "done") {
      setPhase({ kind: "done" });
      return;
    }
    handle.current = new URLSearchParams(fragment.current).get("h") ?? "";
    if (!handle.current) {
      setPhase({ kind: "stopped", message: "This page only works when Voltius opens it. Go back to the app and try again." });
      return;
    }
    if (!passkeysSupported()) {
      setPhase({ kind: "stopped", message: "This browser cannot use passkeys. Go back to Voltius and use a code instead." });
      return;
    }
    let current = true;
    beginPasskey(handle.current)
      .then((ceremony) => current && setPhase({ kind: "ready", ceremony, error: "", working: false }))
      .catch((err) => current && setPhase({ kind: "stopped", message: `${passkeyMessage(err)} Go back to Voltius and try again.` }));
    return () => {
      current = false;
    };
  }, []);

  async function run(ceremony: PasskeyCeremony) {
    setPhase({ kind: "ready", ceremony, error: "", working: true });
    try {
      const { redirect } = await askPasskey(handle.current, ceremony);
      if (!redirect) throw new Error("Nothing asked for this passkey.");
      const toApp = redirect.startsWith("voltius:");
      setPhase({ kind: "done", openApp: toApp ? redirect : undefined });
      window.location.href = redirect;
    } catch (err) {
      setPhase({ kind: "ready", ceremony, error: passkeyMessage(err), working: false });
    }
  }

  if (phase.kind === "loading") {
    return (
      <AuthShell>
        <p className="text-sm text-zinc-500">Loading…</p>
      </AuthShell>
    );
  }
  if (phase.kind === "stopped") {
    return (
      <AuthShell>
        <h1 className="text-xl font-bold text-white mb-1">Passkey</h1>
        <p className="text-sm text-zinc-400">{phase.message}</p>
      </AuthShell>
    );
  }
  if (phase.kind === "done") {
    return (
      <AuthShell>
        <h1 className="text-xl font-bold text-white mb-1">Done</h1>
        <p className="text-sm text-zinc-400">Go back to Voltius. You can close this tab.</p>
        {phase.openApp && (
          <a href={phase.openApp} className={`mt-6 block text-center ${PRIMARY_BUTTON}`}>
            Open Voltius
          </a>
        )}
      </AuthShell>
    );
  }

  const { ceremony, error, working } = phase;
  const copy = COPY[ceremony.purpose];
  return (
    <AuthShell>
      <h1 className="text-xl font-bold text-white mb-1">{copy.title}</h1>
      <p className="text-sm text-zinc-400 mb-2 break-words">{copy.body(ceremony.email)}</p>
      <p className="text-sm text-zinc-500 mb-6">Only continue if you just asked for this in the Voltius app on this device.</p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      <button type="button" onClick={() => run(ceremony)} disabled={working} className={PRIMARY_BUTTON}>
        {working ? "Waiting for your passkey…" : copy.action}
      </button>
    </AuthShell>
  );
}
