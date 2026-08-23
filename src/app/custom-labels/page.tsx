import React from "react";
import { Metadata } from "next";
import { CustomLabelBuilder } from "@/components/custom-labels/CustomLabelBuilder";

export const metadata: Metadata = {
  title: "Custom Perfume Labels Studio | SCENTLAB Supplies",
  description: "Configure metallic foil and waterproof vinyl perfume labels. Select custom sizes, foils, and upload artwork with instant volume pricing.",
};

export default function CustomLabelsPage() {
  return <CustomLabelBuilder />;
}
