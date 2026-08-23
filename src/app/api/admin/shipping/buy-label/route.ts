import { NextRequest, NextResponse } from "next/server";
import { purchaseShippoLabel } from "@/lib/shippo/transactions";
import { orderRepository } from "@/lib/firestore/orders";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, rateId } = body as { orderId: string; rateId: string };

    if (!orderId || !rateId) {
      return NextResponse.json(
        { error: "orderId and rateId are required." },
        { status: 400 }
      );
    }

    const transaction = await purchaseShippoLabel(rateId);

    if (transaction.status === "ERROR") {
      return NextResponse.json(
        { error: "Shippo label purchase failed", details: transaction.messages },
        { status: 422 }
      );
    }

    // Update order with tracking information
    await orderRepository.updateOrder(orderId, {
      carrier: transaction.carrier,
      trackingNumber: transaction.trackingNumber,
      orderStatus: "shipped",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error: any) {
    logger.error("[API /api/admin/shipping/buy-label] Label purchase exception", error);
    return NextResponse.json(
      { error: error?.message || "Failed to purchase shipping label." },
      { status: 500 }
    );
  }
}
