"use client";

import Image from "next/image";
import { useFadeIn } from "../hooks/useFadeIn";

const shots = [
  {
    src: "/screenshots/command-palette.png",
    title: "Everything, one keystroke away",
    desc: "Jump to any host, session, snippet, or action from a single command palette.",
  },
  {
    src: "/screenshots/folders-tags.png",
    title: "Organize at scale",
    desc: "Group hosts into folders and label them with tags. Filter by role across your whole fleet.",
  },
  {
    src: "/screenshots/panes-grid.png",
    title: "Split panes & broadcast",
    desc: "Multiplex terminals in a grid and type one command into every pane at once.",
  },
  {
    src: "/screenshots/sftp-dual-pane.png",
    title: "Dual-pane SFTP",
    desc: "Move files between local, remote, or host-to-host with native drag & drop.",
  },
  {
    src: "/screenshots/teams-roles.png",
    title: "Team vaults & granular roles",
    desc: "Share access with your team and control exactly what each member can do.",
  },
  {
    src: "/screenshots/themes-creator.png",
    title: "Make it yours",
    desc: "A full theme editor — window colors, borders, and the entire terminal ANSI palette.",
  },
];

function ShotCard({ shot, index }: { shot: (typeof shots)[0]; index: number }) {
  const ref = useFadeIn((index % 2) * 80);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="fade-in group rounded-2xl overflow-hidden border border-border bg-surface hover:border-cyan-500/40 hover:shadow-[0_0_32px_rgba(6,182,212,0.08)] transition-all duration-300"
    >
      <div className="relative aspect-[1600/1148] bg-[#0b1f24]">
        <Image
          src={shot.src}
          alt={shot.title}
          fill
          sizes="(max-width: 768px) 100vw, 560px"
          className="object-cover"
        />
      </div>
      <div className="p-5 border-t border-border">
        <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors duration-200">
          {shot.title}
        </h3>
        <p className="mt-1 text-sm text-zinc-400 leading-relaxed">{shot.desc}</p>
      </div>
    </div>
  );
}

export default function Showcase() {
  const headerRef = useFadeIn(0);

  return (
    <section id="showcase" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="fade-in text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-mono mb-3">— a look inside</p>
          <h2 className="text-4xl font-bold text-white">Polished, and fast where it counts</h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            The same client, from a first connection to a shared team vault.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shots.map((s, i) => (
            <ShotCard key={s.src} shot={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
