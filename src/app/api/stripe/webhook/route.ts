import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe/client";
import { orderRepository } from "@/lib/firestore/orders";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { webhookIdempotency } from "@/lib/firestore/webhooks";
import { sendOrderEmails } from "@/lib/email/emailjs";
import { logger } from "@/lib/logger";
import Stripe from "stripe";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const bodyText = await request.text();
  const signature = request.headers.get("stripe-signature");

  const stripe = getStripeClient();

  // If running in development / test mock mode
  if (!isStripeConfigured || !stripe) {
    logger.warn("Stripe Webhook received in test/mock mode without live keys. Processing payload in simulation mode.");
    try {
      const mockEvent = JSON.parse(bodyText);
      if (mockEvent.type === "checkout.session.completed" && mockEvent.data?.object?.metadata?.orderId) {
        const orderId = mockEvent.data.object.metadata.orderId;
        await orderRepository.updateOrderStatus(orderId, {
          paymentStatus: "paid",
          orderStatus: "processing",
          stripePaymentIntentId: "pi_mock_test_12345",
        });

        const order = await orderRepository.getOrderById(orderId);
        if (order) {
          await sendOrderEmails(order);
        }
      }
      return NextResponse.json({ received: true, simulated: true });
    } catch {
      return NextResponse.json({ received: true, simulated: true });
    }
  }

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    logger.error("Stripe Webhook rejected: Missing stripe-signature header or STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Missing Stripe Signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(bodyText, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    logger.error("Stripe Webhook signature verification failed", err);
    return new NextResponse(`Webhook Signature Verification Error: ${err.message}`, { status: 400 });
  }

  // Idempotency Check: Prevent duplicate event processing
  const alreadyProcessed = await webhookIdempotency.isEventProcessed(event.id);
  if (alreadyProcessed) {
    logger.info(`Stripe event ${event.id} already processed. Returning HTTP 200 idempotently.`);
    return NextResponse.json({ received: true, idempotencySkipped: true });
  }

  try {
    switch (event.type) {
      // 1. Checkout session completed (Payment confirmed)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await orderRepository.updateOrderStatus(orderId, {
            paymentStatus: "paid",
            orderStatus: "processing",
            stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : undefined,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
          });

          logger.info(`Payment verified for Order ID: ${orderId} via Stripe Webhook.`);

          const order = await orderRepository.getOrderById(orderId);
          if (order) {
            // Confirm inventory consumption
            for (const item of order.items) {
              await inventoryRepository.fulfillOrder(order.id, item.productId, item.quantity);
            }

            // Send Customer Order Confirmation & Admin New Order Notification
            await sendOrderEmails(order);
          }
        }
        break;
      }

      // 2. Checkout session expired / abandoned (Release reserved stock)
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          const order = await orderRepository.getOrderById(orderId);
          if (order && order.paymentStatus === "pending") {
            // Release reserved stock back to available pool
            for (const item of order.items) {
              await inventoryRepository.releaseInventory(item.productId, item.quantity);
            }
            await orderRepository.updateOrderStatus(orderId, {
              orderStatus: "cancelled",
              paymentStatus: "cancelled",
            });
            logger.info(`Session expired. Released inventory for Order ID: ${orderId}`);
          }
        }
        break;
      }

      // 3. Payment failed
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await orderRepository.updateOrderStatus(orderId, {
            paymentStatus: "failed",
          });
          logger.warn(`Payment failed for Order ID: ${orderId}`);
        }
        break;
      }

      // 4. Payment succeeded
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await orderRepository.updateOrderStatus(orderId, {
            paymentStatus: "paid",
            orderStatus: "processing",
            stripePaymentIntentId: paymentIntent.id,
          });

          const order = await orderRepository.getOrderById(orderId);
          if (order && (!order.customerConfirmationEmailSent || !order.adminNotificationEmailSent)) {
            await sendOrderEmails(order);
          }
        }
        break;
      }

      default:
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    // Mark event as processed in idempotency store
    await webhookIdempotency.markEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error(`Error processing Stripe Webhook event: ${event.id}`, error);
    return new NextResponse(`Webhook Handler Error: ${error.message}`, { status: 500 });
  }
}
