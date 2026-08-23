import React from "react";
import { Metadata } from "next";
import { PackagingCatalog } from "@/components/packaging/PackagingCatalog";

export const metadata: Metadata = {
  title: "Packaging & Boxes | SCENTLAB Shop",
  description: "Browse perfume packaging, custom die-cut boxes, hang tags with cord, shrink wrap bags, and tamper seals.",
};

export default function ShopPackagingPage() {
  return <PackagingCatalog />;
}
