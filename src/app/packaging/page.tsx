import React from "react";
import { Metadata } from "next";
import { PackagingCatalog } from "@/components/packaging/PackagingCatalog";

export const metadata: Metadata = {
  title: "Perfume Packaging & Presentation Supplies | SCENTLAB",
  description: "Cricut custom perfume boxes, tags with cord, holographic security stickers, and heat shrink wrap bags.",
};

export default function PackagingPage() {
  return <PackagingCatalog />;
}
