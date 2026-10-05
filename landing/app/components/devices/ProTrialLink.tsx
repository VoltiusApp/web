import { planById, trialCardLabel, trialLabel } from "@shared/plans";

const pro = planById("pro");

/** "Pro · 14-day free trial, no credit card required", linking to pricing; follows shared/plans.ts. */
export default function ProTrialLink() {
  if (!pro?.trial) return null;
  return (
    <a href="#pricing" className="text-cyan-400 hover:text-cyan-300">
      {pro.name} · {trialLabel(pro.trial)}, {trialCardLabel(pro.trial)}
    </a>
  );
}
