import { getStripeClient, isStripeConfigured } from "./client";
import { OrderItemSnapshot, Order } from "@/types";
import { CartCalculationSummary } from "../cart/totals";
import { logger } from "../logger";

export interface CreateCheckoutSessionParams {
  orderId: string;
  orderNumber: string;
  customerId?: string | null;
  customerEmail: string;
  items: OrderItemSnapshot[];
  summary: CartCalculationSummary;
  origin: string;
}

export async function createStripeCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url: string }> {
  const { orderId, orderNumber, customerId, customerEmail, items, summary, origin } = params;
  const stripe = getStripeClient();

  // If Stripe keys are placeholders, provide seamless mock session for local dev testing
  if (!stripe || !isStripeConfigured) {
    logger.info(`Stripe placeholder mode active. Simulating checkout session for order ${orderNumber}`);
    const mockSessionId = `cs_test_mock_${Date.now()}_${orderId}`;
    return {
      sessionId: mockSessionId,
      url: `${origin}/checkout/success?session_id=${mockSessionId}&order_id=${orderId}&mock=true`,
    };
  }

  // Construct Stripe Line Items
  const lineItems: any[] = items.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.productName,
          description: `SKU: ${item.sku} • Quantity: ${item.quantity} units`,
          images: item.imageSnapshot && item.imageSnapshot.startsWith("http") ? [item.imageSnapshot] : [],
        },
        unit_amount: Math.round(item.unitPrice * 100), // In cents
      },
      quantity: item.quantity,
    };
  });

  // If shipping cost exists, add as line item or shipping option
  if (summary.shipping > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Decoupled Ground Shipping & Handling",
          description: "Insured laboratory freight & transport",
        },
        unit_amount: Math.round(summary.shipping * 100),
      },
      quantity: 1,
    });
  }

  // If discount exists, apply via Stripe discount coupon or adjusted line
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: customerEmail,
    line_items: lineItems,
    metadata: {
      orderId,
      orderNumber,
      customerId: customerId || "",
    },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
    cancel_url: `${origin}/checkout/cancel?order_id=${orderId}`,
  });

  if (!session.url) {
    throw new Error("Stripe checkout session created without a valid redirect URL.");
  }

  return {
    sessionId: session.id,
    url: session.url,
  };
}
