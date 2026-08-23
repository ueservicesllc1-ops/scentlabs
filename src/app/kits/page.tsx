import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function KitsCategoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CatalogBrowser
        initialProducts={INITIAL_PRODUCTS}
        fixedCategory="kits"
        title="Perfume Maker & Packaging Kits"
        subtitle="Turnkey starter sets for roll-on creation, discovery sampling, and perfumery business launching."
      />
    </div>
  );
}
