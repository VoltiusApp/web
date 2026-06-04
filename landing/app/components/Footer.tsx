import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { GITHUB_REPO_URL } from "../lib/github";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1e1e2e] py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Voltius" width={20} height={20} />
          <span className="font-medium text-zinc-400">Voltius</span>
          <span className="text-zinc-700">·</span>
          <span>© {currentYear} Killian Pavy</span>
          <span className="text-zinc-700">·</span>
          <span>AGPLv3</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href={GITHUB_REPO_URL}
            className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <Icon icon="lucide:github" className="text-base" />
            GitHub
          </a>
          <a
            href="https://x.com/VoltiusApp"
            target="_blank"
            rel="noreferrer"
            aria-label="Voltius on X"
            className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
            </svg>
          </a>
          <a href="https://docs.voltius.app" className="hover:text-zinc-300 transition-colors">
            Docs
          </a>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">
            Blog
          </Link>
          <Link href="/#pricing" className="hover:text-zinc-300 transition-colors">
            Pricing
          </Link>
          <a href="mailto:contact@voltius.app" className="hover:text-zinc-300 transition-colors">
            Contact
          </a>
          <Link href="/terms" className="hover:text-zinc-300 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy
          </Link>
          <Link href="/legal" className="hover:text-zinc-300 transition-colors">
            Legal
          </Link>
          <a
            href="https://voltius.instatus.com/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition-colors"
          >
            Status
          </a>
        </div>
      </div>
    </footer>
  );
}
