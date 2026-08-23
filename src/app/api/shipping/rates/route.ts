import { NextRequest, NextResponse } from "next/server";
import { shippingSettingsRepository } from "@/lib/firestore/shipping-settings";
import { calculateShippoRates } from "@/lib/shippo/rates";
import { CustomerAddress } from "@/types/customer";
import { ParcelDimensions } from "@/types/shipping";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, shippingAddress } = body as {
      items: any[];
      shippingAddress: CustomerAddress;
    };

    if (!shippingAddress || !shippingAddress.city || !shippingAddress.postalCode) {
      return NextResponse.json(
        { error: "A valid shipping address with City, State, and ZIP Code is required." },
        { status: 400 }
      );
    }

    const settings = await shippingSettingsRepository.getSettings();
    const origin = settings.origin;

    // Calculate approximate weight from items
    let totalWeight = 0.5; // Base packaging box tare weight (0.5 lb)
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const qty = item.selectedOptions?.packageCount || item.quantity || 1;
        // Estimate 0.25 lb per item unit
        totalWeight += qty * 0.25;
      }
    }

    const parcel: ParcelDimensions = {
      ...settings.defaultParcel,
      weight: Math.max(1.0, Math.round(totalWeight * 10) / 10),
    };

    const rates = await calculateShippoRates(shippingAddress, origin, parcel);

    return NextResponse.json({
      success: true,
      rates,
      origin,
      parcel,
    });
  } catch (error: any) {
    logger.error("[API /api/shipping/rates] Failed to query rates", error);
    return NextResponse.json(
      { error: "Failed to calculate live shipping rates. Please check the address." },
      { status: 500 }
    );
  }
}
