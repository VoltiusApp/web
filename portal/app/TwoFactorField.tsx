"use client";

import type { TwoFactorProof } from "../lib/api";

export interface TwoFactorEntry {
  recovery: boolean;
  value: string;
}

export const EMPTY_TWO_FACTOR_ENTRY: TwoFactorEntry = { recovery: false, value: "" };

export function entryProof(entry: TwoFactorEntry): TwoFactorProof | null {
  const value = entry.value.trim();
  if (!value) return null;
  return entry.recovery ? { recoveryCode: value } : { code: value };
}

const ALL_METHODS = ["totp", "recovery"];

export function TwoFactorField({ entry, onChange, methods = ALL_METHODS, autoFocus }: {
  entry: TwoFactorEntry;
  onChange: (entry: TwoFactorEntry) => void;
  /** What the server will accept; one that lost its seed key offers recovery codes only. */
  methods?: string[];
  autoFocus?: boolean;
}) {
  const recovery = entry.recovery || !methods.includes("totp");
  const canSwitch = methods.includes("totp") && methods.includes("recovery");
  return (
    <div className="flex flex-col gap-1.5">
      <input
        key={recovery ? "recovery" : "totp"}
        type="text"
        value={entry.value}
        onChange={(e) => onChange({ recovery, value: e.target.value })}
        autoFocus={autoFocus}
        autoComplete={recovery ? "off" : "one-time-code"}
        inputMode={recovery ? "text" : "numeric"}
        autoCapitalize="none"
        spellCheck={false}
        maxLength={recovery ? 32 : 8}
        placeholder={recovery ? "Recovery code" : "6-digit code"}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm font-mono tracking-wider text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
      />
      {canSwitch && (
        <button
          type="button"
          onClick={() => onChange({ recovery: !recovery, value: "" })}
          className="self-start text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {recovery ? "Use an authenticator code" : "Use a recovery code"}
        </button>
      )}
    </div>
  );
}
