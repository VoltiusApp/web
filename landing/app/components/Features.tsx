"use client";

import { Icon } from "@iconify/react";
import { useFadeIn } from "../hooks/useFadeIn";
import { GITHUB_REPO_URL } from "../lib/github";

const features = [
  {
    icon: "devicon-plain:rust",
    title: "Native Rust performance",
    desc: "Built with Tauri + Rust. ~300MB RAM vs 500MB+ for Electron alternatives. No web engine overhead.",
  },
  {
    icon: "lucide:lock-keyhole",
    title: "Zero-knowledge E2EE sync",
    desc: "Your data is encrypted locally before leaving your device. We can't read it — and neither can attackers.",
  },
  {
    icon: "lucide:folder-sync",
    title: "SFTP with drag & drop",
    desc: "Transfer files between local, remote, or host-to-host with a native drag & drop interface.",
  },
  {
    icon: "devicon-plain:docker",
    title: "Docker management",
    desc: "Browse containers, volumes, and networks. Open terminals directly inside running containers.",
  },
  {
    icon: "lucide:puzzle",
    title: "Plugin system",
    desc: "Extend Voltius with first-party and community plugins. Gist Sync, port forwarding, and more.",
  },
  {
    icon: "lucide:hard-drive",
    title: "Local-first forever",
    desc: "No account required. Works fully offline. Your data lives on your machine, not our servers.",
  },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useFadeIn(index * 80);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="fade-in p-6 rounded-2xl border border-border bg-surface hover:border-cyan-500/40 hover:shadow-[0_0_24px_rgba(6,182,212,0.07)] transition-all duration-300 group"
    >
      <Icon
        icon={feature.icon}
        className="text-3xl text-cyan-400 mb-4 group-hover:scale-110 transition-transform duration-200"
      />
      <h3 className="font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200">
        {feature.title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
    </div>
  );
}

function OpenSourceCard({ index }: { index: number }) {
  const ref = useFadeIn(index * 80);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="fade-in col-span-1 md:col-span-2 lg:col-span-3 p-6 rounded-2xl border border-green-500/20 bg-green-500/5 hover:border-green-500/40 hover:shadow-[0_0_32px_rgba(34,197,94,0.07)] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-6"
    >
      <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <Icon icon="lucide:github" className="text-2xl text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-semibold text-white">Fully open source — AGPLv3</h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400">
            AGPLv3
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Every component — client, server, and crypto — is fully open source under AGPLv3.
          Audit the code, fork it, contribute back, or self-host the entire stack.
        </p>
      </div>
      <a
        href={GITHUB_REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 flex items-center gap-2 text-sm font-medium text-green-400 hover:text-green-300 border border-green-500/30 hover:border-green-500/60 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap"
      >
        <Icon icon="lucide:github" className="text-base" />
        View on GitHub
      </a>
    </div>
  );
}

export default function Features() {
  const headerRef = useFadeIn(0);

  return (
    <section id="features" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="fade-in text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-mono mb-3">— why voltius</p>
          <h2 className="text-4xl font-bold text-white">
            Built for engineers who care about their tools
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Every feature exists because the alternatives were either missing it or locked it
            behind a paid tier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
          <OpenSourceCard index={features.length} />
        </div>
      </div>
    </section>
  );
}
