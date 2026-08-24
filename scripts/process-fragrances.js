#!/usr/bin/env node
/**
 * Pre-processes africa-imports-fragrances.json into a clean, deduplicated,
 * lightweight JSON file for use in production. Run once with:
 *   node scripts/process-fragrances.js
 */

const fs = require("fs");
const path = require("path");

const INPUT = path.join(__dirname, "../src/data/africa-imports-fragrances.json");
const OUTPUT = path.join(__dirname, "../src/data/fragrances-clean.json");

function cleanFragranceName(name) {
  if (!name) return "";
  let clean = name;
  // Remove leading weight/volume prefixes like "4 Lbs. ", "1/2 Gallon "
  clean = clean.replace(/^(\d+(\.\d+)?|1\/2|½)\s*(lbs?|lbs\.|pounds?|oz|ounces?|gal|gallons?)\.?\s*/gi, "");
  // Remove parenthesized volume suffixes like "(½ Gallon)", "(1/2 Gallon)", "(8 Lbs)", "(Half Gallon)"
  clean = clean.replace(/\s*\(\s*(½|1\/2|\d+(\.\d+)?)\s*(gallon|gallons|gal|lbs?|pounds?|oz|ounces?)\s*\)/gi, "");
  clean = clean.replace(/\s*\(\s*half[- ]?gallon\s*\)/gi, "");
  // Remove trailing standalone volume descriptors not in parens
  clean = clean.replace(/\s+(½|1\/2)\s*gallon\s*$/gi, "");
  clean = clean.replace(/^[\s:\-\/]+|[\s:\-\/]+$/g, "").trim();
  return clean;
}

function inferScentFamily(name, description = "", currentFamily = "") {
  const text = `${name} ${description}`.toLowerCase();
  if (currentFamily && currentFamily !== "Woody" && currentFamily !== "woody") return currentFamily;
  if (/citrus|lemon|lime|orange|bergamot|grapefruit|tangerine|mandarin|yuzu|lemongrass|clementine/.test(text)) return "Citrus";
  if (/floral|rose|jasmine|gardenia|lavender|violet|peony|orchid|blossom|tulip|magnolia|lily|tuberose|iris|hibiscus|lilac|freesia|lotus|plumeria|daisy|ylang/.test(text)) return "Floral";
  if (/vanilla|coconut|chocolate|cocoa|coffee|honey|sugar|caramel|sweet|cream|milk|cookie|cake|candy|almond|cinnamon|butter|mango|peach|apple|berry|cherry|strawberry|pineapple|banana|watermelon|fig|pear|plum/.test(text)) return "Gourmand";
  if (/clean|fresh|powder|linen|breeze|rain|water|aquatic|ocean|sea|cotton|ice|bamboo|soap|pure|sky/.test(text)) return "Fresh";
  if (/amber|musk|oud|oudh|incense|myrrh|frankincense|tonka|patchouli|saffron|cardamom|opium|oriental/.test(text)) return "Amber";
  if (/tobacco|leather|smoke|cigar|rum|suede/.test(text)) return "Tobacco";
  if (/cedar|sandalwood|pine|oak|wood|woody|cypress|birch|vetiver|mahogany|driftwood|teak/.test(text)) return "Woody";
  const families = ["Amber", "Floral", "Fresh", "Citrus", "Oriental", "Gourmand", "Woody"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) { hash = (hash << 5) - hash + name.charCodeAt(i); hash |= 0; }
  return families[Math.abs(hash) % families.length];
}

const APPROVED_SIZES = [1, 2, 4, 8, 16];

const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
console.log(`Processing ${raw.length} raw entries...`);

const byName = new Map();

for (const f of raw) {
  const cleanName = cleanFragranceName(f.name);
  const nameKey = cleanName.toLowerCase().trim();
  if (!nameKey) continue;

  const approvedVariants = (f.repackagingVariants || []).filter(
    (v) => APPROVED_SIZES.includes(Number(v.sellingSize))
  );

  // Only keep essential fields to reduce file size
  const slim = {
    id: f.id,
    name: cleanName,
    slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    description: f.description || "",
    supplierId: f.supplierId || "sup_africa_imports",
    supplierName: f.supplierName || "Africa Imports",
    supplierProductId: f.supplierProductId || "",
    supplierUrl: f.supplierUrl || "",
    category: "fragrance_oils",
    scentFamily: inferScentFamily(cleanName, f.description || "", f.scentFamily),
    gender: f.gender || "unisex",
    sourceSize: f.sourceSize || 32,
    sourceUnit: f.sourceUnit || "oz",
    sourceCost: f.sourceCost || 0,
    costPerOz: f.costPerOz || 0,
    inventoryVolumeOz: f.inventoryVolumeOz || 0,
    status: (f.status === "archived") ? "discontinued" : "active",
    images: f.images || [],
    primaryImage: f.primaryImage || "",
    repackagingVariants: approvedVariants,
    createdAt: f.createdAt || new Date().toISOString(),
    updatedAt: f.updatedAt || new Date().toISOString(),
  };

  if (byName.has(nameKey)) {
    const existing = byName.get(nameKey);
    const merged = [...existing.repackagingVariants];
    for (const v of approvedVariants) {
      if (!merged.some((ev) => Number(ev.sellingSize) === Number(v.sellingSize))) {
        merged.push(v);
      }
    }
    byName.set(nameKey, { ...existing, repackagingVariants: merged });
  } else {
    byName.set(nameKey, slim);
  }
}

const result = Array.from(byName.values());
fs.writeFileSync(OUTPUT, JSON.stringify(result, null, 2));

const inputSize = (fs.statSync(INPUT).size / 1024 / 1024).toFixed(2);
const outputSize = (fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(2);

console.log(`✅ Done!`);
console.log(`   Input:  ${raw.length} entries, ${inputSize} MB`);
console.log(`   Output: ${result.length} unique fragrances, ${outputSize} MB`);
console.log(`   Saved to: ${OUTPUT}`);
