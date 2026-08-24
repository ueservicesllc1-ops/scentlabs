import React from "react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";

export default function BottlesCategoryPage() {
  return (
    <CatalogBrowser
      initialProducts={INITIAL_PRODUCTS}
      fixedCategory="bottles"
      title="Frascos de Vidrio y Envases Plásticos HDPE"
      subtitle="Frascos de vidrio para perfumería terminada (spray y roll-on) y botellas plásticas HDPE de alta resistencia química para formulación y maceración."
    />
  );
}
