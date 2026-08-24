import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GRAPHQL_ENDPOINT = "https://africaimports.com/graphql";
const STOREFRONT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOlsxXSwiY29ycyI6WyJodHRwczovL2FmcmljYWltcG9ydHMuY29tIl0sImVhdCI6MTc4NzY1NjY0MSwiaWF0IjoxNzg3NDgzODQxLCJpc3MiOiJCQyIsInNpZCI6MTAwMTY3Nzc4Miwic3ViIjoiQkMiLCJzdWJfdHlwZSI6MCwidG9rZW5fdHlwZSI6MX0.y72vY6i7NvhhmueAs1uO3l9FZIJhemL3eTV40knDI_eGnURltvvemdm5usxWk0_9gt0pgQd_1x4VwoX3IlqcWA";

function parseSizeAndUnit(name) {
  const lower = name.toLowerCase();
  if (lower.includes("1 lb") || lower.includes("1lb") || lower.includes("16 oz") || lower.includes("1-lb")) {
    return { size: 16, unit: "oz" };
  }
  if (lower.includes("4 lb") || lower.includes("4lb") || lower.includes("½ gallon") || lower.includes("half gallon")) {
    return { size: 64, unit: "oz" };
  }
  if (lower.includes("2 lb") || lower.includes("2lb")) {
    return { size: 32, unit: "oz" };
  }
  if (lower.includes("8 oz") || lower.includes("8oz")) {
    return { size: 8, unit: "oz" };
  }
  if (lower.includes("4 oz") || lower.includes("4oz")) {
    return { size: 4, unit: "oz" };
  }
  if (lower.includes("1 oz") || lower.includes("1oz")) {
    return { size: 1, unit: "oz" };
  }
  if (lower.includes("1/3 oz") || lower.includes("⅓ oz") || lower.includes("10 ml")) {
    return { size: 0.33, unit: "oz" };
  }
  return { size: 1, unit: "oz" };
}

function parseGender(name, customFields) {
  const lower = name.toLowerCase();
  if (lower.includes("(w)") || lower.includes("women") || lower.includes("for women") || lower.includes("type (w)")) {
    return "Women";
  }
  if (lower.includes("(m)") || lower.includes("men") || lower.includes("for men") || lower.includes("type (m)")) {
    return "Men";
  }
  if (lower.includes("(u)") || lower.includes("unisex") || lower.includes("for unisex")) {
    return "Unisex";
  }

  for (const cf of customFields) {
    const val = (cf.node?.value || "").toLowerCase();
    if (val.includes("women")) return "Women";
    if (val.includes("men")) return "Men";
    if (val.includes("unisex")) return "Unisex";
  }
  return "Unisex";
}

function parseDesignerStatus(name, customFields) {
  const lower = name.toLowerCase();
  const isType = lower.includes("(type)") || lower.includes("type") || lower.includes("inspired by");

  let reference = undefined;
  if (isType) {
    const match = name.match(/^(.*?)(?:\s*\(?[tT]ype\)?|\s*-\s*[tT]ype|\s*\(W\)|\s*\(M\)|\s*\(U\))/);
    if (match && match[1]) {
      reference = match[1].trim();
    }
  }

  return {
    isDesigner: isType || customFields.some((f) => (f.node?.value || "").toLowerCase().includes("designer")),
    reference,
  };
}

async function fetchCatalogPage(cursor = null, pageSize = 50) {
  const query = `
    query getCategoryProducts($cursor: String, $pageSize: Int!) {
      site {
        category(entityId: 1867) {
          products(first: $pageSize, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                entityId
                name
                sku
                path
                plainTextDescription
                prices {
                  price {
                    value
                    currencyCode
                  }
                }
                customFields {
                  edges {
                    node {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${STOREFRONT_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables: { cursor, pageSize },
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch: HTTP ${res.status}`);
  }

  return await res.json();
}

