"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useScrollProgress } from "../../hooks/useScrollProgress";

type Size = { w: number; h: number };

/** Scales a fixed-size canvas to the width it is given. */
function Canvas({ size, children }: { size: Size; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / size.w));
    observer.observe(el);
    return () => observer.disconnect();
  }, [size.w]);

  return (
    <div ref={ref} className="relative" style={{ aspectRatio: `${size.w} / ${size.h}`, width: `min(100%, calc((100svh - 20rem) * ${size.w / size.h}))` }}>
      {scale > 0 && (
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: size.w, height: size.h, transform: `scale(${scale})` }}>
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
  size = { w: 1920, h: 1080 },
}: {
  id?: string;
  length: string;
  size?: Size;
  header: (progress: number) => ReactNode;
  scene: (progress: number) => ReactNode;
}) {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [ref, progress] = useScrollProgress<HTMLElement>();
  const p = reduced ? 1 : progress;

  return (
    <section id={id} ref={ref} className="relative" style={{ height: reduced ? undefined : length }}>
      <div className={`${reduced ? "py-24" : "sticky top-0 h-svh pt-20"} flex flex-col items-center justify-center gap-6 overflow-hidden px-6`}>
        {header(p)}
        <Canvas size={size}>{scene(p)}</Canvas>
      </div>
    </section>
  );
}
