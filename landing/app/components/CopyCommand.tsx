"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    // inline-flex → the box hugs its content (button sits right after the text);
    // max-w-full + min-w-0 on the code let it wrap inside narrow parents (cards).
    <div className="inline-flex max-w-full items-start gap-2.5 rounded-xl border border-white/12 bg-white/5 px-3.5 py-2.5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.10)]">
      <span className="select-none pt-px font-mono text-xs leading-5 text-cyan-400/70">$</span>
      <code className="min-w-0 font-mono text-xs leading-5 text-zinc-200 break-all">
        {command}
      </code>
      <button
        type="button"
        onClick={(e) => {
          const btn = e.currentTarget;
          onCopy();
          // Drop focus on pointer clicks so a focus-within-expanded parent (the
          // download card) collapses once the cursor leaves. Keep focus for
          // keyboard activation (e.detail === 0) so tab users don't lose place.
          if (e.detail !== 0) btn.blur();
        }}
        aria-label={copied ? "Copied" : "Copy command"}
        className="-my-1 -mr-1 shrink-0 self-start rounded-lg p-1.5 text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
      >
        <Icon
          icon={copied ? "lucide:check" : "lucide:copy"}
          className={`text-sm ${copied ? "text-green-400" : ""}`}
        />
      </button>
    </div>
  );
}
