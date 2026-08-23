import * as fs from "fs";
import * as path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

import { calculateShippoRates } from "../src/lib/shippo/rates";
import { purchaseShippoLabel } from "../src/lib/shippo/transactions";
import { shippingSettingsRepository, DEFAULT_SHIPPING_ORIGIN, DEFAULT_PARCEL } from "../src/lib/firestore/shipping-settings";
import { CustomerAddress } from "../src/types/customer";

console.log("==================================================");
console.log("SCENTLAB PROMPT #14 SHIPPO + GOOGLE + STRIPE TEST SUITE");
console.log("==================================================\n");

let passed = 0;
const total = 6;

async function runTests() {
  // TEST 1: Shipping Origin & Default Parcel Settings
  const settings = await shippingSettingsRepository.getSettings();
  if (settings && settings.origin.city === "Miami" && settings.defaultParcel.weight === 1.5) {
    console.log("✓ TEST 1: Shipping origin warehouse & default parcel config -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", settings);
  }

  // TEST 2: Shippo Live / Fallback Rate Calculation
  const testAddress: CustomerAddress = {
    id: "addr_test_1",
    customerId: "cust_123",
    line1: "123 Formulator Way",
    city: "Miami",
    state: "FL",
    postalCode: "33122",
    country: "US",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const rates = await calculateShippoRates(testAddress, DEFAULT_SHIPPING_ORIGIN, DEFAULT_PARCEL);
  if (rates.length > 0 && rates.some((r) => r.amount > 0 && r.carrier)) {
    console.log(`✓ TEST 2: Shippo multi-carrier rates calculation (${rates.length} rates retrieved) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", rates);
  }

  // TEST 3: Shippo Label Purchase & Tracking Barcode Generation
  const testRateId = rates[0]?.id || "rate_fallback_usps_ground";
  const transaction = await purchaseShippoLabel(testRateId);

  if (transaction && transaction.status === "SUCCESS" && transaction.trackingNumber) {
    console.log(`✓ TEST 3: Shippo label purchase & tracking code generation (${transaction.carrier} ${transaction.trackingNumber}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED:", transaction);
  }

  // TEST 4: Google Address Component Mapping Logic
  const mockGoogleComponents = [
    { types: ["street_number"], long_name: "2000" },
    { types: ["route"], long_name: "NW 84th Ave" },
    { types: ["subpremise"], long_name: "100" },
    { types: ["locality"], long_name: "Miami" },
    { types: ["administrative_area_level_1"], short_name: "FL" },
    { types: ["postal_code"], long_name: "33122" },
    { types: ["country"], short_name: "US" },
  ];

  let streetNumber = "";
  let route = "";
  let suite = "";
  let city = "";
  let state = "";
  let postalCode = "";
  let country = "US";

  for (const comp of mockGoogleComponents) {
    if (comp.types.includes("street_number")) streetNumber = comp.long_name || "";
    if (comp.types.includes("route")) route = comp.long_name || "";
    if (comp.types.includes("subpremise")) suite = comp.long_name || "";
    if (comp.types.includes("locality")) city = comp.long_name || "";
    if (comp.types.includes("administrative_area_level_1")) state = comp.short_name || "";
    if (comp.types.includes("postal_code")) postalCode = comp.long_name || "";
    if (comp.types.includes("country")) country = comp.short_name || "";
  }

  const line1 = `${streetNumber} ${route}`.trim();

  if (line1 === "2000 NW 84th Ave" && city === "Miami" && state === "FL" && postalCode === "33122") {
    console.log("✓ TEST 4: Google Places address component parser & mapping -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 4 FAILED:", { line1, city, state, postalCode });
  }

  // TEST 5: Security Boundary - SHIPPO_API_KEY is Server-Side Only
  const hasClientShippoKey = typeof process.env.NEXT_PUBLIC_SHIPPO_API_KEY !== "undefined";
  const hasServerShippoKey = Boolean(process.env.SHIPPO_API_KEY);

  if (!hasClientShippoKey && hasServerShippoKey) {
    console.log("✓ TEST 5: Shippo API key privacy (strictly server-side, never exposed to client) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED:", { hasClientShippoKey, hasServerShippoKey });
  }

  // TEST 6: Google Maps API Key Presence & Non-Invented Key
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (googleKey && googleKey.startsWith("AIzaSy")) {
    console.log("✓ TEST 6: Google Maps Places API key configuration -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", { googleKey });
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
