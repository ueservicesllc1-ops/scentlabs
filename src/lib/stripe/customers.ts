import { getStripeClient } from "./client";
import { logger } from "../logger";

export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
  customerId?: string
): Promise<string | null> {
  const stripe = getStripeClient();
  if (!stripe) return null;

  try {
    // Search existing Stripe customer by email
    const existing = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existing.data.length > 0) {
      return existing.data[0].id;
    }

    // Create new customer
    const created = await stripe.customers.create({
      email,
      name: name || undefined,
      metadata: {
        scentlabCustomerId: customerId || "",
      },
    });

    logger.info(`Created Stripe customer ${created.id} for email: ${email}`);
    return created.id;
  } catch (error) {
    logger.error("Failed to create/get Stripe customer", error);
    return null;
  }
}
