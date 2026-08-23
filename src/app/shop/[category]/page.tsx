import React from "react";
import { notFound } from "next/navigation";
import { INITIAL_PRODUCTS } from "@/data/products";
import { INITIAL_CATEGORIES } from "@/config/categories";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default function DynamicCategoryPage({ params }: CategoryPageProps) {
  const categoryKey = params.category.toLowerCase();
  const categoryInfo = INITIAL_CATEGORIES.find(
    (c) => c.slug.toLowerCase() === categoryKey
  );

  if (!categoryInfo && categoryKey !== "all") {
    // If not matching one of the 8 canonical categories, 404
    const validCategory = INITIAL_PRODUCTS.some((p) => p.category.toLowerCase() === categoryKey);
    if (!validCategory) {
      notFound();
    }
  }

  const categoryTitle = categoryInfo?.name || categoryKey.toUpperCase();
  const categorySubtitle = categoryInfo?.description || "Browse technical laboratory and compounding supplies.";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CatalogBrowser
        initialProducts={INITIAL_PRODUCTS}
        fixedCategory={categoryKey}
        title={`${categoryTitle} Catalog`}
        subtitle={categorySubtitle}
      />
    </div>
  );
}
