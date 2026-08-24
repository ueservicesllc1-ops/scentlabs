import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function BottlesCategoryPage() {
  return (
    <CatalogBrowser
      initialProducts={INITIAL_PRODUCTS}
      fixedCategory="bottles"
      title="Flint Glass Bottles & Atomizers"
      subtitle="Precision glass enclosures across 5ml, 10ml, 30ml, 50ml, and 100ml roll-on and spray formats."
    />
  );
}
