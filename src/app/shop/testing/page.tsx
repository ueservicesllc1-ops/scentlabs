import React from "react";
import { Metadata } from "next";
import { TestingCatalog } from "@/components/testing/TestingCatalog";

export const metadata: Metadata = {
  title: "Testing Supplies & Sample Vials | SCENTLAB Shop",
  description: "Browse perfume blotters, 5ml and 10ml spray atomizers, sample bottles, and trial supplies in bulk packs.",
};

export default function ShopTestingPage() {
  return <TestingCatalog />;
}
