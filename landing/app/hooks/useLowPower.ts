"use client";

import { useSyncExternalStore } from "react";

let lowPower: boolean | undefined;

// No hardware-accelerated WebGL means the browser composites the page in software.
export function isLowPower(): boolean {
  if (lowPower === undefined) {
    const gl = document.createElement("canvas").getContext("webgl", { failIfMajorPerformanceCaveat: true });
    lowPower = !gl;
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  }
  return lowPower;
}

const subscribe = () => () => {};

export function useLowPower() {
  return useSyncExternalStore(subscribe, isLowPower, () => false);
}
