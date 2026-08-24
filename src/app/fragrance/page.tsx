import React from "react";
import { Metadata } from "next";
import { FragranceCatalog } from "@/components/fragrance/FragranceCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pure Fragrance Oils Catalog | SCENTLAB Supplies",
  description: "Grade-A uncut fragrance oils fractioned into 1 oz, 2 oz, 4 oz, 8 oz, and 16 oz clear plastic bottles with airtight seals.",
};

export default function FragrancePage() {
  return <FragranceCatalog />;
}
