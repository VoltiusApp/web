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
    <div className="relative group">
      <code className="block text-xs font-mono text-amber-300 bg-[#0a0a0f] px-3 py-2 pr-10 rounded-lg break-all">
        {command}
      </code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="absolute top-1/2 right-1.5 -translate-y-1/2 p-1.5 rounded-md text-zinc-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
      >
        <Icon
          icon={copied ? "lucide:check" : "lucide:copy"}
          className={`text-sm ${copied ? "text-green-400" : ""}`}
        />
      </button>
    </div>
  );
}