async function run() {
  console.log("==================================================");
  console.log("SCENTLAB — AFRICA IMPORTS COMPLETE CATALOG INGESTION");
  console.log("==================================================");

  let cursor = null;
  let hasNext = true;
  let page = 1;
  const rawList = [];

  while (hasNext) {
    process.stdout.write(`Fetching page ${page} (Total items fetched: ${rawList.length})...\r`);
    const data = await fetchCatalogPage(cursor, 50);
    const category = data?.data?.site?.category;
    if (!category || !category.products) break;

    const edges = category.products.edges || [];
    for (const edge of edges) {
      const node = edge.node;
      if (!node || !node.name) continue;
      rawList.push(node);
    }

    hasNext = category.products.pageInfo.hasNextPage;
    cursor = category.products.pageInfo.endCursor;
    page++;
  }

  console.log(`\n\nTotal raw products fetched from Africa Imports: ${rawList.length}`);

  const fragrances = [];
  const products = [];
  const initialTransactions = [];
  const slugCounts = new Map();

  let createdCount = 0;
  let duplicateCount = 0;
  let reviewCount = 0;

  const now = new Date().toISOString();

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    const sourceSku = raw.sku || `AI-${raw.entityId}`;
    const name = raw.name.trim();

    // Generate clean unique slug
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!baseSlug) baseSlug = `fragrance-${raw.entityId}`;

    if (slugCounts.has(baseSlug)) {
      const count = slugCounts.get(baseSlug) + 1;
      slugCounts.set(baseSlug, count);
      baseSlug = `${baseSlug}-${count}`;
      duplicateCount++;
    } else {
      slugCounts.set(baseSlug, 1);
    }

    const customFields = (raw.customFields && raw.customFields.edges) || [];
    const { size: sourceSize, unit: sourceUnit } = parseSizeAndUnit(name);
    const gender = parseGender(name, customFields);
    const designer = parseDesignerStatus(name, customFields);
    const sourcePrice = raw.prices?.price?.value || 0;

    if (sourcePrice <= 0) {
      reviewCount++;
    }

    const sourceSizeOz = sourceUnit === "lb" ? sourceSize * 16 : sourceSize;
    const costPerOz = sourceSizeOz > 0 && sourcePrice > 0 
      ? Math.round((sourcePrice / sourceSizeOz) * 100) / 100 
      : 2.50;
    const costPerMl = Math.round((costPerOz / 29.5735) * 1000) / 1000;

    const fragranceId = `frag_${raw.entityId}`;
    const scentlabSku = `SC-FR-${sourceSku.toUpperCase().replace(/[^A-Z0-9_-]/g, "")}`;

    // Build SCENTLAB Repackaging Variants with 25% Target Margin Formula:
    // Selling Price = Total Cost ÷ 0.75
    const repackagingSizes = [
      { size: 0.33, unit: "oz", label: "10 ml (⅓ oz)", containerCost: 0.45, labelCost: 0.12 },
      { size: 1, unit: "oz", label: "1 oz (30 ml)", containerCost: 0.55, labelCost: 0.15 },
      { size: 2, unit: "oz", label: "2 oz (60 ml)", containerCost: 0.65, labelCost: 0.18 },
      { size: 4, unit: "oz", label: "4 oz (120 ml)", containerCost: 0.85, labelCost: 0.20 },
      { size: 8, unit: "oz", label: "8 oz (240 ml)", containerCost: 1.10, labelCost: 0.22 },
      { size: 16, unit: "oz", label: "16 oz (1 lb)", containerCost: 1.50, labelCost: 0.25 },
    ];

    const variants = repackagingSizes.map((s) => {
      const rawOilCost = Math.round(costPerOz * s.size * 100) / 100;
      const laborCost = 0.15;
      const totalUnitCost = Math.round((rawOilCost + s.containerCost + s.labelCost + laborCost) * 100) / 100;

      // Selling Price = Total Cost ÷ 0.75
      const retailPrice = Math.round((totalUnitCost / 0.75) * 100) / 100;
      const grossProfit = Math.round((retailPrice - totalUnitCost) * 100) / 100;
      const marginPercent = Math.round((grossProfit / retailPrice) * 1000) / 10;
      const variantSku = `${scentlabSku}-${s.size >= 1 ? `${s.size}OZ` : "10ML"}`;

      // Initial Inventory Transaction: Exactly 20 units
      initialTransactions.push({
        id: `tx_init_${fragranceId}_${s.size >= 1 ? `${s.size}oz` : "10ml"}`,
        inventoryItemId: `var_${fragranceId}_${s.size >= 1 ? `${s.size}oz` : "10ml"}`,
        productId: fragranceId,
        productName: `${name} (${s.label})`,
        type: "initial_stock",
        quantity: 20,
        previousQuantity: 0,
        newQuantity: 20,
        referenceType: "manual",
        reason: "Initial SCENTLAB catalog inventory",
        createdBy: "System/Admin",
        createdAt: now,
        notes: "Catalog initialization from Africa Imports wholesale source.",
      });

      return {
        id: `var_${fragranceId}_${s.size >= 1 ? `${s.size}oz` : "10ml"}`,
        fragranceOilId: fragranceId,
        sellingSize: s.size,
        sellingUnit: s.unit,
        sku: variantSku,
        costBreakdown: {
          bulkOilCost: rawOilCost,
          containerCost: s.containerCost,
          labelCost: s.labelCost,
          laborCost,
          totalUnitCost,
        },
        unitCost: totalUnitCost,
        retailPrice,
        suggestedRetailPrice: retailPrice,
        grossProfit,
        marginPercent,
        volumePricing: [
          { quantity: 1, price: retailPrice, unitPrice: retailPrice },
          { quantity: 10, price: Math.round(retailPrice * 0.95 * 10 * 100) / 100, unitPrice: Math.round(retailPrice * 0.95 * 100) / 100 },
          { quantity: 50, price: Math.round(retailPrice * 0.90 * 50 * 100) / 100, unitPrice: Math.round(retailPrice * 0.90 * 100) / 100 },
          { quantity: 100, price: Math.round(retailPrice * 0.85 * 100 * 100) / 100, unitPrice: Math.round(retailPrice * 0.85 * 100) / 100 },
        ],
        inventoryQuantity: 20, // RULE: EXACTLY 20 UNITS PER VARIANT
        active: true,
      };
    });

    const baseVariant = variants[1] || variants[0];

    const fragrance = {
      id: fragranceId,
      name,
      slug: baseSlug,
      description: raw.plainTextDescription || `Grade-A pure concentrated ${name} fragrance oil. 100% uncut laboratory formulation.`,
      supplierId: "sup_africa_imports",
      supplierName: "Africa Imports",
      supplierProductId: sourceSku,
      supplierUrl: `https://africaimports.com${raw.path}`,
      fragranceReference: designer.reference,
      category: "fragrance_oils",
      scentFamily: "Woody",
      gender: gender.toLowerCase(),
      sourceSize,
      sourceUnit,
      sourceCost: sourcePrice,
      costPerOz,
      costPerMl,
      inventoryVolumeOz: sourceSizeOz,
      status: "draft", // RULE: ALL IMPORTED PRODUCTS START AS DRAFT FOR ADMIN PHOTO UPLOAD
      images: [],
      primaryImage: "",
      repackagingVariants: variants,
      targetGrossMargin: 0.25,
      createdAt: now,
      updatedAt: now,
    };

    const packageOptions = variants.map((v) => ({
      id: `pkg_${v.id}`,
      name: `${v.sellingSize} ${v.sellingUnit || "oz"} Bottle`,
      quantity: v.sellingSize,
      price: v.retailPrice,
      unitPrice: v.unitCost,
      isDefault: v.sellingSize === 1,
    }));

    const product = {
      id: fragranceId,
      name,
      slug: baseSlug,
      sku: scentlabSku,
      category: "fragrance",
      subcategory: gender.toLowerCase(),
      description: fragrance.description,
      basePrice: baseVariant.retailPrice,
      costData: {
        supplierCost: sourcePrice,
        supplierQuantity: sourceSizeOz,
        unitCost: costPerOz,
        totalUnitCost: baseVariant.unitCost,
      },
      packageOptions,
      volumePricing: [
        { minQuantity: 1, unitPrice: baseVariant.retailPrice },
        { minQuantity: 10, unitPrice: Math.round(baseVariant.retailPrice * 0.95 * 100) / 100, discountPercentage: 5 },
        { minQuantity: 50, unitPrice: Math.round(baseVariant.retailPrice * 0.90 * 100) / 100, discountPercentage: 10 },
        { minQuantity: 100, unitPrice: Math.round(baseVariant.retailPrice * 0.85 * 100) / 100, discountPercentage: 15 },
      ],
      inventory: {
        quantityInStock: 20 * variants.length,
        reservedQuantity: 0,
        availableQuantity: 20 * variants.length,
        status: "in_stock",
      },
      supplierId: "sup_africa_imports",
      supplierName: "Africa Imports",
      status: "draft",
      featured: false,
      media: [],
      discountEligible: true,
      minimumDiscountMargin: 0.25,
      createdAt: now,
      updatedAt: now,
    };

    fragrances.push(fragrance);
    products.push(product);
    createdCount++;
  }

  // Persist structured catalog files to disk
  const outputPath = path.resolve(__dirname, "../src/data/africa-imports-fragrances.json");
  const productsOutputPath = path.resolve(__dirname, "../src/data/africa-imports-products.json");
  const transactionsOutputPath = path.resolve(__dirname, "../src/data/initial-inventory-transactions.json");

  fs.writeFileSync(outputPath, JSON.stringify(fragrances, null, 2), "utf8");
  fs.writeFileSync(productsOutputPath, JSON.stringify(products, null, 2), "utf8");
  fs.writeFileSync(transactionsOutputPath, JSON.stringify(initialTransactions, null, 2), "utf8");

  console.log("\n==================================================");
  console.log("CATALOG INGESTION COMPLETED SUCCESSFULLY");
  console.log("==================================================");
  console.log(`Total Products Ingested: ${createdCount}`);
  console.log(`Total Variants Created: ${createdCount * 6}`);
  console.log(`Initial Inventory Units Initialized: ${createdCount * 6 * 20} (20 units/variant)`);
  console.log(`Initial Inventory Ledger Transactions: ${initialTransactions.length}`);
  console.log(`Duplicates / Variants Handled: ${duplicateCount}`);
  console.log(`Needs Pricing Review: ${reviewCount}`);
  console.log(`Catalog saved to: ${outputPath}`);
  console.log(`Products saved to: ${productsOutputPath}`);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
