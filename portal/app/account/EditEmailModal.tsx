"use client";

import { useState, type FormEvent } from "react";
import { deriveAuthKey } from "../../lib/crypto";
import { updateEmail, ApiError } from "../../lib/api";

interface Props {
  currentEmail: string;
  accountId: string;
  token: string;
  onClose: () => void;
  onSuccess: (newEmail: string) => void;
}

export default function EditEmailModal({ currentEmail, accountId, token, onClose, onSuccess }: Props) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!newEmail.includes("@")) { setError("Invalid email address"); return; }
    if (newEmail === currentEmail) { setError("New email must differ from current"); return; }
    if (!password) { setError("Password required"); return; }

    setLoading(true);
    setError("");
    try {
      const authKey = await deriveAuthKey(password, accountId);
      await updateEmail(newEmail, authKey, token);
      setDone(true);
      onSuccess(newEmail);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Email is already in use.");
      } else if (err instanceof ApiError && err.status === 401) {
        setError("Incorrect password.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to update email.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-white mb-1">Change email</h2>
        <p className="text-xs text-zinc-500 mb-4">Current: {currentEmail}</p>

        {done ? (
          <div className="space-y-3">
            <p className="text-sm text-amber-200">
              Email updated to <strong>{newEmail}</strong>. Check your inbox for a verification link.
              Until verified, paid features will be paused.
            </p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
            <input
              type="password"
              placeholder="Current master password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-sm transition-colors">{loading ? "Saving…" : "Save"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
