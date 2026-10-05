"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollProgress } from "../../hooks/useScrollProgress";

const CANVAS_W = 1920;

/** Scales a 1920×1080 canvas to the width it is given. */
function Canvas({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / CANVAS_W));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-video w-[min(100%,calc((100svh-16rem)*16/9))]">
      {scale > 0 && (
        <div className="absolute left-0 top-0 h-[1080px] w-[1920px] origin-top-left" style={{ transform: `scale(${scale})` }}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Pins a scene while the visitor scrolls through `length`, feeding it progress 0 → 1.
 * With reduced motion it renders the end state once, unpinned.
 */
export default function ScrollScene({
  id,
  length,
  header,
  scene,
}: {
  id?: string;
  length: string;
  header: (progress: number) => ReactNode;
  scene: (progress: number) => ReactNode;
}) {
  const reduced = useReducedMotion();
  const [ref, progress] = useScrollProgress<HTMLElement>();
  const p = reduced ? 1 : progress;

  return (
    <section id={id} ref={ref} className="relative" style={{ height: reduced ? undefined : length }}>
      <div className={`${reduced ? "py-24" : "sticky top-0 h-svh pt-20"} flex flex-col items-center justify-center gap-6 overflow-hidden px-6`}>
        {header(p)}
        <Canvas>{scene(p)}</Canvas>
      </div>
    </section>
  );
}
