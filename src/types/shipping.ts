import { CustomerAddress } from "./customer";

export interface ShippingOrigin {
  name: string;
  company: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

export type MassUnit = "lb" | "oz" | "g" | "kg";
export type DistanceUnit = "in" | "cm";

export interface ParcelDimensions {
  weight: number;
  massUnit: MassUnit;
  length: number;
  width: number;
  height: number;
  distanceUnit: DistanceUnit;
}

export interface ShippoRate {
  id: string; // Shippo Rate object ID
  carrier: string; // e.g. "USPS", "UPS"
  service: string; // e.g. "USPS Ground Advantage", "UPS Ground"
  amount: number;
  currency: string;
  estimatedDays?: number;
  durationTerms?: string;
  providerImage?: string;
}

export interface ShippingSnapshot {
  shippingProvider: "shippo" | "manual";
  shippoRateId: string;
  carrier: string;
  service: string;
  shippingAmount: number;
  currency: string;
  estimatedDelivery?: string;
  shippingAddress: CustomerAddress;
  shippingOrigin: ShippingOrigin;
  parcel: ParcelDimensions;
}

export interface ShippoTransaction {
  id: string; // Shippo Transaction ID
  rateId: string;
  trackingNumber: string;
  trackingUrl: string;
  carrier: string;
  service: string;
  labelUrl: string;
  labelPdfUrl?: string;
  labelFileId?: string;
  status: "SUCCESS" | "QUEUED" | "WAITING" | "ERROR";
  messages?: string[];
  createdAt: string;
}

export interface ShippingSettings {
  origin: ShippingOrigin;
  defaultParcel: ParcelDimensions;
  freeShippingThreshold?: number;
  fallbackFlatRate: number;
  updatedAt: string;
}
