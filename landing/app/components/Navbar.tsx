"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { GITHUB_API_REPO_URL, GITHUB_REPO_URL } from "../lib/github";
import { X_URL } from "../lib/site";

const links = [
  { label: "Features", href: "/#features" },
  { label: "Demo", href: "/#demo" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Download", href: "/#download" },
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
    fetch(GITHUB_API_REPO_URL)
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
        <Link href="/" className="flex items-center gap-2 font-semibold text-white text-sm">
          <Image src="/logo.png" alt="Voltius" width={28} height={28} />
          Voltius
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-400 leading-none">
            Beta
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              {l.href.startsWith("/") ? (
                <Link
                  href={l.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  href={l.href}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center text-zinc-400 hover:text-white transition-colors"
            aria-label="X (Twitter)"
          >
            <Icon icon="ri:twitter-x-fill" className="text-base" />
          </a>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group hidden md:flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white border border-border hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Icon icon="lucide:github" className="text-base" />
            {stars !== null && (
              <>
                <span className="w-px h-3.5 bg-zinc-700" />
                <Icon
                  icon="lucide:star"
                  className="text-sm group-hover:hidden"
                />
                <Icon
                  icon="mdi:star"
                  className="text-sm hidden group-hover:block text-amber-400 [filter:drop-shadow(0_0_4px_theme(colors.amber.400))]"
                />
                <span className="font-medium">{formatStars(stars)}</span>
              </>
            )}
          </a>

          <a
            href="https://app.voltius.app"
            className="hidden md:inline-flex text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign in
          </a>
        </div>
      </nav>
    </header>
  );
}
