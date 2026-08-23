import React from "react";
import { Metadata } from "next";
import { CustomLabelBuilder } from "@/components/custom-labels/CustomLabelBuilder";

interface ProductLabelPageProps {
  params: {
    productId: string;
  };
}

export const metadata: Metadata = {
  title: "Product-Specific Custom Perfume Labels | SCENTLAB Supplies",
  description: "Die-cut labels engineered for exact bottle dimensions with premium metallic foil finishes.",
};

export default function ProductCustomLabelPage({ params }: ProductLabelPageProps) {
  return <CustomLabelBuilder initialProductId={params.productId} />;
}
