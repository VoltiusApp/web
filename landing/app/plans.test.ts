import { test, expect } from "vitest";
import { PLANS, PER_SEAT_PLAN_IDS, MIN_SEATS, planOrder, planById } from "@shared/plans";

test("every plan the site sells has both prices and an order", () => {
  for (const plan of PLANS) {
    expect(plan.name).toBeTruthy();
    expect(plan.annualPrice).toBeGreaterThanOrEqual(0);
    expect(plan.monthlyPrice).toBeGreaterThanOrEqual(plan.annualPrice);
    expect(planOrder(plan.id)).toBeGreaterThanOrEqual(0);
  }
});

test("annual never costs more than monthly", () => {
  // The site advertises annual as the saving; a paid plan priced the other way
  // round would contradict its own savings label.
  for (const plan of PLANS.filter((p) => p.annualPrice > 0)) {
    expect(plan.annualPrice).toBeLessThan(plan.monthlyPrice);
    expect(plan.savings).toBeTruthy();
  }
});

test("per-seat plans are exactly Teams and Business", () => {
  // Mirrors PER_SEAT_PLANS in the server's billing handler.
  expect([...PER_SEAT_PLAN_IDS].sort()).toEqual(["business", "teams"]);
});

test("Business never undercuts Teams at the shared seat floor", () => {
  const teams = planById("teams")!;
  const business = planById("business")!;
  for (const period of ["annualPrice", "monthlyPrice"] as const) {
    expect(business[period] * MIN_SEATS).toBeGreaterThan(teams[period] * MIN_SEATS);
  }
});

test("only the Pro trial is free of a credit card", () => {
  // Pro's trial is granted server-side at registration; every other trial runs
  // through LemonSqueezy, which takes a card.
  for (const plan of PLANS.filter((p) => p.trial)) {
    expect(plan.trial!.creditCardRequired).toBe(plan.id !== "pro");
  }
});

test("Business is sold without a trial", () => {
  // A free trial of a commercial licence would grant AGPL relief for nothing.
  expect(planById("business")!.trial).toBeNull();
});
