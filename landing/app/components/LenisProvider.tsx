"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { isLowPower } from "../hooks/useLowPower";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (isLowPower()) return;
    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      anchors: {
        offset: 64,
      },
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
