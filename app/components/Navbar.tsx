"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

const links = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "Pricing", href: "#pricing" },
  { label: "Download", href: "#download" },
];

function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("https://api.github.com/repos/Voltius/voltius")
      .then((r) => r.json())
      .then((d) => typeof d.stargazers_count === "number" && setStars(d.stargazers_count))
      .catch(() => {});
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-3 transition-all duration-300">
      <nav
        className={`mx-auto max-w-6xl h-16 px-6 flex items-center justify-between rounded-2xl border transition-all duration-300 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_14px_40px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.14)] ${
          scrolled
            ? "bg-white/6 border-white/12"
            : "bg-transparent border-transparent shadow-none"
        }`}
      >
        <a href="#" className="flex items-center gap-2 font-semibold text-white text-sm">
          <Image src="/logo.png" alt="Voltius" width={28} height={28} />
          Voltius
        </a>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Voltius/voltius"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white border border-border hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Icon icon="lucide:github" className="text-base" />
            <span>Star</span>
            {stars !== null && (
              <>
                <span className="w-px h-3.5 bg-zinc-700" />
                <span className="text-zinc-300 font-medium">{formatStars(stars)}</span>
              </>
            )}
          </a>

          <a
            href="#download"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black transition-colors"
          >
            Download
          </a>
        </div>
      </nav>
    </header>
  );
}
