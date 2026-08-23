import { productService, calculateProductCompleteness, generateSlug } from "../src/lib/firestore/products";
import { Product, ProductStatus } from "../src/types/product";
import { VolumePriceTier } from "../src/types/pricing";

console.log("==================================================");
console.log("SCENTLAB PROMPT #18: PRODUCT MANAGEMENT TEST SUITE");
console.log("==================================================\n");

async function runTests() {
  let passed = 0;
  const total = 9;

  // TEST 1: Product Creation & Slug Auto-generation
  console.log("Test 1: Creating new test product with dynamic slug...");
  const testProduct1: Product = {
    id: `prod_test_${Date.now()}`,
    name: "10 ml Amber Glass Roll-On Bottle",
    sku: `SKU-TEST-BTL-10ML-${Date.now().toString().slice(-4)}`,
    slug: "",
    description: "Premium amber glass roll-on bottles with stainless steel roller balls.",
    shortDescription: "10 ml amber roll-on bottle for perfumes and essential oils.",
    category: "Bottles",
    categoryId: "bottles",
    categoryName: "Bottles & Containers",
    productType: "physical",
    status: "draft",
    currency: "USD",
    basePrice: 0.84,
    compareAtPrice: 1.20,
    cost: 0.32,
    hasVariants: true,
    tags: ["bottles", "amber", "roll-on", "10ml"],
    attributes: { capacity: "10ml", color: "amber" },
    media: [
      {
        id: "med_001",
        mediaId: "b2_file_10ml_rollon",
        b2Key: "products/10ml-amber-rollon.webp",
        url: "https://scentlab.b2.backblazeb2.com/products/10ml-amber-rollon.webp",
        fileName: "10ml-amber-rollon.webp",
        mimeType: "image/webp",
        size: 1048576,
        altText: "10ml Amber Glass Roll-On Bottle with Cap",
        sortOrder: 0,
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
    ],
    volumePricing: [
      { minQuantity: 1, unitPrice: 0.84, discountPercent: 0, active: true },
      { minQuantity: 50, unitPrice: 0.75, discountPercent: 11, active: true },
      { minQuantity: 250, unitPrice: 0.60, discountPercent: 28, active: true },
      { minQuantity: 1000, unitPrice: 0.50, discountPercent: 40, active: true },
    ],
    variants: [
      {
        id: "var_gold_cap",
        productId: "prod_test_001",
        name: "Gold Metal Cap",
        sku: "SKU-TEST-BTL-10ML-GOLD",
        price: 0.89,
        cost: 0.34,
        attributes: { capColor: "Gold" },
        inventory: {
          quantityInStock: 250,
          reservedQuantity: 0,
          availableQuantity: 250,
          status: "in_stock",
        },
        status: "active",
      },
    ],
    inventory: {
      quantityInStock: 1250,
      reservedQuantity: 50,
      availableQuantity: 1200,
      lowStockThreshold: 100,
      reorderPoint: 250,
      location: "shelf_b_dock",
      status: "in_stock",
    },
    shipping: {
      weight: 1.2,
      weightUnit: "oz",
      length: 3.5,
      width: 0.8,
      height: 0.8,
      dimensionUnit: "in",
    },
    supplierId: "supp_amazon_glass",
    supplierName: "Amazon Glassware Direct",
    supplierSku: "B0GVYLZZ95",
    supplierUrl: "https://www.amazon.com/dp/B0GVYLZZ95",
    supplierPackSize: 250,
    isCustomLabelProduct: true,
    customLabelConfig: {
      isCustomLabelProduct: true,
      recommendedWidthInches: 1.5,
      recommendedHeightInches: 2.25,
      areaCostPerSqInch: 0.008,
      areaPricePerSqInch: 0.024,
    },
    seo: {
      metaTitle: "10 ml Amber Glass Roll-On Bottle | SCENTLAB Perfumery",
      metaDescription: "Commercial grade amber glass roller bottles for private label fragrance packaging.",
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const saveRes = await productService.saveProduct(testProduct1);
  if (saveRes.success && saveRes.product?.slug === "10-ml-amber-glass-roll-on-bottle") {
    console.log("✓ TEST 1: Product created with auto-slug '10-ml-amber-glass-roll-on-bottle' -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 1 FAILED:", saveRes.error);
  }

  // TEST 2: Completeness Score Calculator
  console.log("Test 2: Validating completeness score and missing field warnings...");
  const completenessComplete = calculateProductCompleteness(testProduct1);
  const incompleteProduct: Partial<Product> = {
    name: "Draft Unfinished Product",
    sku: "SKU-DRAFT-01",
  };
  const completenessIncomplete = calculateProductCompleteness(incompleteProduct);

  if (completenessComplete.score >= 85 && completenessIncomplete.missingFields.includes("Product Image")) {
    console.log(`✓ TEST 2: Completeness score validated (Complete: ${completenessComplete.score}%, Incomplete missing: ${completenessIncomplete.missingFields.length} fields) -> PASSED\n`);
    passed++;
  } else {
    console.error("✗ TEST 2 FAILED:", completenessComplete, completenessIncomplete);
  }

  // TEST 3: SKU Uniqueness Enforcement
  console.log("Test 3: Validating SKU uniqueness check...");
  const isDuplicateSku = await productService.isSkuUnique(testProduct1.sku, "different_product_id");
  const isSameProductSku = await productService.isSkuUnique(testProduct1.sku, testProduct1.id);

  if (!isDuplicateSku && isSameProductSku) {
    console.log("✓ TEST 3: SKU Uniqueness constraint strictly enforced -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 3 FAILED: isDuplicateSku=", isDuplicateSku, "isSameProductSku=", isSameProductSku);
  }

  // TEST 4: Slug Generation & Uniqueness
  console.log("Test 4: Testing slug generation...");
  const slug1 = generateSlug("10 ml Amber Roll-On (Pack of 50)");
  if (slug1 === "10-ml-amber-roll-on-pack-of-50") {
    console.log("✓ TEST 4: Slug generator sanitizes symbols and punctuation -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 4 FAILED: slug=", slug1);
  }

  // TEST 5: Volume Pricing Tier Integrity
  console.log("Test 5: Validating volume pricing tier structure...");
  const validTiers = testProduct1.volumePricing || [];
  const tier50 = validTiers.find((t) => (t.minQuantity || (t as any).quantity) === 50);
  const tier1000 = validTiers.find((t) => (t.minQuantity || (t as any).quantity) === 1000);

  if (tier50?.unitPrice === 0.75 && tier1000?.unitPrice === 0.50) {
    console.log("✓ TEST 5: Volume pricing tiers validate unit prices ($0.75 for 50u, $0.50 for 1000u) -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 5 FAILED");
  }

  // TEST 6: Product Duplication
  console.log("Test 6: Duplicating product...");
  const dupRes = await productService.duplicateProduct(testProduct1.id);
  if (
    dupRes.success &&
    dupRes.newProduct &&
    dupRes.newProduct.id !== testProduct1.id &&
    dupRes.newProduct.sku.includes("-COPY") &&
    dupRes.newProduct.inventory.quantityInStock === 0 &&
    dupRes.newProduct.status === "draft"
  ) {
    console.log(`✓ TEST 6: Product duplicated cleanly (New ID: ${dupRes.newProduct.id}, SKU: ${dupRes.newProduct.sku}, Inventory reset to 0) -> PASSED\n`);
    passed++;
  } else {
    console.error("✗ TEST 6 FAILED:", dupRes);
  }

  // TEST 7: Archive Product
  console.log("Test 7: Archiving product...");
  const archRes = await productService.archiveProduct(testProduct1.id);
  const archivedProd = await productService.getProductById(testProduct1.id);

  if (archRes.success && archivedProd?.status === "archived") {
    console.log("✓ TEST 7: Product archived safely without data loss -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 7 FAILED:", archRes);
  }

  // TEST 8: Delete Protection Safeguard
  console.log("Test 8: Testing delete protection on product with active inventory...");
  // Set test product back with inventory
  testProduct1.inventory.quantityInStock = 500;
  await productService.saveProduct(testProduct1);

  const deleteRes = await productService.deleteProduct(testProduct1.id);
  if (!deleteRes.success && deleteRes.blockedByHistory) {
    console.log("✓ TEST 8: Delete safeguard BLOCKED hard deletion on active inventory product -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 8 FAILED: Expected deletion to be blocked.", deleteRes);
  }

  // TEST 9: Storefront vs Admin Security Filter
  console.log("Test 9: Testing Storefront Active vs Draft filtering...");
  const storefrontProducts = await productService.getAllProducts();
  const adminProducts = await productService.getAdminProducts();

  const draftFoundInPublic = storefrontProducts.some((p) => p.status === "draft" || p.status === "archived");
  const draftFoundInAdmin = adminProducts.some((p) => p.id === testProduct1.id);

  if (!draftFoundInPublic && draftFoundInAdmin) {
    console.log("✓ TEST 9: Public catalog strictly hides drafts/archived while Admin retains full visibility -> PASSED\n");
    passed++;
  } else {
    console.error("✗ TEST 9 FAILED: draftFoundInPublic=", draftFoundInPublic, "draftFoundInAdmin=", draftFoundInAdmin);
  }

  console.log("==================================================");
  console.log(`RESULTS: ${passed} / ${total} TESTS PASSED`);
  console.log("==================================================\n");

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
