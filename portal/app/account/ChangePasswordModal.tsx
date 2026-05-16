"use client";

import { useState, type FormEvent } from "react";
import { deriveAuthKey, deriveKek, wrapUserSecrets, base64ToBytes, bytesToBase64, unwrapUserSecretsDek, unwrapUserSecretsX25519 } from "../../lib/crypto";
import { getMe, updatePassword, ApiError } from "../../lib/api";

interface Props {
  accountId: string;
  token: string;
  onClose: () => void;
  onSuccess: (newToken: string, newRefreshToken: string) => void;
}

export default function ChangePasswordModal({ accountId, token, onClose, onSuccess }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword) { setError("Current password required"); return; }
    if (newPassword.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPassword === currentPassword) { setError("New password must differ from current"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match"); return; }

    setLoading(true);
    setError("");
    try {
      const me = await getMe(token);
      if (!me.wrapped_user_secrets) {
        setError("Open the Voltius desktop app once to finish setting up your account, then come back here to change your password.");
        setLoading(false);
        return;
      }

      const oldKek = await deriveKek(currentPassword, accountId);
      const wrappedBytes = base64ToBytes(me.wrapped_user_secrets);
      const [dek, x25519Private] = await Promise.all([
        unwrapUserSecretsDek(oldKek, wrappedBytes),
        unwrapUserSecretsX25519(oldKek, wrappedBytes),
      ]);

      const [oldAuthKey, newAuthKey, newKek] = await Promise.all([
        deriveAuthKey(currentPassword, accountId),
        deriveAuthKey(newPassword, accountId),
        deriveKek(newPassword, accountId),
      ]);

      const newWrappedBytes = await wrapUserSecrets(newKek, dek, x25519Private);
      const newWrappedUserSecrets = bytesToBase64(newWrappedBytes);

      const auth = await updatePassword(oldAuthKey, newAuthKey, newWrappedUserSecrets, token);
      setDone(true);
      onSuccess(auth.jwt_token, auth.refresh_token);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Current password is incorrect.");
      } else {
        setError(err instanceof Error ? err.message : "Password change failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-[#1e1e2e] bg-[#111118] p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-white mb-4">Change master password</h2>

        {done ? (
          <div className="space-y-3">
            <p className="text-sm text-green-400">Password changed successfully. You are still logged in.</p>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors">Done</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors" />
            <input type="password" placeholder="New password (min 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors" />
            <input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors" />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#1e1e2e] hover:border-zinc-600 text-zinc-400 hover:text-white text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-semibold text-sm transition-colors">{loading ? "Changing…" : "Change password"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
