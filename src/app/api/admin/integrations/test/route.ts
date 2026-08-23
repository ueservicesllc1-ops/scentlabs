import { NextRequest, NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase/config";

export async function GET(req: NextRequest) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const shippoKey = process.env.SHIPPO_API_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const b2KeyId = process.env.B2_APPLICATION_KEY_ID;
  const b2AppKey = process.env.B2_APPLICATION_KEY;

  const diagnostics = {
    googlePlaces: {
      status: googleKey ? "CONNECTED" : "NOT_CONFIGURED",
      provider: "Google Maps Platform (Places API)",
      configured: Boolean(googleKey),
      keyPreview: googleKey ? `${googleKey.substring(0, 6)}...` : null,
    },
    shippo: {
      status: shippoKey ? "CONNECTED" : "NOT_CONFIGURED",
      provider: "Shippo Multi-Carrier Shipping API",
      configured: Boolean(shippoKey),
      mode: shippoKey?.includes("live") ? "Live Mode" : "Test Mode",
      keyPreview: shippoKey ? `${shippoKey.substring(0, 10)}...` : null,
    },
    stripe: {
      status: stripeKey && !stripeKey.includes("placeholder") ? "CONNECTED" : "TEST_MODE",
      provider: "Stripe Checkout & Payments",
      configured: Boolean(stripeKey),
      mode: stripeKey?.includes("live") ? "Live Mode" : "Test Mode",
    },
    backblazeB2: {
      status: b2KeyId && b2AppKey ? "CONNECTED" : "NOT_CONFIGURED",
      provider: "Backblaze B2 Cloud S3 Storage",
      configured: Boolean(b2KeyId && b2AppKey),
      bucketName: process.env.B2_BUCKET_NAME || "ScentLabs",
    },
    firebase: {
      status: isFirebaseConfigured ? "CONNECTED" : "LOCAL_DEV_MODE",
      provider: "Firebase Authentication & Cloud Firestore",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "scentlabs-d93bf",
    },
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    diagnostics,
  });
}
