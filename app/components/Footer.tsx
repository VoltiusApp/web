import { Icon } from "@iconify/react";
import Image from "next/image";
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
          <a href="#" className="hover:text-zinc-300 transition-colors">
            Docs
          </a>
          <a href="#pricing" className="hover:text-zinc-300 transition-colors">
            Pricing
          </a>
          <a
            href="mailto:contact@voltius.app"
            className="hover:text-zinc-300 transition-colors"
          >
            Contact
          </a>
          <a href="/terms" className="hover:text-zinc-300 transition-colors">
            Terms
          </a>
          <a href="/privacy" className="hover:text-zinc-300 transition-colors">
            Privacy
          </a>
          <a href="/legal" className="hover:text-zinc-300 transition-colors">
            Legal
          </a>
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
