import { clamp01 } from "@shared/devices/motion";

type Caption = { from: number; to: number; text: string; accent?: string };

/** Stacked captions; each fades in at `from` and out at `to` (the last one stays). */
export default function Captions({ t, captions, fade }: { t: number; captions: Caption[]; fade: number }) {
  return (
    <div className="grid text-center">
      {captions.map((c, i) => {
        const fadeOut = i === captions.length - 1 ? 0 : clamp01((t - c.to + fade) / fade);
        const opacity = t < c.from ? 0 : clamp01((t - c.from) / fade) * (1 - fadeOut);
        return (
          <h2
            key={c.text}
            aria-hidden={opacity < 0.5}
            className="col-start-1 row-start-1 text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white"
            style={{ opacity, transform: `translateY(${(1 - opacity) * 12}px)` }}
          >
            {c.text}
            {c.accent && <span className="text-cyan-400"> {c.accent}</span>}
          </h2>
        );
      })}
    </div>
  );
}
