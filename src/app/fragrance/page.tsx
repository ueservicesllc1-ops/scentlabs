import React from "react";
import { Metadata } from "next";
import { FragranceCatalog } from "@/components/fragrance/FragranceCatalog";

export const metadata: Metadata = {
  title: "Pure Fragrance Oils Catalog | SCENTLAB Supplies",
  description: "Grade-A uncut fragrance oils fractioned into 1 oz, 2 oz, 4 oz, 8 oz, and 16 oz dark glass containers.",
};

export default function FragrancePage() {
  return <FragranceCatalog />;
}
