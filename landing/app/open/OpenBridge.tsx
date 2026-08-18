"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { readFragment, type Target } from "./fragment";

type Phase = "opening" | "stalled";
type State = "opening" | "stalled" | "invalid";

const noSubscription = () => () => {};
// `undefined` means "not hydrated yet" and renders the same "opening" markup the
// server sent, so the client's first paint matches the server's and React can
// correct silently once the real hash is read.
const getServerTarget = (): Target | null | undefined => undefined;

export default function OpenBridge() {
  // The hash is read through useSyncExternalStore rather than state set from an
  // effect, so hydration never has to reconcile a mismatched first paint.
  const cache = useRef<{ hash: string; target: Target | null } | null>(null);
  const getTarget = useCallback((): Target | null => {
    const hash = window.location.hash;
    if (!cache.current || cache.current.hash !== hash) {
      cache.current = { hash, target: readFragment(hash) };
    }
    return cache.current.target;
  }, []);
  const target = useSyncExternalStore(noSubscription, getTarget, getServerTarget);

  const [phase, setPhase] = useState<Phase>("opening");
  const [copied, setCopied] = useState(false);
  const navigated = useRef(false);

  useEffect(() => {
    if (!target || navigated.current) return;
    navigated.current = true;
    window.location.href = target.url;

    const timer = setTimeout(() => setPhase("stalled"), 2500);
    // The document going hidden means the OS handed the link to an app, so the
    // "did not open" copy would be a lie.
    const onHide = () => {
      if (document.hidden) clearTimeout(timer);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [target]);

  const state: State = target === undefined ? "opening" : target === null ? "invalid" : phase;

  async function copyCode() {
    if (!target?.code) return;
    try {
      await navigator.clipboard.writeText(target.code);
    } catch {
      // Denied permission or an insecure context. The code stays visible in
      // the button, so there is nothing more to do here.
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/8 rounded-full blur-[120px]" />
      </div>

      <Link href="/" className="flex items-center gap-2 mb-10 text-white font-semibold text-sm">
        <Image src="/logo.png" alt="Voltius" width={24} height={24} />
        Voltius
      </Link>

      <div className="w-full max-w-sm bg-[#0f0f1a] border border-[#1e1e2e] rounded-2xl p-8 text-center space-y-6">
        {state === "opening" && (
          <p className="text-sm text-zinc-500 animate-pulse">Opening Voltius...</p>
        )}

        {state === "invalid" && (
          <div>
            <h2 className="text-base font-semibold text-white mb-1">This link is incomplete</h2>
            <p className="text-sm text-zinc-400">
              Ask whoever shared it to send it again, or install Voltius below.
            </p>
          </div>
        )}

        {state === "stalled" && (
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Voltius did not open</h2>
            <p className="text-sm text-zinc-400">
              Install Voltius, then open this link again.
            </p>
          </div>
        )}

        {state === "stalled" && target && (
          <a
            href={target.url}
            className="block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
            style={{ background: "#6366f1" }}
          >
            Try again
          </a>
        )}

        {state !== "opening" && (
          <Link
            href="/#download"
            className={
              state === "stalled"
                ? "block w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors text-center"
                : "block w-full py-2.5 rounded-xl text-sm font-medium text-white text-center"
            }
            style={state === "stalled" ? undefined : { background: "#6366f1" }}
          >
            Download Voltius
          </Link>
        )}

        {state === "stalled" && target?.code && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-600">Or paste this code into Voltius:</p>
            <button
              type="button"
              onClick={copyCode}
              aria-label={copied ? "Copied to clipboard" : "Copy join code to clipboard"}
              className="w-full px-3 py-2 rounded-lg bg-[#0a0a0f] border border-[#1e1e2e] font-mono text-[11px] text-zinc-400 break-all hover:text-zinc-200 transition-colors"
            >
              {copied ? "Copied" : target.code}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
