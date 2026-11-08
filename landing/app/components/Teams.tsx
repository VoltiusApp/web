"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { planById, trialCardLabel, trialLabel } from "@shared/plans";
import { useFadeIn } from "../hooks/useFadeIn";
import { useMediaQuery } from "../hooks/useMediaQuery";

const teams = planById("teams");
const ADVANCE_MS = 7000;
const CLIP_MS = 26000;

type Shot = { src: string; w: number; h: number; alt: string; label?: string };
type Clip = { src: string; poster: string; w: number; h: number; alt: string; labels: { text: string; top: string }[] };
type Item = {
  id: string;
  tab: string;
  title: string;
  desc: string;
  shots: Shot[];
  clip?: Clip;
  /** How long the tab stays up before auto-advancing. Defaults to ADVANCE_MS. */
  ms?: number;
};

const items: Item[] = [
  {
    id: "vaults",
    tab: "Team vaults",
    title: "One vault for the whole team",
    desc: "Hosts, keys, identities and snippets live in a shared vault. Everyone works from the same fleet, synced in real time.",
    shots: [{ src: "/teams/team-vaults.webp", w: 1352, h: 645, alt: "The Acme Team vault: shared hosts with tags and live latency" }],
  },
  {
    id: "sharing",
    tab: "Live terminals",
    title: "Debug in the same terminal",
    desc: "Share a live session with a teammate or a guest. Everyone sees the same output. You keep the keyboard until you hand over control.",
    shots: [],
    clip: {
      src: "/teams/teams-live-v3.mp4",
      poster: "/teams/teams-live-v3-poster.webp",
      w: 1000,
      h: 804,
      alt: "Alice shares a terminal with her team. Bob joins, asks for control, and rolls back the API while Alice watches.",
      labels: [
        { text: "alice", top: "1.2%" },
        { text: "bob", top: "51.2%" },
      ],
    },
    ms: CLIP_MS,
  },
  {
    id: "roles",
    tab: "Roles",
    title: "Access by role, down to Connect-Only",
    desc: "Owner, Manager, Editor, Member and Connect-Only. Connect-Only members open connections without ever seeing the credentials behind them.",
    shots: [{ src: "/teams/teams-roles.webp", w: 1352, h: 900, alt: "Built-in team roles and what each one can do" }],
  },
  {
    id: "audit",
    tab: "Audit log",
    title: "Know who did what, and when",
    desc: "Invites, role changes, connections and revealed secrets land in one timeline. Filter by member, event or date, then export it.",
    shots: [{ src: "/teams/teams-audit-logs.webp", w: 1352, h: 626, alt: "The team audit log: alice invited bob, bob joined, hosts created" }],
  },
];

function Window({ shot, className = "" }: { shot: Shot; className?: string }) {
  return (
    <figure className={`relative rounded-xl overflow-hidden border border-white/10 bg-[#0b1220] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ${className}`}>
      <Image src={shot.src} alt={shot.alt} width={shot.w} height={shot.h} sizes="(max-width: 1024px) 100vw, 680px" className="block w-full h-auto" />
      {shot.label && (
        <figcaption className="absolute left-1/2 -translate-x-1/2 top-2 text-[11px] font-mono px-2 py-1 rounded-md bg-black/70 text-zinc-200 border border-white/10">
          {shot.label}
        </figcaption>
      )}
    </figure>
  );
}

function ClipWindow({ clip, active }: { clip: Clip; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);
  return (
    <figure className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#0b0f17] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
      <video
        ref={ref}
        src={clip.src}
        poster={clip.poster}
        width={clip.w}
        height={clip.h}
        muted
        playsInline
        preload="metadata"
        aria-label={clip.alt}
        className="block w-full h-auto"
      />
      {clip.labels.map((l) => (
        <figcaption
          key={l.text}
          style={{ top: l.top }}
          className="absolute left-1/2 -translate-x-1/2 text-[11px] font-mono px-2 py-0.5 rounded-md bg-black/70 text-zinc-200 border border-white/10"
        >
          {l.text}
        </figcaption>
      ))}
    </figure>
  );
}

