"use client";

import { useFadeIn } from "../hooks/useFadeIn";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Everything you need, no account required.",
    highlight: false,
    cta: "Download",
    ctaHref: "#download",
    features: [
      "All core SSH features",
      "SFTP with drag & drop",
      "Docker & serial console",
      "Gist E2EE sync (free)",
      "Plugin system",
      "Custom themes",
      "Local terminal",
      "Port forwarding",
      "Snippets & command palette",
      "Import / Export (no lock-in)",
    ],
  },
  {
    name: "Pro",
    price: "$7",
    period: "/ month",
    billingNote: "billed annually",
    monthlyOption: "or $9 billed monthly",
    savings: "Save 22% with annual billing",
    desc: "Real-time sync and unlimited vaults for power users.",
    highlight: true,
    trial: "14-day free trial",
    cta: "Start free trial",
    ctaHref: "https://app.voltius.app/signup?plan=pro",
    features: [
      "Everything in Free",
      "Real-time cloud sync (CRDTs)",
      "Sub-second updates via SSE",
      "Unlimited private vaults",
      "Share terminal (1 guest)",
    ],
  },
  {
    name: "Teams",
    price: "$15",
    period: "/ user / month",
    billingNote: "billed annually",
    monthlyOption: "or $18 billed monthly",
    savings: "Save 17% with annual billing",
    desc: "Shared vaults, live terminals, and access control for teams (3-user minimum).",
    highlight: false,
    trial: "14-day free trial",
    trialNote: "card required",
    cta: "Start free trial",
    ctaHref: "https://app.voltius.app/signup?plan=teams",
    features: [
      "Everything in Pro",
      "Team vaults & invites",
      "Shared terminals (unlimited guests)",
      "Granular permissions & roles",
      "Audit logging",
    ],
  },
  {
    name: "Business",
    price: "$30",
    period: "/ user / month",
    desc: "Self-hosted backend with SLA and dedicated support.",
    highlight: false,
    cta: "Contact us",
    ctaHref: "mailto:contact@voltius.app",
    features: [
      "Everything in Teams",
      "On-premise self-hosted deployment",
      "Commercial license exception",
      "SLA & dedicated support",
      "Custom contracts",
    ],
  },
];

function PricingCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const ref = useFadeIn(index * 80);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`fade-in relative rounded-2xl border p-6 flex flex-col gap-6 transition-all duration-300 ${
        plan.highlight
          ? "border-cyan-500/50 bg-cyan-500/5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20"
          : "border-border bg-surface hover:border-zinc-700 hover:shadow-[0_0_24px_rgba(255,255,255,0.03)]"
      }`}
    >
      {plan.highlight && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500 text-black">
          Recommended
        </span>
      )}

      <div>
        <p className="text-sm font-medium text-zinc-400">{plan.name}</p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{plan.price}</span>
          {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
        </div>
        {"billingNote" in plan && plan.billingNote && (
          <p className="mt-1 text-xs text-zinc-500">{plan.billingNote}</p>
        )}
        {"monthlyOption" in plan && plan.monthlyOption && (
          <p className="mt-1 text-xs text-zinc-500">{plan.monthlyOption}</p>
        )}
        {"savings" in plan && plan.savings && (
          <p className="mt-1 text-xs font-medium text-cyan-400">{plan.savings}</p>
        )}
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">{plan.desc}</p>
      </div>

      <a
        href={plan.ctaHref}
        className={`text-center text-sm font-medium py-2.5 rounded-xl transition-all duration-200 ${
          plan.highlight
            ? "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_0_0_rgba(6,182,212,0)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            : "border border-border hover:border-zinc-600 text-zinc-300 hover:text-white"
        }`}
      >
        {plan.cta}
      </a>
      {"trial" in plan && (
        <p className="-mt-3 text-center text-xs text-zinc-500">
          {plan.trial} • {"trialNote" in plan ? plan.trialNote : "no credit card required"}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
            <span className="text-cyan-400 mt-0.5 shrink-0">✓</span>
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Pricing() {
  const headerRef = useFadeIn(0);

  return (
    <section id="pricing" className="py-28 px-6 bg-[#0d0d12]">
      <div className="max-w-6xl mx-auto">
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className="fade-in text-center mb-16"
        >
          <p className="text-cyan-400 text-sm font-mono mb-3">— pricing</p>
          <h2 className="text-4xl font-bold text-white">Simple, honest pricing</h2>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">
            No feature gating for essentials. The free tier is genuinely free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {plans.map((p, i) => (
            <PricingCard key={p.name} plan={p} index={i} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Prices in USD. VAT/Sales Tax may be added at checkout depending on your country.{" "}
          <span className="text-zinc-500">EU Business? Enter your VAT ID at checkout for tax-free purchasing.</span>
        </p>
      </div>
    </section>
  );
}
