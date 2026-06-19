"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

type Platform = "android" | "ios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.voltius.app";

export default function MobileWaitlistForm({
  name,
  icon,
  platform,
  className = "",
}: {
  name: string;
  icon: string;
  platform: Platform;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  // Hover reveals on desktop; touch devices have no hover, so tapping the header
  // toggles the same panel — mirrors DownloadCards.
  const [open, setOpen] = useState(false);

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

  const disabled = status === "submitting" || status === "success";

  return (
    <div
      className={`group relative rounded-2xl border border-border bg-surface transition-all hover:border-zinc-600 hover:bg-[#16161f] focus-within:border-zinc-600 focus-within:bg-[#16161f] ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full relative flex flex-col items-center gap-3 p-6"
      >
        <span className="absolute top-3 right-3 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          Soon
        </span>
        <Icon icon={icon} className="text-4xl text-zinc-300" />
        <div>
          <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {name}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5">Join the waitlist</p>
        </div>
      </button>

      <div
        className={`overflow-hidden px-3 transition-all duration-500 ease-out group-hover:max-h-96 group-hover:pb-3 group-hover:opacity-100 group-focus-within:max-h-96 group-focus-within:pb-3 group-focus-within:opacity-100 ${
          open ? "max-h-96 pb-3 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <form onSubmit={handleSubmit} className="border-t border-white/5 pt-3">
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
            disabled={disabled}
            className="w-full rounded-lg border border-border bg-black/20 px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none transition-colors focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled}
            className="mt-2 w-full rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-black transition-all hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {status === "submitting"
              ? "Joining..."
              : status === "success"
                ? "You're on the list"
                : "Notify me"}
          </button>
          <p
            className={`mt-2 min-h-4 text-center text-[11px] ${
              status === "error" ? "text-red-400" : "text-zinc-600"
            }`}
          >
            {status === "error"
              ? "Could not join. Try again."
              : "No spam. Just the launch email."}
          </p>
        </form>
      </div>
    </div>
  );
}
