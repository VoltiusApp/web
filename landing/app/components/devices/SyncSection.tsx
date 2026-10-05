"use client";

import { SYNC_CAPTIONS, SYNC_LAYOUTS, SyncScene } from "@shared/devices/SyncScene";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Captions from "./Captions";
import ScrollScene from "./ScrollScene";
import Still from "./Still";

export default function SyncSection() {
  const layout = useMediaQuery("(max-width: 640px)") ? "tall" : "wide";
  return (
    <ScrollScene
      id="sync"
      length="260vh"
      size={SYNC_LAYOUTS[layout]}
      header={(p) => (
        <>
          <p className="hidden sm:block text-xs font-mono uppercase tracking-widest text-cyan-400">Bring-your-own sync</p>
          <Captions t={p} captions={SYNC_CAPTIONS} fade={0.04} />
          <p className="max-w-xl text-center text-xs sm:text-sm text-zinc-400">
            Hosts and keys are encrypted on the device before they leave it. Sync through an S3 bucket, Cloudflare R2 or a private GitHub Gist you own, with no Voltius server in the path.
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
