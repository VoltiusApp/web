"use client";

import Image from "next/image";
import { useFadeIn } from "../hooks/useFadeIn";
import { GITHUB_REPO_URL } from "../lib/github";

const badges = [
  { label: "Built with Rust", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
  { label: "E2EE", color: "text-green-400 border-green-400/30 bg-green-400/10" },
  { label: "Cross-platform", color: "text-violet-400 border-violet-400/30 bg-violet-400/10" },
  { label: "Local-first", color: "text-zinc-300 border-zinc-600 bg-zinc-800/50" },
  { label: "Open-core · AGPLv3", color: "text-green-400 border-green-500/30 bg-green-500/10", href: GITHUB_REPO_URL },
];

export default function Hero() {
  const badgesRef = useFadeIn(0);
  const headlineRef = useFadeIn(100);
  const subRef = useFadeIn(200);
  const subMetaRef = useFadeIn(240);
  const ctaRef = useFadeIn(300);
  const demoRef = useFadeIn(420);

  return (
    <section className="relative isolate min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none [background-position:0_25px] [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_center,black_24%,transparent_58%)]"
      />

      {/* Ambient glow — two layers for depth */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-cyan-500/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-75 h-50 bg-cyan-400/6 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo */}
      <div
        ref={badgesRef as React.RefObject<HTMLDivElement>}
        className="fade-in flex flex-col items-center gap-6 mb-8"
      >
        <Image src="/logo.png" alt="Voltius" width={72} height={72} loading="eager" className="shadow-lg shadow-black/40" />

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {badges.map((b) => {
            const cls = `text-xs font-mono px-3 py-1 rounded-full border transition-opacity ${b.color}`;
            return "href" in b ? (
              <a key={b.label} href={b.href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-80`}>
                {b.label}
              </a>
            ) : (
              <span key={b.label} className={cls}>{b.label}</span>
            );
          })}
        </div>
      </div>

      {/* Headline */}
      <h1
        ref={headlineRef as React.RefObject<HTMLHeadingElement>}
        className="fade-in text-5xl md:text-7xl font-bold tracking-tight text-white max-w-3xl leading-[1.1]"
      >
        The {" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-600">
          Must have
        </span>
        {" "} SSH client for everyone.
      </h1>

      <p
        ref={subRef as React.RefObject<HTMLParagraphElement>}
        className="fade-in mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed"
      >
        Blazingly fast, local-first SSH client built with Rust and Tauri
      </p>
      <p
        ref={subMetaRef as React.RefObject<HTMLParagraphElement>}
        className="fade-in mt-2 text-sm text-zinc-500 max-w-xl"
      >
        Free • Open Source • No Account Required
      </p>

      {/* CTAs */}
      <div
        ref={ctaRef as React.RefObject<HTMLDivElement>}
        className="fade-in mt-10 flex flex-col sm:flex-row gap-4 items-center"
      >
        <a
          href="#download"
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-all duration-200 shadow-[0_0_0_0_rgba(6,182,212,0)] hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]"
        >
          Download
        </a>
        <a
          href="#demo"
          className="px-6 py-3 rounded-xl border border-[#1e1e2e] bg-surface hover:border-zinc-600 text-zinc-300 hover:text-white text-sm transition-all duration-200"
        >
          See it in action ↓
        </a>
      </div>

      {/* Demo GIF */}
      <div
        ref={demoRef as React.RefObject<HTMLDivElement>}
        id="demo"
        className="fade-in mt-20 w-full max-w-5xl rounded-2xl overflow-hidden border border-border ring-1 ring-cyan-400/20 shadow-[0_0_60px_rgba(34,211,238,0.22),0_28px_70px_rgba(0,0,0,0.65)]"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs text-zinc-500 font-mono">voltius</span>
        </div>
        <div className="bg-[#0d0d12] aspect-video">
          <img
            src="/demo.gif"
            alt="Voltius demo"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
