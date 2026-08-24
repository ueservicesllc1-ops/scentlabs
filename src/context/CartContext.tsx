"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Product, ProductCategory, SellingPackage } from "@/types";
import { INITIAL_PRODUCTS, SHRINK_WRAP_VARIANTS } from "@/data/products";
import { calculateCartSummary, PricingCalculationResult } from "@/services/pricing.service";

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    pkg: SellingPackage,
    packageCount?: number,
    customOptions?: {
      linkedParentItemId?: string;
      isCustomItem?: boolean;
      selectedVariant?: {
        id: string;
        name: string;
        sku: string;
      };
      customLabelSpecs?: {
        bottleName?: string;
        dimensions?: string;
        material?: string;
        customText?: string;
        product?: string;
        size?: string;
        finish?: string;
        quantity?: number;
        unitPrice?: number;
        total?: number;
        designFile?: string;
      };
      customBoxSpecs?: {
        dimensions: string;
        material: string;
        quantity: number;
      };
    }
  ) => string; // returns cart item id
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, packageCount: number) => void;
  clearCart: () => void;
  itemCount: number;
  totalUnits: number;
  summary: PricingCalculationResult;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load cart from localStorage on mount and sanitize prohibited sizes
  useEffect(() => {
    try {
      const saved = localStorage.getItem("scentlab_cart");
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved);
        const ALLOWED_FRAGRANCE_SIZES = [1, 2, 4, 8, 16];
        const sanitized = parsed.filter((item) => {
          if (item.category === "fragrance" || item.productId?.startsWith("frag_")) {
            const size = item.selectedPackage?.quantity;
            if (size !== undefined && !ALLOWED_FRAGRANCE_SIZES.includes(size)) {
              console.warn(`Purging prohibited fragrance size: ${size} oz from cart.`);
              return false;
            }
          }
          return true;
        });
        setItems(sanitized);
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("scentlab_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart", e);
    }
  }, [items]);

  const addItem: CartContextType["addItem"] = (
    product,
    pkg,
    packageCount = 1,
    customOptions
  ) => {
    // Validate fragrance size
    if (product.category === "fragrance" || product.id?.startsWith("frag_")) {
      const ALLOWED_FRAGRANCE_SIZES = [1, 2, 4, 8, 16];
      if (pkg.quantity !== undefined && !ALLOWED_FRAGRANCE_SIZES.includes(pkg.quantity)) {
        console.error(`Rejected prohibited fragrance size ${pkg.quantity} oz. Only 1, 2, 4, 8, 16 oz allowed.`);
        return "";
      }
    }

    const newItemId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Check if duplicate line exists with same package and linked status
    const existingIndex = items.findIndex(
      (item) =>
        item.productId === product.id &&
        item.selectedPackage.id === pkg.id &&
        item.parentCartItemId === customOptions?.linkedParentItemId
    );

    if (existingIndex > -1 && !customOptions?.isCustomItem) {
      const updated = [...items];
      updated[existingIndex].packageCount += packageCount;
      updated[existingIndex].totalUnits =
        updated[existingIndex].selectedPackage.quantity *
        updated[existingIndex].packageCount;
      updated[existingIndex].totalLinePrice =
        updated[existingIndex].packagePrice * updated[existingIndex].packageCount;
      setItems(updated);
      setIsCartDrawerOpen(true);
      return updated[existingIndex].id;
    }

    const newItem: CartItem = {
      id: newItemId,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      category: (product.category as ProductCategory) || "fragrance",
      sku: product.sku || product.id,
      image: (product.media && product.media[0]?.url) || (product as any).primaryImageUrl || (product as any).primaryImage || "",
      selectedPackage: pkg,
      packageCount,
      totalUnits: pkg.quantity * packageCount,
      unitPrice: pkg.unitPrice,
      packagePrice: pkg.price,
      totalLinePrice: pkg.price * packageCount,
      isLinkedToParent: !!customOptions?.linkedParentItemId,
      parentCartItemId: customOptions?.linkedParentItemId,
      selectedVariant: customOptions?.selectedVariant,
      customLabelSpecs: customOptions?.customLabelSpecs,
      customBoxSpecs: customOptions?.customBoxSpecs,
    };

    setItems((prev) => [...prev, newItem]);
    setIsCartDrawerOpen(true);
    return newItemId;
  };

  const removeItem = (itemId: string) => {
    // Remove item and any child items linked to it
    setItems((prev) =>
      prev.filter((item) => item.id !== itemId && item.parentCartItemId !== itemId)
    );
  };

  const updateQuantity = (itemId: string, packageCount: number) => {
    if (packageCount <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            packageCount,
            totalUnits: item.selectedPackage.quantity * packageCount,
            totalLinePrice: item.packagePrice * packageCount,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.packageCount, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.totalUnits, 0);

  // Build product cost lookup for the pricing service
  const productCostLookup = INITIAL_PRODUCTS.reduce((acc, p) => {
    acc[p.id] = {
      totalUnitCost: p.costData?.totalUnitCost || 0,
      discountEligible: p.discountEligible ?? true,
      minimumDiscountMargin: p.minimumDiscountMargin || 0.4,
    };
    return acc;
  }, {} as Record<string, { totalUnitCost: number; discountEligible: boolean; minimumDiscountMargin: number }>);

  const summary = calculateCartSummary(items, productCostLookup);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        totalUnits,
        summary,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
