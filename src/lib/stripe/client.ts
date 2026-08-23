import Stripe from "stripe";
import { logger } from "../logger";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

export const isStripeConfigured = Boolean(
  STRIPE_SECRET_KEY && !STRIPE_SECRET_KEY.includes("placeholder")
);

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (typeof window !== "undefined") {
    throw new Error("CRITICAL SECURITY VIOLATION: Stripe server SDK must NEVER be initialized in client/browser context.");
  }

  if (!isStripeConfigured) {
    logger.warn("Stripe is running in test/mock mode (placeholder secret key in .env.local).");
    return null;
  }

  if (!stripeInstance) {
    stripeInstance = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: "2026-07-29.dahlia" as any,
      typescript: true,
    });
    logger.info("Stripe Server SDK initialized in TEST MODE.");
  }

  return stripeInstance;
}
