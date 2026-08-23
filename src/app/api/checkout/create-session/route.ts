import { NextRequest, NextResponse } from "next/server";
import { revalidateCartItemsServerSide } from "@/lib/cart/revalidation";
import { orderRepository } from "@/lib/firestore/orders";
import { inventoryRepository } from "@/lib/firestore/inventory";
import { createStripeCheckoutSession } from "@/lib/stripe/checkout";
import { Order } from "@/types";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      customerEmail,
      customerId,
      shippingAddress,
      billingAddress,
      shippoRateId,
      carrier,
      service,
      shippingMethod = "standard",
      shippingCost = 8.50,
      taxRate = 0,
    } = body;

    if (!customerEmail || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid checkout request: items and email are required." },
        { status: 400 }
      );
    }

    // 1. Strict Server-Side Revalidation (never trusts client price/totals)
    const finalShippingCost = typeof shippingCost === "number" && shippingCost >= 0 ? shippingCost : 8.50;
    const revalidation = await revalidateCartItemsServerSide(items, finalShippingCost, taxRate);
    if (!revalidation.valid) {
      return NextResponse.json({ error: revalidation.error }, { status: 400 });
    }

    // 2. Generate Safe Order Identifier & Number
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const orderNumber = await orderRepository.generateOrderNumber();

    // 3. Atomically Reserve Inventory
    for (const item of revalidation.items) {
      await inventoryRepository.reserveInventory(item.productId, item.quantity);
    }

    // 4. Create Initial Pending Order Snapshot in Firestore
    const orderRecord: Order = {
      id: orderId,
      orderNumber,
      customerId: customerId || null,
      customerEmail,
      items: revalidation.items,
      subtotal: revalidation.summary.subtotal,
      discount: revalidation.summary.discount,
      shipping: revalidation.summary.shipping,
      tax: revalidation.summary.tax,
      total: revalidation.summary.total,
      currency: "USD",
      paymentStatus: "pending",
      orderStatus: "pending",
      carrier: carrier || "USPS",
      shippingMethod: service || shippingMethod,
      shippingAddress: shippingAddress || {
        fullName: "Customer",
        streetAddress: "Standard Delivery Address",
        city: "City",
        state: "State",
        postalCode: "00000",
        country: "US",
      },
      billingAddress: billingAddress || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orderRepository.createOrder(orderRecord);

    // 5. Create Stripe Checkout Session
    const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const session = await createStripeCheckoutSession({
      orderId,
      orderNumber,
      customerId,
      customerEmail,
      items: revalidation.items,
      summary: revalidation.summary,
      origin,
    });

    // 6. Update Order with Stripe Checkout Session ID
    await orderRepository.updateOrderStatus(orderId, {
      stripeCheckoutSessionId: session.sessionId,
    });

    logger.info(`Checkout session created for Order ${orderNumber} (Session: ${session.sessionId})`);

    return NextResponse.json(
      {
        success: true,
        orderId,
        orderNumber,
        sessionId: session.sessionId,
        url: session.url,
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error("Checkout session creation failed", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize checkout session." },
      { status: 500 }
    );
  }
}
