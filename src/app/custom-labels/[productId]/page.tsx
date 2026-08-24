import React from "react";
import { Metadata } from "next";
import { CustomLabelBuilder } from "@/components/custom-labels/CustomLabelBuilder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product-Specific Custom Perfume Labels | SCENTLAB Supplies",
  description: "Die-cut labels engineered for exact bottle dimensions with premium metallic foil finishes.",
};

export default function ProductCustomLabelPage({ params }: { params: { productId: string } }) {
  return <CustomLabelBuilder initialProductId={params.productId} />;
}
