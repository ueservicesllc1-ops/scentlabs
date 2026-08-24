import React from "react";
import { Metadata } from "next";
import { PerfumesCatalog } from "@/components/perfumes/PerfumesCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fine Fragrances & Finished Perfumes | SCENTLAB Atelier",
  description: "Explore our collection of finished fine perfumes and designer-inspired formulations.",
};

export default function PerfumesPage() {
  return <PerfumesCatalog />;
}
