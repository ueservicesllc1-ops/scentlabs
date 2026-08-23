import React from "react";
import { Metadata } from "next";
import { TestingCatalog } from "@/components/testing/TestingCatalog";

export const metadata: Metadata = {
  title: "Perfume Testing & Sample Supplies | SCENTLAB",
  description: "Lint-free blotter strips, 5ml amber sample bottles, fine mist atomizers, and fragrance discovery starter kits.",
};

export default function TestingPage() {
  return <TestingCatalog />;
}
