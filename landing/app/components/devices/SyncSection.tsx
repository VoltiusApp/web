"use client";

import { SYNC_LAYOUTS, SyncScene, syncCaptions } from "@shared/devices/SyncScene";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Captions from "./Captions";
import ScrollScene from "./ScrollScene";
import ProTrialLink from "./ProTrialLink";
import Still from "./Still";

const CAPTIONS = syncCaptions("cloud");

export default function SyncSection() {
  const layout = useMediaQuery("(max-width: 640px)") ? "tall" : "wide";
  return (
    <ScrollScene
      id="sync"
      length="260vh"
      size={SYNC_LAYOUTS[layout]}
      header={(p) => (
        <>
          <p className="hidden sm:block text-xs font-mono uppercase tracking-widest text-cyan-400">End-to-end encrypted sync</p>
          <Captions t={p} captions={CAPTIONS} fade={0.04} />
          <p className="max-w-xl text-center text-xs sm:text-sm text-zinc-400">
            Hosts, keys and settings are encrypted on your device before they leave it. Voltius Cloud syncs them in real time and only ever stores ciphertext.{" "}
            <ProTrialLink />
            <span className="block mt-1 text-zinc-500">
              Prefer your own storage? Gist, Cloudflare R2 and S3 sync stay free, or{" "}
              <a href="https://github.com/VoltiusApp/voltius-plugin-template" className="underline hover:text-zinc-300">
                build your own sync provider
              </a>{" "}
              as a plugin.
            </span>
          </p>
        </>
      )}
      scene={(p) => (
        <SyncScene
          p={p}
          layout={layout}
          mono="var(--font-geist-mono), ui-monospace, monospace"
          laptopScreen={<Still src="/screenshots/folders-tags.png" alt="Voltius hosts on a laptop" show={1} />}
          phoneScreen={<Still src="/devices/phone-hosts.webp" alt="The same hosts on an Android phone" show={1} />}
        />
      )}
    />
  );
}
