"use client";

import { useState, type FormEvent } from "react";
import { getMe, updateHandle, ApiError } from "../../lib/api";

interface Props {
  currentHandle: string;
  token: string;
  onClose: () => void;
  onSuccess: (newHandle: string) => void;
}

const HANDLE_PATTERN = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

function isValidHandleFormat(h: string): boolean {
  return h.length >= 3 && h.length <= 30 && HANDLE_PATTERN.test(h);
}

export default function ChangeHandleModal({ currentHandle, token, onClose, onSuccess }: Props) {
  const [newHandle, setNewHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [savedHandle, setSavedHandle] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = newHandle.trim().toLowerCase().replace(/^@+/, "");
    if (!isValidHandleFormat(trimmed)) {
      setError("3-30 characters: lowercase letters, digits, hyphens, or underscores. Cannot start or end with a separator.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await updateHandle(trimmed, token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 402) {
        setError("Custom handles require Pro or above.");
      } else if (err instanceof ApiError && err.status === 409) {
        setError("That handle is taken.");
      } else if (err instanceof ApiError && err.status === 422) {
        setError("That handle isn't valid.");
      } else if (err instanceof ApiError && err.status === 429) {
        setError("You can only rename your handle once every 30 days.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to update handle.");
      }
      setLoading(false);
      return;
    }

    // The rename already committed above. This refetch is best-effort display
    // polish — its failure must not be reported as the rename having failed.
    let handle = trimmed;
    try {
      const me = await getMe(token);
      handle = me.handle;
    } catch {
      // fall back to the trimmed input we just saved
    }
    setSavedHandle(handle);
    setDone(true);
    setLoading(false);
    onSuccess(handle);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-white mb-1">Change handle</h2>
        <p className="text-xs text-zinc-500 mb-4">Current: @{currentHandle}</p>

        {done ? (
          <div className="space-y-3">
            <p className="text-sm text-green-400">Handle updated to <strong>@{savedHandle}</strong>.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="your-handle"
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              autoFocus
              maxLength={30}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
            />
            <p className="text-xs text-zinc-600 leading-relaxed">
              3-30 characters: lowercase letters, digits, hyphens, or underscores. Cannot start or end with a separator.
              You can rename again in 30 days.
            </p>
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
