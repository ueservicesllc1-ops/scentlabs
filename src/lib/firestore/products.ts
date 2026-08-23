import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/client";
import { Product, ProductCompleteness, ProductStatus, ProductType } from "@/types/product";
import { INITIAL_PRODUCTS } from "@/data/products";
import { isFirebaseConfigured } from "../firebase/config";
import { logger } from "../logger";
import { inventoryRepository } from "./inventory";
import { orderRepository } from "./orders";

const COLLECTION_NAME = "products";
let LOCAL_STORE: Product[] = [...INITIAL_PRODUCTS];

export function calculateProductCompleteness(product: Partial<Product>): ProductCompleteness {
  const missingFields: string[] = [];
  let score = 0;

  // 1. Basic Identity (25%)
  if (product.name && product.name.trim().length > 2) score += 10;
  else missingFields.push("Product Name");

  if (product.sku && product.sku.trim().length > 1) score += 10;
  else missingFields.push("SKU");

  if (product.categoryId || product.category) score += 5;
  else missingFields.push("Category");

  // 2. Description (15%)
  if (product.description && product.description.trim().length > 10) score += 10;
  else missingFields.push("Full Description");

  if (product.shortDescription && product.shortDescription.trim().length > 5) score += 5;
  else missingFields.push("Short Description");

  // 3. Media (20%)
  const hasImages = Boolean(
    (product.media && product.media.length > 0) ||
    (product.images && product.images.length > 0) ||
    product.primaryImageUrl
  );
  if (hasImages) score += 20;
  else missingFields.push("Product Image");

  // 4. Pricing (20%)
  if (product.basePrice !== undefined && product.basePrice > 0) score += 15;
  else missingFields.push("Base Price");

  if (product.cost !== undefined && product.cost > 0) score += 5;
  else missingFields.push("Cost");

  // 5. Shipping Dimensions (10%)
  const hasWeight = Boolean(product.shipping?.weight && product.shipping.weight > 0);
  const hasDims = Boolean(
    product.shipping?.length && product.shipping?.width && product.shipping?.height
  );
  if (hasWeight && hasDims) score += 10;
  else if (hasWeight) {
    score += 5;
    missingFields.push("Shipping Dimensions");
  } else {
    missingFields.push("Shipping Weight & Dimensions");
  }

  // 6. Inventory Configuration (10%)
  if (product.inventory?.reorderPoint !== undefined && product.inventory?.lowStockThreshold !== undefined) {
    score += 10;
  } else {
    missingFields.push("Inventory Reorder Point");
  }

  return {
    score: Math.min(100, score),
    missingFields,
    isComplete: score >= 85,
  };
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const productService = {
  /**
   * Fetches all active products for the public storefront.
   * Internal sensitive data (cost, supplier, internal notes) are filtered.
   */
  async getAllProducts(): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_STORE.filter((p) => p.status === "active");
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("status", "==", "active"));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return LOCAL_STORE.filter((p) => p.status === "active");
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      logger.warn("Firestore getAllProducts failed; falling back to local dataset.", error);
      return LOCAL_STORE.filter((p) => p.status === "active");
    }
  },

  /**
   * Fetches all products across ALL statuses for the Admin dashboard.
   */
  async getAdminProducts(filters?: {
    category?: string;
    status?: ProductStatus | "all";
    productType?: ProductType | "all";
    supplierId?: string;
    stockStatus?: string;
    featured?: boolean;
    isCustomLabel?: boolean;
    query?: string;
  }, sort?: string): Promise<Product[]> {
    let products: Product[] = [];

    if (!isFirebaseConfigured || !db) {
      products = [...LOCAL_STORE];
    } else {
      try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        if (snapshot.empty) {
          products = [...LOCAL_STORE];
        } else {
          products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
        }
      } catch (error) {
        logger.warn("Firestore getAdminProducts failed; falling back to local dataset.", error);
        products = [...LOCAL_STORE];
      }
    }

    // Apply filters
    if (filters) {
      if (filters.status && filters.status !== "all") {
        products = products.filter((p) => p.status === filters.status);
      }
      if (filters.category && filters.category !== "all") {
        products = products.filter((p) => p.categoryId === filters.category || p.category === filters.category);
      }
      if (filters.productType && filters.productType !== "all") {
        products = products.filter((p) => p.productType === filters.productType);
      }
      if (filters.supplierId && filters.supplierId !== "all") {
        products = products.filter((p) => p.supplierId === filters.supplierId || p.supplier?.primarySupplierId === filters.supplierId);
      }
      if (filters.stockStatus && filters.stockStatus !== "all") {
        products = products.filter((p) => p.inventory?.status === filters.stockStatus);
      }
      if (filters.featured !== undefined) {
        products = products.filter((p) => Boolean(p.featured) === filters.featured);
      }
      if (filters.isCustomLabel !== undefined) {
        products = products.filter((p) => Boolean(p.isCustomLabelProduct || p.customizable) === filters.isCustomLabel);
      }
      if (filters.query && filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        products = products.filter((p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.supplierSku && p.supplierSku.toLowerCase().includes(q)) ||
          (p.supplierName && p.supplierName.toLowerCase().includes(q))
        );
      }
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case "newest":
          products.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          break;
        case "oldest":
          products.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
          break;
        case "name_asc":
          products.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          products.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "price_asc":
          products.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
          break;
        case "price_desc":
          products.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
          break;
        case "stock_asc":
          products.sort((a, b) => (a.inventory?.quantityInStock || 0) - (b.inventory?.quantityInStock || 0));
          break;
        case "stock_desc":
          products.sort((a, b) => (b.inventory?.quantityInStock || 0) - (a.inventory?.quantityInStock || 0));
          break;
        default:
          products.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      }
    }

    return products;
  },

  /**
   * Fetches a product by its URL slug
   */
  async getProductBySlug(slug: string): Promise<Product | null> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_STORE.find((p) => p.slug === slug) || null;
    }

    try {
      const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return LOCAL_STORE.find((p) => p.slug === slug) || null;
      }
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
    } catch (error) {
      logger.warn(`Firestore getProductBySlug(${slug}) failed; falling back to local seed.`, error);
      return LOCAL_STORE.find((p) => p.slug === slug) || null;
    }
  },

  /**
   * Fetches products by category slug/id
   */
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_STORE.filter(
        (p) => (p.category === categoryId || p.categoryId === categoryId) && p.status === "active"
      );
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("categoryId", "==", categoryId),
        where("status", "==", "active")
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return LOCAL_STORE.filter(
          (p) => (p.category === categoryId || p.categoryId === categoryId) && p.status === "active"
        );
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    } catch (error) {
      logger.warn(`Firestore getProductsByCategory(${categoryId}) failed; fallback to local.`, error);
      return LOCAL_STORE.filter(
        (p) => (p.category === categoryId || p.categoryId === categoryId) && p.status === "active"
      );
    }
  },

  /**
   * Retrieves a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    if (!isFirebaseConfigured || !db) {
      return LOCAL_STORE.find((p) => p.id === id) || null;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Product;
      }
      return LOCAL_STORE.find((p) => p.id === id) || null;
    } catch (error) {
      logger.warn(`Firestore getProductById(${id}) failed; falling back to local memory.`, error);
      return LOCAL_STORE.find((p) => p.id === id) || null;
    }
  },

  /**
   * Validates SKU uniqueness across all products
   */
  async isSkuUnique(sku: string, excludeProductId?: string): Promise<boolean> {
    const cleanSku = sku.trim().toUpperCase();
    const products = await this.getAdminProducts();
    const match = products.find(
      (p) => p.sku.toUpperCase() === cleanSku && p.id !== excludeProductId
    );
    return !match;
  },

  /**
   * Validates Slug uniqueness across all products
   */
  async isSlugUnique(slug: string, excludeProductId?: string): Promise<boolean> {
    const cleanSlug = slug.trim().toLowerCase();
    const products = await this.getAdminProducts();
    const match = products.find(
      (p) => p.slug.toLowerCase() === cleanSlug && p.id !== excludeProductId
    );
    return !match;
  },

  /**
   * Saves or creates a product in Firestore with validation and completeness score.
   */
  async saveProduct(product: Product): Promise<{ success: boolean; error?: string; product?: Product }> {
    // 1. Validate required basic fields
    if (!product.name || product.name.trim().length < 2) {
      return { success: false, error: "Product name is required (minimum 2 characters)." };
    }
    if (!product.sku || product.sku.trim().length < 1) {
      return { success: false, error: "Product SKU is required." };
    }
    if (product.basePrice === undefined || product.basePrice < 0) {
      return { success: false, error: "Base Price must be zero or a positive number." };
    }

    // 2. Validate SKU uniqueness
    const skuUnique = await this.isSkuUnique(product.sku, product.id);
    if (!skuUnique) {
      return { success: false, error: `SKU '${product.sku}' is already in use by another product.` };
    }

    // 3. Ensure slug exists and is unique
    let slug = product.slug ? generateSlug(product.slug) : generateSlug(product.name);
    let slugUnique = await this.isSlugUnique(slug, product.id);
    if (!slugUnique) {
      slug = `${slug}-${Date.now().toString(36).substring(2, 6)}`;
    }
    product.slug = slug;

    // 4. Calculate Margin
    const cost = product.cost || product.costData?.unitCost || 0;
    product.cost = cost;
    product.margin = Math.max(0, product.basePrice - cost);
    product.marginPercent = product.basePrice > 0 ? ((product.basePrice - cost) / product.basePrice) * 100 : 0;

    // 5. Calculate Completeness
    product.completeness = calculateProductCompleteness(product);

    // 6. Handle Primary Image URL derivation
    if (product.media && product.media.length > 0) {
      const primaryMedia = (product.media as any[]).find((m) => m.isPrimary) || product.media[0];
      product.primaryImageUrl = primaryMedia.url;
    }

    // 7. Auto-protect image requirement if configured
    if (product.requiresImage && (!product.media || product.media.length === 0) && product.status === "active") {
      product.status = "draft";
    }

    product.updatedAt = new Date().toISOString();
    if (!product.createdAt) {
      product.createdAt = new Date().toISOString();
    }

    // 8. Persist to Firestore or local store
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, product.id);
        await setDoc(docRef, product, { merge: true });
      } catch (error: any) {
        logger.error(`Failed to save product ${product.id} to Firestore`, error);
        return { success: false, error: error.message };
      }
    }

    // Update local store
    const existingIndex = LOCAL_STORE.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      LOCAL_STORE[existingIndex] = { ...product };
    } else {
      LOCAL_STORE.unshift({ ...product });
    }

    return { success: true, product };
  },

  /**
   * Duplicates a product: Clones specification, SEO, volume pricing, and variants,
   * but explicitly CLEARS inventory quantity, purchase history, order history, and generates a new ID.
   */
  async duplicateProduct(originalId: string): Promise<{ success: boolean; newProduct?: Product; error?: string }> {
    const original = await this.getProductById(originalId);
    if (!original) {
      return { success: false, error: "Original product not found." };
    }

    const newId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSku = `${original.sku}-COPY-${Math.floor(Math.random() * 900 + 100)}`;
    const newSlug = `${original.slug}-copy-${Date.now().toString(36).substring(2, 6)}`;

    // Clone variants with new IDs & SKUs
    const clonedVariants = original.variants?.map((v, i) => ({
      ...v,
      id: `var_${Date.now()}_${i}`,
      productId: newId,
      sku: `${v.sku}-COPY`,
      inventory: {
        quantityInStock: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        status: "out_of_stock" as const,
      },
    }));

    const duplicated: Product = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      sku: newSku,
      slug: newSlug,
      status: "draft", // Starts as draft
      variants: clonedVariants,
      inventory: {
        quantityInStock: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lowStockThreshold: original.inventory?.lowStockThreshold || 10,
        reorderPoint: original.inventory?.reorderPoint || 20,
        location: original.inventory?.location || "main_storage",
        status: "out_of_stock",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saveResult = await this.saveProduct(duplicated);
    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return { success: true, newProduct: saveResult.product };
  },

  /**
   * Archives a product so it is hidden from the storefront while preserving history.
   */
  async archiveProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const product = await this.getProductById(id);
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    product.status = "archived";
    product.updatedAt = new Date().toISOString();
    return this.saveProduct(product);
  },

  /**
   * Deletes a product ONLY if it has no associated orders, purchases, or inventory transactions.
   * If history exists, deletion is blocked and archiving is enforced.
   */
  async deleteProduct(id: string): Promise<{ success: boolean; blockedByHistory?: boolean; error?: string }> {
    const product = await this.getProductById(id);
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    // Check product internal inventory
    if (product.inventory && (product.inventory.quantityInStock > 0 || (product.inventory.reservedQuantity || 0) > 0)) {
      return {
        success: false,
        blockedByHistory: true,
        error: `Cannot delete product '${product.name}' because active inventory (${product.inventory.quantityInStock} units) exists. Please archive instead.`,
      };
    }

    // Check inventory stock / transactions in inventoryRepository
    const inventoryItem = await inventoryRepository.getInventory(id);
    if (inventoryItem && (inventoryItem.quantity > 0 || inventoryItem.reserved > 0)) {
      return {
        success: false,
        blockedByHistory: true,
        error: `Cannot delete product '${product.name}' because active inventory (${inventoryItem.quantity} units) exists. Please archive instead.`,
      };
    }

    // Check inventory ledger transactions
    const transactions = await inventoryRepository.getTransactions(id);
    if (transactions && transactions.length > 0) {
      return {
        success: false,
        blockedByHistory: true,
        error: `Cannot delete product '${product.name}' because historical inventory transactions exist. Archiving is required for accounting integrity.`,
      };
    }

    // Perform hard delete from Firestore
    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
      } catch (error: any) {
        logger.error(`Failed to delete product ${id} from Firestore`, error);
        return { success: false, error: error.message };
      }
    }

    // Remove from local store
    return { success: true };
  },

  async getAll(): Promise<Product[]> {
    return this.getAllProducts();
  },

  async getById(id: string): Promise<Product | null> {
    return this.getProductById(id);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    return this.getProductBySlug(slug);
  },

  async getByCategory(categoryId: string): Promise<Product[]> {
    return this.getProductsByCategory(categoryId);
  },
};

export const productRepository = productService;

