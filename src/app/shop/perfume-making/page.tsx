import React from "react";
import { Metadata } from "next";
import PerfumeMakingPage from "@/app/perfume-making/page";

export const metadata: Metadata = {
  title: "Perfume Making Category | SCENTLAB Shop",
  description: "Shop perfumer's base alcohol, bottles, transfer pipettes, and compounding kits.",
};

export default function ShopPerfumeMakingPage() {
  return <PerfumeMakingPage />;
}
