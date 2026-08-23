import React from "react";
import { Metadata } from "next";
import { FragranceCatalog } from "@/components/fragrance/FragranceCatalog";

export const metadata: Metadata = {
  title: "Fragrance Oils & Perfume Bases | SCENTLAB Shop",
  description: "Browse uncut pure fragrance oils, woody, amber, floral, and fresh accords in bulk and fractioned presentations.",
};

export default function ShopFragrancePage() {
  return <FragranceCatalog />;
}
