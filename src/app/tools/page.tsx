import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function ToolsCategoryPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CatalogBrowser
        initialProducts={INITIAL_PRODUCTS}
        fixedCategory="tools"
        title="Graduated Transfer Pipettes & Droppers"
        subtitle="3ml and 5ml polyethylene graduated transfer pipettes, droppers, and precision measuring tools."
      />
    </div>
  );
}
