/**
 * The plan catalogue both web apps render from.
 *
 * Prices are per seat per month in USD; annual plans bill twelve times the
 * annual rate. The server owns enforcement — seat floors and LemonSqueezy
 * variant ids — so nothing here is authoritative for billing, only for display.
 */

export type PlanId = "free" | "pro" | "teams" | "business";

export interface PlanTrial {
  days: number;
  /** LemonSqueezy trials take a card; the Pro trial is granted at registration and does not. */
  creditCardRequired: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  annualPrice: number;
  monthlyPrice: number;
  period: string;
  savings: string | null;
  desc: string;
  trial: PlanTrial | null;
  perSeat: boolean;
  features: string[];
}

/** Mirrors MIN_SEATS in the server's billing handler, which returns 422 below it. */
export const MIN_SEATS = 3;

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    annualPrice: 0,
    monthlyPrice: 0,
    period: "forever",
    savings: null,
    desc: "Everything you need, no account required.",
    trial: null,
    perSeat: false,
    features: [
      "All core SSH features",
      "SFTP with drag & drop",
      "Docker & serial console",
      "Gist & Cloudflare E2EE sync (free)",
      "Plugin system",
      "Custom themes",
      "Local terminal",
      "Persistent sessions & workspace restore",
      "Port forwarding",
      "Audit logs",
      "Snippets & command palette",
      "Import / Export (no lock-in)",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    annualPrice: 7,
    monthlyPrice: 9,
    period: "/ month",
    savings: "Save 22% with annual billing",
    desc: "Real-time sync and unlimited vaults for power users.",
    trial: { days: 14, creditCardRequired: false },
    perSeat: false,
    features: [
      "Everything in Free",
      "Real-time cloud sync (CRDTs)",
      "Sub-second updates via SSE",
      "Cross-device sessions — one live terminal, shared on all your devices",
      "Unlimited private vaults",
      "Real-time collaboration — 1 session · 1 participant",
    ],
  },
  {
    id: "teams",
    name: "Teams",
    annualPrice: 15,
    monthlyPrice: 18,
    period: "/ user / month",
    savings: "Save 17% with annual billing",
    desc: "Shared vaults, live terminals, and access control for teams (3-user minimum).",
    trial: { days: 14, creditCardRequired: true },
    perSeat: true,
    features: [
      "Everything in Pro",
      "Team vaults & invites",
      "Real-time collaboration — 5 sessions · 10 participants each",
      "Built-in roles (Owner, Manager, Editor, Member)",
      "Team audit logs",
    ],
  },
  {
    id: "business",
    name: "Business",
    annualPrice: 25,
    monthlyPrice: 30,
    period: "/ user / month",
    savings: "Save 17% with annual billing",
    desc: "Commercial license, advanced collaboration, and dedicated support for organizations (3-user minimum).",
    trial: null,
    perSeat: true,
    features: [
      "Everything in Teams",
      "Real-time collaboration — 20 sessions · 50 participants each",
      "Custom roles & granular permissions",
      "Commercial license",
      "Priority support",
      "Custom contracts",
    ],
  },
];

export const PLAN_ORDER: Record<PlanId, number> = { free: 0, pro: 1, teams: 2, business: 3 };

export const PER_SEAT_PLAN_IDS: PlanId[] = PLANS.filter((p) => p.perSeat).map((p) => p.id);

/** Order lookup that tolerates an arbitrary tier string from the server. */
export function planOrder(id: string): number {
  return PLAN_ORDER[id as PlanId] ?? 0;
}

export function planById(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

/** "$15" — whole dollars, which every current price is. */
export function priceLabel(amount: number): string {
  return `$${amount}`;
}

/** "14-day free trial" */
export function trialLabel(trial: PlanTrial): string {
  return `${trial.days}-day free trial`;
}

/** "credit card required" / "no credit card required" */
export function trialCardLabel(trial: PlanTrial): string {
  return trial.creditCardRequired ? "credit card required" : "no credit card required";
}
