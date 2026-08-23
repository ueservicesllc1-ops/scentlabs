import { shippoFetch } from "./client";
import { CustomerAddress } from "@/types/customer";
import { ShippoRate, ShippingOrigin, ParcelDimensions } from "@/types/shipping";
import { logger } from "../logger";

interface ShippoRateRaw {
  object_id: string;
  provider: string; // e.g. "USPS", "UPS"
  servicelevel?: {
    name?: string;
    token?: string;
  };
  amount: string;
  currency: string;
  estimated_days?: number;
  duration_terms?: string;
  provider_image_75?: string;
}

interface ShippoShipmentResponse {
  object_id: string;
  status: string;
  rates: ShippoRateRaw[];
  messages?: any[];
}

export async function calculateShippoRates(
  toAddress: CustomerAddress,
  origin: ShippingOrigin,
  parcel: ParcelDimensions
): Promise<ShippoRate[]> {
  try {
    const payload = {
      address_from: {
        name: origin.name,
        company: origin.company,
        street1: origin.street1,
        street2: origin.street2 || "",
        city: origin.city,
        state: origin.state,
        zip: origin.zip,
        country: origin.country || "US",
        phone: origin.phone,
        email: origin.email,
      },
      address_to: {
        name: `${toAddress.firstName || ""} ${toAddress.lastName || ""}`.trim() || toAddress.fullName || "Customer",
        company: toAddress.company || "",
        street1: toAddress.line1 || toAddress.street1 || toAddress.streetAddress || "",
        street2: toAddress.line2 || toAddress.street2 || "",
        city: toAddress.city,
        state: toAddress.state,
        zip: toAddress.postalCode,
        country: toAddress.country || "US",
        phone: toAddress.phone || "",
      },
      parcels: [
        {
          length: String(parcel.length || 8),
          width: String(parcel.width || 6),
          height: String(parcel.height || 4),
          distance_unit: parcel.distanceUnit || "in",
          weight: String(parcel.weight || 1.5),
          mass_unit: parcel.massUnit || "lb",
        },
      ],
      async: false,
    };

    const response = await shippoFetch<ShippoShipmentResponse>("/shipments", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response.rates && response.rates.length > 0) {
      return response.rates.map((r) => ({
        id: r.object_id,
        carrier: r.provider,
        service: r.servicelevel?.name || `${r.provider} Standard`,
        amount: parseFloat(r.amount),
        currency: r.currency || "USD",
        estimatedDays: r.estimated_days,
        durationTerms: r.duration_terms,
        providerImage: r.provider_image_75,
      }));
    }

    logger.warn("[SHIPPO] No carrier rates returned by Shippo API, generating fallback options.");
    return generateFallbackRates();
  } catch (error: any) {
    logger.warn("[SHIPPO RATES FALLBACK]", error?.message);
    return generateFallbackRates();
  }
}

function generateFallbackRates(): ShippoRate[] {
  return [
    {
      id: "rate_fallback_usps_ground",
      carrier: "USPS",
      service: "USPS Ground Advantage",
      amount: 4.95,
      currency: "USD",
      estimatedDays: 3,
      durationTerms: "2-5 business days",
    },
    {
      id: "rate_fallback_usps_priority",
      carrier: "USPS",
      service: "USPS Priority Mail",
      amount: 8.50,
      currency: "USD",
      estimatedDays: 2,
      durationTerms: "1-3 business days",
    },
    {
      id: "rate_fallback_ups_ground",
      carrier: "UPS",
      service: "UPS Ground",
      amount: 9.75,
      currency: "USD",
      estimatedDays: 3,
      durationTerms: "3 business days",
    },
  ];
}
