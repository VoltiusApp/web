"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

type Platform = "android" | "ios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.voltius.app";

export default function MobileWaitlistForm({
  name,
  icon,
  platform,
}: {
  name: string;
  icon: string;
  platform: Platform;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch(`${API_URL}/v1/mobile-waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          platform,
          source: "landing-download",
        }),
      });

      if (!response.ok) throw new Error("Waitlist signup failed");

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface p-5 text-left transition-all hover:border-zinc-600 hover:bg-[#16161f] focus-within:border-cyan-500/60"
    >
      <div className="flex items-center gap-3">
        <Icon icon={icon} className="text-4xl text-zinc-400" />
        <div>
          <p className="font-semibold text-white">{name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">Mobile app in development</p>
        </div>
      </div>

      <label className="sr-only" htmlFor={`${platform}-waitlist-email`}>
        Email for {name} launch notification
      </label>
      <input
        id={`${platform}-waitlist-email`}
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        disabled={status === "submitting" || status === "success"}
        className="mt-4 w-full rounded-xl border border-border bg-black/20 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <button
        type="submit"
        disabled={status === "submitting" || status === "success"}
        className="mt-3 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
      >
        {status === "submitting" ? "Joining..." : status === "success" ? "You're on the list" : "Notify me"}
      </button>

      <p
        className={`mt-3 min-h-4 text-center text-xs ${
          status === "error" ? "text-red-400" : "text-zinc-600"
        }`}
      >
        {status === "error" ? "Could not join the list. Try again." : "No spam. Just the launch email."}
      </p>
    </form>
  );
}
