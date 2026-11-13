"use client";

import { useEffect, useState } from "react";
import { getMeta, type ServerMeta } from "./api";

let metaPromise: Promise<ServerMeta | null> | null = null;

/** Null when the server could not be asked; callers then keep the hosted behaviour. */
export function useServerMeta(): ServerMeta | null | undefined {
  const [meta, setMeta] = useState<ServerMeta | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    metaPromise ??= getMeta().catch(() => null);
    void metaPromise.then((m) => { if (live) setMeta(m); });
    return () => { live = false; };
  }, []);
  return meta;
}
