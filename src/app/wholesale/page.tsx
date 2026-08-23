import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function WholesaleCategoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CatalogBrowser
        initialProducts={INITIAL_PRODUCTS}
        fixedCategory="wholesale"
        title="High-Volume Wholesale Tiers"
        subtitle="Master case quantities (500 to 10,000+ units) with dedicated freight schedules for growing fragrance brands."
      />
    </div>
  );
}
