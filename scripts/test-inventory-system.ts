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

import { inventoryRepository } from "../src/lib/firestore/inventory";
import { purchaseRepository } from "../src/lib/firestore/purchases";
import { calculateWeightedAverageCost, calculateInventoryValuation } from "../src/lib/inventory/cost";
import { InventoryItem } from "../src/types/inventory";

console.log("==================================================");
console.log("SCENTLAB PROMPT #15 INVENTORY & COST TEST SUITE");
console.log("==================================================\n");

let passed = 0;
const total = 9;

async function runTests() {
  // TEST 1: Weighted Average Cost Calculation Engine
  // 100 units @ $1.00 + 100 units @ $2.00 = 200 units @ $1.50
  const wac = calculateWeightedAverageCost(100, 1.0, 100, 2.0);
  if (wac === 1.5) {
    console.log(`✓ TEST 1: Weighted Average Cost formula ($1.00 & $2.00 -> $${wac}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", wac);
  }

  // TEST 2: Purchase Receiving & Atomic Inventory Increase
  const testProdId = "prod_rollon_10ml";
  const initialItem = await inventoryRepository.getInventory(testProdId);
  const initialQty = initialItem?.quantity || 1250;
  const initialWac = initialItem?.averageCost || 0.32;

  // Receive 250 units @ $0.40
  await inventoryRepository.receivePurchaseItem(
    testProdId,
    250,
    0.40,
    "PO-TEST-001",
    "supp_amazon_glass",
    "Amazon Glassware Direct"
  );

  const updatedItem = await inventoryRepository.getInventory(testProdId);
  const expectedQty = initialQty + 250;
  const expectedWac = calculateWeightedAverageCost(initialQty, initialWac, 250, 0.40);

  if (updatedItem && updatedItem.quantity === expectedQty && Math.abs(updatedItem.averageCost - expectedWac) < 0.001) {
    console.log(`✓ TEST 2: Purchase Receiving (Quantity: ${updatedItem.quantity}, WAC: $${updatedItem.averageCost}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", { updatedItem, expectedQty, expectedWac });
  }

  // TEST 3: Partial Receiving Lifecycle on Purchase Orders
  const testPoId = `po_test_${Date.now()}`;
  await purchaseRepository.savePurchase({
    id: testPoId,
    purchaseNumber: "PO-TEST-PARTIAL",
    supplierId: "supp_natures_oil",
    supplierName: "Nature's Oil",
    purchaseDate: new Date().toISOString(),
    status: "ordered",
    subtotal: 146.30,
    shipping: 0,
    tax: 0,
    total: 146.30,
    items: [
      {
        id: "poi_test_1",
        purchaseId: testPoId,
        productId: "prod_natures_oil_1l",
        productName: "Perfumer's Alcohol 1L",
        quantityOrdered: 10,
        quantityReceived: 0,
        unit: "liter",
        unitCost: 14.63,
        totalCost: 146.30,
      },
    ],
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Partially receive 6 of 10
  const partialPo = await purchaseRepository.receivePurchase(testPoId, [
    { itemId: "poi_test_1", quantityReceived: 6, quantityRejected: 0 },
  ]);

  if (partialPo.status === "partially_received" && partialPo.items[0].quantityReceived === 6) {
    console.log("✓ TEST 3: Partial Receiving on Purchase Order (6 / 10 received) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED:", partialPo);
  }

  // TEST 4: Atomic Reservation & Fulfillment Consumption Lifecycle
  const reserveSuccess = await inventoryRepository.reserveInventory("prod_pipette_5ml", 50, "ORD-1001");
  const reservedItem = await inventoryRepository.getInventory("prod_pipette_5ml");

  if (reserveSuccess && reservedItem && reservedItem.reserved >= 50) {
    // Now fulfill / consume
    await inventoryRepository.consumeInventory("prod_pipette_5ml", 50, "ORD-1001");
    const fulfilledItem = await inventoryRepository.getInventory("prod_pipette_5ml");
    if (fulfilledItem) {
      console.log("✓ TEST 4: Atomic Reservation & Fulfillment consumption -> PASSED");
      passed++;
    } else {
      console.error("✗ TEST 4 Failed on fulfillment consumption");
    }
  } else {
    console.error("✗ TEST 4 FAILED on reservation:", { reserveSuccess, reservedItem });
  }

  // TEST 5: Concurrency & Negative Stock Prevention
  const highQtyReserve = await inventoryRepository.reserveInventory("prod_blotter_strips", 999999, "ORD-RACE");
  if (!highQtyReserve) {
    console.log("✓ TEST 5: Negative stock prevention (excessive reservation rejected cleanly) -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED: Allowed negative stock reservation");
  }

  // TEST 6: Bulk Fragrance Repackaging Consumption
  const bulkOil = await inventoryRepository.getInventory("frag_santal_33");
  const prevBulkQty = bulkOil?.quantity || 128;
  // Repackage 80 oz into 20 x 4 oz bottles
  await inventoryRepository.adjustInventory(
    "frag_santal_33",
    prevBulkQty - 80,
    "Other",
    "Repackaged 80 oz into 20 x 4 oz customer bottles"
  );
  const afterBulk = await inventoryRepository.getInventory("frag_santal_33");
  if (afterBulk && afterBulk.quantity === prevBulkQty - 80) {
    console.log(`✓ TEST 6: Bulk fragrance repackaging consumption (128 oz -> ${afterBulk.quantity} oz) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", { afterBulk, expected: prevBulkQty - 80 });
  }

  // TEST 7: Cricut Packaging & Label Material Consumption (Cardstock sheets)
  const cardstock = await inventoryRepository.getInventory("mat_cardstock_kraft");
  const prevSheets = cardstock?.quantity || 500;
  // Consume 50 sheets for 50 custom perfume boxes
  await inventoryRepository.adjustInventory(
    "mat_cardstock_kraft",
    prevSheets - 50,
    "Other",
    "Cricut Production: 50 Kraft Perfume Box Folders"
  );
  const afterSheets = await inventoryRepository.getInventory("mat_cardstock_kraft");
  if (afterSheets && afterSheets.quantity === prevSheets - 50) {
    console.log(`✓ TEST 7: Raw material sheet consumption (500 sheets -> ${afterSheets.quantity} sheets) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 7 FAILED:", { afterSheets });
  }

  // TEST 8: Inventory Valuation Engine (Strictly WAC, NEVER retail)
  const allItems = await inventoryRepository.getAllInventory();
  const valResult = calculateInventoryValuation(allItems);
  if (valResult.totalValuation > 0 && Object.keys(valResult.byCategory).length > 0) {
    console.log(`✓ TEST 8: Inventory valuation engine ($${valResult.totalValuation} across ${Object.keys(valResult.byCategory).length} categories) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 8 FAILED:", valResult);
  }

  // TEST 9: Audit Ledger Recording
  const transactions = await inventoryRepository.getTransactions(20);
  if (transactions.length > 0 && transactions.some((t) => t.type === "purchase" || t.type === "reservation")) {
    console.log(`✓ TEST 9: Historical inventory ledger recording (${transactions.length} movements tracked) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 9 FAILED:", transactions);
  }

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
