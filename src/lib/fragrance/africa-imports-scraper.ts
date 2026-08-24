/**
 * Africa Imports Fragrance Catalog Ingestion Service
 * Directly retrieves live catalog data from Africa Imports' GraphQL endpoint.
 */

export interface RawAfricaFragrance {
  entityId: number;
  name: string;
  sku: string;
  path: string;
  plainTextDescription?: string;
  sourcePrice: number;
  sourceCurrency: string;
  categories: string[];
  gender: "Women" | "Men" | "Unisex";
  isDesigner: boolean;
  fragranceReference?: string;
  sourceSize: number;
  sourceUnit: "oz" | "lb";
}

const GRAPHQL_ENDPOINT = "https://africaimports.com/graphql";
const STOREFRONT_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJjaWQiOlsxXSwiY29ycyI6WyJodHRwczovL2FmcmljYWltcG9ydHMuY29tIl0sImVhdCI6MTc4NzY1NjY0MSwiaWF0IjoxNzg3NDgzODQxLCJpc3MiOiJCQyIsInNpZCI6MTAwMTY3Nzc4Miwic3ViIjoiQkMiLCJzdWJfdHlwZSI6MCwidG9rZW5fdHlwZSI6MX0.y72vY6i7NvhhmueAs1uO3l9FZIJhemL3eTV40knDI_eGnURltvvemdm5usxWk0_9gt0pgQd_1x4VwoX3IlqcWA";

/**
 * Extracts size and unit from product title / sku.
 */
function parseSizeAndUnit(name: string, sku: string): { size: number; unit: "oz" | "lb" } {
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

/**
 * Extracts gender classification from name, description, and custom fields.
 */
function parseGender(name: string, customFields: any[]): "Women" | "Men" | "Unisex" {
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

/**
 * Determines if product is an inspired/type impression without claiming authentic trademarks.
 */
function parseDesignerStatus(name: string, customFields: any[]): { isDesigner: boolean; reference?: string } {
  const lower = name.toLowerCase();
  const isType = lower.includes("(type)") || lower.includes("type") || lower.includes("inspired by");

  let reference: string | undefined = undefined;
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

/**
 * Fetches one page of products from BigCommerce GraphQL API.
 */
async function fetchCatalogPage(cursor: string | null = null, pageSize: number = 50) {
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
    throw new Error(`Failed to fetch catalog page from Africa Imports: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Fetches all available fragrance products directly from Africa Imports.
 */
export async function fetchFullAfricaImportsCatalog(
  onProgress?: (count: number, totalEstimated: number) => void
): Promise<RawAfricaFragrance[]> {
  const results: RawAfricaFragrance[] = [];
  let cursor: string | null = null;
  let hasNext = true;
  const estimatedTotal = 1650;

  while (hasNext) {
    const data = await fetchCatalogPage(cursor, 50);
    const category = data?.data?.site?.category;
    if (!category || !category.products) break;

    const edges = category.products.edges || [];
    for (const edge of edges) {
      const node = edge.node;
      if (!node || !node.name) continue;

      // Skip non-fragrance sets or sample wooden displays if requested
      const name = node.name.trim();
      const customFields = (node.customFields && node.customFields.edges) || [];
      const { size, unit } = parseSizeAndUnit(name, node.sku || "");
      const gender = parseGender(name, customFields);
      const designer = parseDesignerStatus(name, customFields);
      const price = node.prices?.price?.value || 0;
      const currency = node.prices?.price?.currencyCode || "USD";

      results.push({
        entityId: node.entityId,
        name,
        sku: node.sku || `AI-${node.entityId}`,
        path: node.path,
        plainTextDescription: node.plainTextDescription || "",
        sourcePrice: price,
        sourceCurrency: currency,
        categories: ["Fragrance Oils", designer.isDesigner ? "Designer" : "Traditional", gender],
        gender,
        isDesigner: designer.isDesigner,
        fragranceReference: designer.reference,
        sourceSize: size,
        sourceUnit: unit,
      });
    }

    hasNext = category.products.pageInfo.hasNextPage;
    cursor = category.products.pageInfo.endCursor;

    if (onProgress) {
      onProgress(results.length, estimatedTotal);
    }
  }

  return results;
}
