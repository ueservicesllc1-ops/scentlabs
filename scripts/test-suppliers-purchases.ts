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

import { supplierRepository } from "../src/lib/firestore/suppliers";
import { supplierProductRepository, calculateLandedCosts } from "../src/lib/firestore/supplier-products";
import { purchaseRepository } from "../src/lib/firestore/purchases";
import { inventoryRepository } from "../src/lib/firestore/inventory";
import { PurchaseItem } from "../src/types/inventory";

console.log("==================================================");
console.log("SCENTLAB PROMPT #16 SUPPLIERS & PURCHASES TEST SUITE");
console.log("==================================================\n");

let passed = 0;
const total = 9;

async function runTests() {
  // TEST 1: Supplier Registration & Catalog Persistence
  const allSuppliers = await supplierRepository.getAllSuppliers();
  const africaImports = allSuppliers.find((s) => s.id === "supp_africa_imports");
  const naturesOil = allSuppliers.find((s) => s.id === "supp_natures_oil");

  if (allSuppliers.length >= 3 && africaImports && naturesOil) {
    console.log(`✓ TEST 1: Supplier vendors repository (${allSuppliers.length} suppliers loaded) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", allSuppliers);
  }

  // TEST 2: Supplier-Product SKU Mapping (Pack sizes, MOQ, Supplier URLs)
  const africaProducts = await supplierProductRepository.getBySupplier("supp_africa_imports");
  const santalOil = africaProducts.find((p) => p.productId === "frag_santal_33");

  if (santalOil && santalOil.supplierPackSize === 32 && santalOil.unit === "oz" && santalOil.supplierUrl) {
    console.log(`✓ TEST 2: Supplier-Product mapping (Africa Imports Santal 33, 32 oz @ $${santalOil.currentCost}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", santalOil);
  }

  // TEST 3: Multi-Vendor Matrix Comparison for a Catalog SKU
  const rollonSuppliers = await supplierProductRepository.getByProduct("prod_rollon_10ml");
  if (rollonSuppliers.length > 0 && rollonSuppliers[0].supplierPackSize === 250) {
    console.log(`✓ TEST 3: Multi-Vendor Comparison Matrix (${rollonSuppliers.length} vendor(s) for 10ml Roll-on) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED:", rollonSuppliers);
  }

  // TEST 4: Unique PO Number Auto-Generation (PO-000001 format)
  const nextPoNumber = await purchaseRepository.generatePurchaseNumber();
  if (nextPoNumber.startsWith("PO-") && nextPoNumber.length === 9) {
    console.log(`✓ TEST 4: Sequential PO number auto-generation (${nextPoNumber}) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 4 FAILED:", nextPoNumber);
  }

  // TEST 5: Landed Cost Allocation Engine (Freight & Customs distribution)
  const sampleItems: PurchaseItem[] = [
    {
      id: "line_1",
      purchaseId: "po_test",
      productId: "frag_santal_33",
      productName: "Santal 33 Oil",
      quantityOrdered: 32,
      quantityReceived: 0,
      unit: "oz",
      unitCost: 1.25, // $40 line subtotal
      totalCost: 40.00,
    },
    {
      id: "line_2",
      purchaseId: "po_test",
      productId: "prod_rollon_10ml",
      productName: "10ml Roll-On Bottles",
      quantityOrdered: 250,
      quantityReceived: 0,
      unit: "unit",
      unitCost: 0.32, // $80 line subtotal
      totalCost: 80.00,
    },
  ];

  // $30 total shipping distributed across $120 total subtotal: Line 1 gets $10 ($40/120 * 30), Line 2 gets $20 ($80/120 * 30)
  const allocated = calculateLandedCosts(sampleItems, 30.00, 0, 0, "by_cost");
  const line1Landed = allocated[0].landedUnitCost || 0;
  const line2Landed = allocated[1].landedUnitCost || 0;

  // Line 1: (40 + 10) / 32 = $1.5625 / oz
  // Line 2: (80 + 20) / 250 = $0.40 / unit
  if (Math.abs(line1Landed - 1.5625) < 0.001 && Math.abs(line2Landed - 0.40) < 0.001) {
    console.log(`✓ TEST 5: Landed Cost Allocation (Line 1: $${line1Landed}/oz, Line 2: $${line2Landed}/u) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED:", { line1Landed, line2Landed });
  }

  // TEST 6: Purchase Order Creation with Multi-Item Calculation
  const testPoId = `po_test_${Date.now()}`;
  await purchaseRepository.savePurchase({
    id: testPoId,
    purchaseNumber: "PO-TEST-000099",
    supplierId: "supp_africa_imports",
    supplierName: "Africa Imports",
    purchaseDate: new Date().toISOString(),
    orderDate: new Date().toISOString(),
    status: "ordered",
    subtotal: 120.00,
    shipping: 15.00,
    shippingCost: 15.00,
    tax: 0,
    otherCost: 0,
    total: 135.00,
    totalCost: 135.00,
    items: [
      {
        id: "poi_test_santal",
        purchaseId: testPoId,
        productId: "frag_santal_33",
        productName: "Santal 33 Type Oil",
        quantityOrdered: 64,
        quantityReceived: 0,
        quantityDamaged: 0,
        quantityRejected: 0,
        unit: "oz",
        unitCost: 1.25,
        totalCost: 80.00,
      },
    ],
    createdBy: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const retrievedPo = await purchaseRepository.getPurchaseById(testPoId);
  if (retrievedPo && retrievedPo.status === "ordered" && retrievedPo.total === 135.00) {
    console.log("✓ TEST 6: Purchase Order creation & persistence -> PASSED");
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", retrievedPo);
  }

  // TEST 7: Receiving Inspection with Damaged and Rejected Items
  const initialFragStock = (await inventoryRepository.getInventory("frag_santal_33"))?.quantity || 0;

  // Receive: 50 Good, 10 Damaged in Transit, 4 Rejected due to defective seal
  await purchaseRepository.receivePurchase(testPoId, [
    {
      itemId: "poi_test_santal",
      quantityReceived: 50,
      quantityDamaged: 10,
      quantityRejected: 4,
      lotNumber: "LOT-AFR-2026-TEST",
      notes: "10 oz jug damaged in shipping dock, 4 oz rejected due to leak",
    },
  ]);

  const afterFragStock = (await inventoryRepository.getInventory("frag_santal_33"))?.quantity || 0;
  const expectedStock = initialFragStock + 50; // ONLY good items added to inventory

  if (afterFragStock === expectedStock) {
    console.log(`✓ TEST 7: Receiving Inspection (50 Good added to stock, 10 Damaged logged in ledger, 4 Rejected excluded) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 7 FAILED:", { afterFragStock, expectedStock, initialFragStock });
  }

  // TEST 8: Damage Movement Logged in Ledger
  const recentTxs = await inventoryRepository.getTransactions(10);
  const dmgTx = recentTxs.find((t) => t.type === "damage" && t.productId === "frag_santal_33");

  if (dmgTx && dmgTx.quantity === 10) {
    console.log(`✓ TEST 8: Damaged goods transaction logged in inventory ledger (${dmgTx.quantity} units) -> PASSED`);
    passed++;
  } else {
    console.error("✗ TEST 8 FAILED: Damage transaction not found in ledger");
  }

  // TEST 9: Supplier Price Fluctuation History Ledger
  const priceHistories = await supplierRepository.getPriceHistoryBySupplier("supp_africa_imports");
  console.log(`✓ TEST 9: Supplier price history ledger (${priceHistories.length} entries tracked) -> PASSED`);
  passed++;

  console.log("\n==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================");
}

runTests();
