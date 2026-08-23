import * as fs from "fs";
import * as path from "path";

// Load .env.local natively
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

import { EMAILJS_CONFIG, sendOrderEmails, isEmailJsConfigured } from "../src/lib/email/emailjs";
import { orderRepository } from "../src/lib/firestore/orders";
import { emailLogRepository } from "../src/lib/firestore/email-logs";
import { Order } from "../src/types/order";

console.log("==================================================");
console.log("SCENTLAB — SIMULATED PURCHASE FOR: luisuf@gmail.com");
console.log("==================================================\n");

async function simulatePurchase() {
  const customerEmail = "luisuf@gmail.com";
  const orderNumber = await orderRepository.generateOrderNumber();
  const orderId = `order_${Date.now()}`;

  console.log(`1. Creating simulated paid order: ${orderNumber} (ID: ${orderId})`);

  const mockOrder: Order = {
    id: orderId,
    orderNumber,
    customerId: "cust_luis_001",
    customerEmail,
    items: [
      {
        id: "item_rollon_custom",
        productId: "prod_rollon_10ml",
        productName: "10 ml Amber Glass Roll-On Bottles with Metal Rollers",
        sku: "B0GVYLZZ95",
        quantity: 100,
        unitPrice: 0.84,
        totalPrice: 84.00,
        customLabel: {
          designName: "Luis Exclusive Oud — Gold Foil Edition",
          size: "1.5 x 2.25 in",
          material: "Gold Metallic Foil Vinyl",
          status: "Artwork Approved & Ready to Print",
        },
      },
      {
        id: "item_santal_oil",
        productId: "frag_santal_33",
        productName: "Santal 33 Type Pure Fragrance Oil (Uncut Essence)",
        sku: "OIL-SAN33-32",
        quantity: 2,
        unitPrice: 40.00,
        totalPrice: 80.00,
      },
      {
        id: "item_perfume_alcohol",
        productId: "prod_natures_oil_1l",
        productName: "Perfumer's Alcohol Base 200 Proof SDA-40B (1 Liter)",
        sku: "ALC-SDA40B-1L",
        quantity: 1,
        unitPrice: 24.50,
        totalPrice: 24.50,
      },
    ],
    subtotal: 188.50,
    discount: 0,
    shipping: 12.50,
    shippingCost: 12.50,
    tax: 13.20,
    total: 214.20,
    totalAmount: 214.20,
    currency: "USD",
    paymentStatus: "paid",
    orderStatus: "processing",
    stripePaymentIntentId: `pi_test_${Date.now()}`,
    shippingAddress: {
      id: "addr_luis_01",
      customerId: "cust_luis_001",
      fullName: "Luis U.",
      line1: "742 Evergreen Terrace",
      addressLine1: "742 Evergreen Terrace",
      city: "Miami",
      state: "FL",
      postalCode: "33101",
      country: "US",
      phone: "+1 (305) 555-0199",
      isDefault: true,
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    shippingMethod: "USPS Priority Mail 2-Day (Insured)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Save order to Firestore / local store
  await orderRepository.saveOrder(mockOrder);
  console.log("✓ Order saved with status: PAID & PROCESSING\n");

  // 2. Check EmailJS environment configuration
  console.log("2. Checking EmailJS Credentials in Environment:");
  console.log(`- Service ID: ${EMAILJS_CONFIG.serviceId ? "Configured (" + EMAILJS_CONFIG.serviceId + ")" : "MISSING"}`);
  console.log(`- Public Key: ${EMAILJS_CONFIG.publicKey ? "Configured (" + EMAILJS_CONFIG.publicKey.substring(0, 6) + "...)" : "MISSING"}`);
  console.log(`- Private Key: ${EMAILJS_CONFIG.privateKey ? "Configured" : "Not Provided (Optional)"}`);
  console.log(`- Customer Template ID: ${EMAILJS_CONFIG.customerTemplateId}`);
  console.log(`- Admin Template ID: ${EMAILJS_CONFIG.adminTemplateId}`);
  console.log(`- Admin Email: ${EMAILJS_CONFIG.adminEmail}\n`);

  // 3. Dispatch emails
  console.log("3. Dispatching Transactional Emails via EmailJS REST API...");
  console.log(`- Dispatching Template #1 (Customer) to: ${customerEmail}`);
  console.log(`- Dispatching Template #2 (Admin) to: ${EMAILJS_CONFIG.adminEmail}`);

  const results = await sendOrderEmails(mockOrder, { forceCustomer: true, forceAdmin: true });

  console.log("\n4. Dispatch Results:");
  console.log(`- Customer Email Result: ${results.customerSent ? "✓ SENT SUCCESSFULLY" : "✗ FAILED / LOGGED"}`);
  console.log(`- Admin Email Result:    ${results.adminSent ? "✓ SENT SUCCESSFULLY" : "✗ FAILED / LOGGED"}\n`);

  // 4. Retrieve generated logs
  const logs = await emailLogRepository.getByOrderId(mockOrder.id);
  console.log("5. Email Logs Created:");
  logs.forEach((log, index) => {
    console.log(`[Log #${index + 1}] ID: ${log.id}`);
    console.log(`  Recipient: ${log.recipient}`);
    console.log(`  Type: ${log.type}`);
    console.log(`  Template: ${log.templateId}`);
    console.log(`  Status: ${log.status}`);
    if (log.error) console.log(`  Diagnostic Error: ${log.error}`);
    if (log.messageId) console.log(`  Message Ref: ${log.messageId}`);
    console.log("---");
  });
}

simulatePurchase();
