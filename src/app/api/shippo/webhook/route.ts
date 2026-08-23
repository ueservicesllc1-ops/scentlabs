import { NextRequest, NextResponse } from "next/server";
import { orderRepository } from "@/lib/firestore/orders";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, data } = body;

    logger.info("[SHIPPO WEBHOOK RECEIVED]", { event, trackingNumber: data?.tracking_number });

    if (event === "track_updated" && data?.tracking_number) {
      const trackingNumber = data.tracking_number;
      const trackingStatus = data.tracking_status?.status; // "DELIVERED", "TRANSIT", "FAILURE"

      const orders = await orderRepository.getAllOrders();
      const matchingOrder = orders.find((o) => o.trackingNumber === trackingNumber);

      if (matchingOrder) {
        if (trackingStatus === "DELIVERED") {
          await orderRepository.updateOrder(matchingOrder.id, {
            orderStatus: "delivered",
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error("[SHIPPO WEBHOOK ERROR]", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 });
  }
}
