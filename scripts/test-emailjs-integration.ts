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

import { EMAILJS_CONFIG, sendOrderEmails, resendEmailLog } from "../src/lib/email/emailjs";
import { buildEmailJsParams, formatOrderItemsHtml, formatCustomLabelAdminInfo } from "../src/lib/email/templates";
import { emailLogRepository } from "../src/lib/firestore/email-logs";
import { orderRepository } from "../src/lib/firestore/orders";
import { Order } from "../src/types/order";

console.log("==================================================");
console.log("SCENTLAB PROMPT #17 EMAILJS INTEGRATION TEST SUITE");
console.log("==================================================\n");

let passed = 0;
const total = 8;

async function runTests() {
  // TEST 1: Template IDs Validation
  if (
    EMAILJS_CONFIG.customerTemplateId === "template_bnf8vrj" &&
    EMAILJS_CONFIG.adminTemplateId === "template_771c56e"
  ) {
    console.log(`✓ TEST 1: EmailJS Template IDs strictly validated (Customer: ${EMAILJS_CONFIG.customerTemplateId}, Admin: ${EMAILJS_CONFIG.adminTemplateId}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", EMAILJS_CONFIG);
  }

  // TEST 2: Customer Email Parameter Builder
  const mockOrderWithCustomLabel: Order = {
    id: "order_email_test_001",
    orderNumber: "SC-2026-000088",
    customerEmail: "buyer@scentlab.com",
    customerId: "cust_123",
    items: [
      {
        id: "item_1",
        productId: "prod_rollon_10ml",
        productName: "10 ml Amber Glass Roll-On Bottles",
        sku: "B0GVYLZZ95",
        quantity: 50,
        unitPrice: 0.84,
        totalPrice: 42.00,
        customLabel: {
          designName: "Maison Noir Luxury Foil",
          size: "1.5 x 2.25 in",
          material: "Gold Metallic Foil Vinyl",
          status: "Artwork Approved",
        },
      },
      {
        id: "item_2",
        productId: "frag_santal_33",
        productName: "Santal 33 Type Pure Fragrance Oil",
        sku: "OIL-SAN33-32",
        quantity: 2,
        unitPrice: 40.00,
        totalPrice: 80.00,
      },
    ],
    subtotal: 122.00,
    discount: 0,
    shipping: 9.50,
    shippingCost: 9.50,
    tax: 8.54,
    total: 140.04,
    totalAmount: 140.04,
    currency: "USD",
    paymentStatus: "paid",
    orderStatus: "processing",
    shippingAddress: {
      id: "addr_123",
      customerId: "cust_123",
      fullName: "Alexander Wright",
      line1: "123 Ocean Drive, Suite 400",
      addressLine1: "123 Ocean Drive, Suite 400",
      city: "Miami",
      state: "FL",
      postalCode: "33139",
      country: "US",
      phone: "+1 (305) 555-0144",
      isDefault: true,
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    shippingMethod: "USPS Ground Advantage (Insured)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const customerParams = buildEmailJsParams(mockOrderWithCustomLabel);

  if (
    customerParams.customer_name === "Alexander Wright" &&
    customerParams.order_number === "SC-2026-000088" &&
    customerParams.total === "$140.04" &&
    customerParams.order_items.includes("Maison Noir Luxury Foil") &&
    customerParams.order_url.includes("/account/orders/order_email_test_001")
  ) {
    console.log(`✓ TEST 2: Customer Confirmation payload builder with Custom Label summary -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", customerParams);
  }

  // TEST 3: Admin Custom Label Information Block Formatting
  const customLabelHtml = formatCustomLabelAdminInfo(mockOrderWithCustomLabel.items);
  if (
    customLabelHtml.includes("Gold Metallic Foil Vinyl") &&
    customLabelHtml.includes("Custom Label Production Required")
  ) {
    console.log(`✓ TEST 3: Admin Custom Label production alert block -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED:", customLabelHtml);
  }

  // TEST 4: Empty Custom Label handling (NO empty section rendered)
  const mockOrderStandardOnly: Order = {
    ...mockOrderWithCustomLabel,
    id: "order_email_test_002",
    items: [
      {
        id: "item_std",
        productId: "frag_santal_33",
        productName: "Santal 33 Type Oil",
        sku: "OIL-SAN33",
        quantity: 1,
        unitPrice: 40.00,
        totalPrice: 40.00,
      },
    ],
  };

  const standardCustomInfo = formatCustomLabelAdminInfo(mockOrderStandardOnly.items);
  if (standardCustomInfo === "") {
    console.log(`✓ TEST 4: Non-custom label orders produce empty custom_label_information string -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 4 FAILED: Expected empty string, got:", standardCustomInfo);
  }

  // TEST 5: Safe Failure Handling & Email Log Persistence
  await orderRepository.saveOrder(mockOrderWithCustomLabel);
  const sendResult = await sendOrderEmails(mockOrderWithCustomLabel);

  const logs = await emailLogRepository.getByOrderId(mockOrderWithCustomLabel.id);
  if (logs.length >= 2) {
    console.log(`✓ TEST 5: Email transactional dispatch recorded in emailLogs (${logs.length} logs created, status: ${logs[0].status}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED: Expected at least 2 email logs, found:", logs);
  }

  // TEST 6: Order Remains Paid & Valid Even If Email Service Fails
  const savedOrder = await orderRepository.getOrderById(mockOrderWithCustomLabel.id);
  if (savedOrder && savedOrder.paymentStatus === "paid" && savedOrder.orderStatus === "processing") {
    console.log(`✓ TEST 6: Safe error boundary (Order remains Paid and Processing regardless of email delivery state) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", savedOrder);
  }

  // TEST 7: Idempotency Verification (Preventing Duplicate Emails)
  const initialLogCount = (await emailLogRepository.getByOrderId(mockOrderWithCustomLabel.id)).length;
  
  // Attempt second send with already processed order
  await sendOrderEmails(mockOrderWithCustomLabel);
  const afterDuplicateLogCount = (await emailLogRepository.getByOrderId(mockOrderWithCustomLabel.id)).length;

  if (afterDuplicateLogCount === initialLogCount) {
    console.log(`✓ TEST 7: Idempotency Protection (Duplicate webhook does NOT send duplicate emails) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 7 FAILED: Duplicate emails were logged:", { initialLogCount, afterDuplicateLogCount });
  }

  // TEST 8: Admin Controlled Resend Mechanism
  if (logs.length > 0) {
    const resendResult = await resendEmailLog(logs[0].id);
    const updatedLog = await emailLogRepository.getById(logs[0].id);
    if (updatedLog && (updatedLog.retryCount || 0) >= 1) {
      console.log(`✓ TEST 8: Admin controlled email retry mechanism (retryCount: ${updatedLog.retryCount}) -> PASSED`);
      passed++;
    } else {
      console.error("✗ TEST 8 FAILED:", updatedLog);
    }
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
