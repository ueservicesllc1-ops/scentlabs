import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function BottlesCategoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CatalogBrowser
        initialProducts={INITIAL_PRODUCTS}
        fixedCategory="bottles"
        title="Flint Glass Bottles, Roll-Ons & Atomizers"
        subtitle="Precision glass enclosures across 5ml, 10ml, 30ml, 50ml, 100ml, 250ml, and 500ml formats."
      />
    </div>
  );
}