function Stage({ item, active }: { item: Item; active: boolean }) {
  const duo = item.shots.length > 1;
  if (item.clip) {
    return (
      <div
        aria-hidden={!active}
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out ${
          active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div className="h-full max-w-full aspect-[1000/804] flex items-center">
          <ClipWindow clip={item.clip} active={active} />
        </div>
      </div>
    );
  }
  return (
    <div
      aria-hidden={!active}
      className={`absolute inset-0 transition-all duration-500 ease-out ${
        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
      }`}
    >
      {duo ? (
        <div className="relative h-full flex flex-col justify-center gap-4">
          <Window shot={item.shots[0]} className="w-[92%]" />
          <Window shot={item.shots[1]} className="w-[92%] self-end ring-1 ring-cyan-400/30" />
        </div>
      ) : (
        <div className="h-full flex items-center">
          <Window shot={item.shots[0]} className="w-full" />
        </div>
      )}
    </div>
  );
}

function KeyWrap() {
  const steps = [
    { icon: "lucide:laptop", who: "Your device", what: "Encrypts the vault and wraps its key for each member with their public key (X25519)." },
    { icon: "lucide:cloud", who: "Voltius Cloud", what: "Stores the wrapped keys and the encrypted vault. Nothing it can read." },
    { icon: "lucide:user-round-check", who: "Your teammate", what: "Unwraps the key with their private key and opens the vault." },
  ];
  return (
    <div className="mt-20 rounded-2xl border border-border bg-surface/60 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-6">
        <h3 className="text-lg font-semibold text-white">Shared, still zero-knowledge</h3>
        <p className="text-sm text-zinc-400">What happens when you invite someone</p>
      </div>
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
        {steps.map((s, i) => (
          <li key={s.who} className="relative flex md:flex-col gap-3 md:pr-10">
            <div className="flex items-center gap-3 md:w-full">
              <span className={`shrink-0 grid place-items-center w-9 h-9 rounded-lg font-mono text-sm border ${
                i === 1 ? "border-zinc-700 text-zinc-400" : "border-cyan-500/50 text-cyan-400 bg-cyan-500/10"
              }`}>
                <Icon icon={s.icon} width={18} height={18} />
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden className="hidden md:flex flex-1 items-center mr-4 text-zinc-600">
                  <span className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 via-zinc-700 to-zinc-700 [background-size:8px_1px]" />
                  <Icon icon="lucide:chevron-right" width={14} height={14} />
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white">{s.who}</p>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{s.what}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Teams() {
  const headerRef = useFadeIn(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [tick, setTick] = useState(0);
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (paused || reduce) return;
    timer.current = setTimeout(() => setActive((a) => (a + 1) % items.length), items[active].ms ?? ADVANCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, paused, reduce, tick]);

  const select = (i: number) => {
    setActive(i);
    setTick((t) => t + 1);
  };

  return (
    <section id="teams" className="relative py-28 px-6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(6,182,212,0.10),transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto">
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className="fade-in grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-end mb-14">
          <div>
            <p className="text-cyan-400 text-sm font-mono mb-3">— for teams</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight text-balance">
              Share the fleet. Keep the keys secret.
            </h2>
          </div>
          <p className="text-zinc-400 leading-relaxed md:pb-1">
            Give your team one place for every host, key and snippet. Team vaults are encrypted on each
            member&apos;s device, so the server only ever relays ciphertext.
          </p>
        </div>

        <div
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div role="tablist" aria-label="Team features" className="flex flex-col gap-2 min-w-0">
            {items.map((it, i) => {
              const on = i === active;
              return (
                <button
                  key={it.id}
                  role="tab"
                  id={`teams-tab-${it.id}`}
                  aria-selected={on}
                  aria-controls="teams-stage"
                  onClick={() => select(i)}
                  className={`group relative text-left rounded-xl px-5 py-4 border transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                    on ? "border-cyan-500/40 bg-cyan-500/[0.06]" : "border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  <span className={`block text-xs font-mono uppercase tracking-widest ${on ? "text-cyan-400" : "text-zinc-500"}`}>
                    {it.tab}
                  </span>
                  <span className={`mt-1 block font-semibold ${on ? "text-white" : "text-zinc-300"}`}>{it.title}</span>
                  <span className={`grid transition-all duration-300 ${on ? "grid-rows-[1fr] mt-2" : "grid-rows-[0fr]"}`}>
                    <span className="overflow-hidden text-sm text-zinc-400 leading-relaxed">{it.desc}</span>
                  </span>
                  {on && !reduce && (
                    <span aria-hidden className="absolute left-5 right-5 bottom-0 h-px bg-zinc-800 overflow-hidden">
                      <span
                        key={`${active}-${tick}`}
                        className="block h-full bg-cyan-400 origin-left"
                        style={{
                          animation: `teams-progress ${it.ms ?? ADVANCE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div id="teams-stage" role="tabpanel" aria-labelledby={`teams-tab-${items[active].id}`} className="relative aspect-[4/3] min-w-0">
            {items.map((it, i) => (
              <Stage key={it.id} item={it} active={i === active} />
            ))}
          </div>
        </div>

        <KeyWrap />

        <div className="mt-12 flex flex-col sm:flex-row sm:items-center gap-4">
          <a
            href="#pricing"
            className="inline-flex justify-center text-sm font-medium px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black transition-all duration-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
          >
            Try Teams free for {teams?.trial?.days ?? 14} days
          </a>
          <a
            href="https://docs.voltius.app/self-hosting/"
            className="inline-flex justify-center text-sm font-medium px-5 py-2.5 rounded-xl border border-border hover:border-zinc-600 text-zinc-300 hover:text-white transition-colors"
          >
            Self-host the server
          </a>
          <p className="text-xs text-zinc-500 sm:ml-2 leading-relaxed">
            {teams?.trial ? `${trialLabel(teams.trial)}, ${trialCardLabel(teams.trial)}. ` : ""}
            Self-hosted servers unlock every team feature.
          </p>
        </div>
      </div>
    </section>
  );
}
