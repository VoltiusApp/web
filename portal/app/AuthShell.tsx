import Image from "next/image";
import type { ReactNode } from "react";

/** The centred card every signed-out page sits in. */
export default function AuthShell({ children, above, below }: {
  children: ReactNode;
  above?: ReactNode;
  below?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:repeating-linear-gradient(to_right,rgb(9,38,44)_0_1px,transparent_1px_72px),repeating-linear-gradient(to_bottom,rgb(9,38,44)_0_1px,transparent_1px_72px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

      <div className="w-full max-w-md">
        <a href="https://voltius.app" className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/logo.png" alt="Voltius" width={32} height={32} />
          <span className="text-white font-semibold text-lg">Voltius</span>
        </a>
        {above}
        <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 shadow-[0_0_60px_rgba(6,182,212,0.04)]">
          {children}
        </div>
        {below}
      </div>
    </main>
  );
}

export const PRIMARY_BUTTON =
  "w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-[#1e1e2e] disabled:text-zinc-500 disabled:cursor-default text-black font-semibold text-sm transition-all duration-200 hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]";

export function Field({
  label, type, value, onChange, inputRef, required, hint, readOnly,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  required?: boolean;
  hint?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-zinc-300">{label}</label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        readOnly={readOnly}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0a0f] border border-[#1e1e2e] text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 read-only:text-zinc-400 read-only:cursor-default transition-colors"
      />
      {hint && <p className="text-xs text-zinc-600 mt-0.5">{hint}</p>}
    </div>
  );
}

export const LINK = "text-cyan-400 hover:text-cyan-300 transition-colors";
