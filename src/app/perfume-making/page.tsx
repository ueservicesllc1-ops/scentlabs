import React from "react";
import { Metadata } from "next";
import { PerfumeMakingWorkflow } from "@/components/perfume-making/PerfumeMakingWorkflow";
import { CompleteYourPerfumeCrossSell } from "@/components/perfume-making/CompleteYourPerfumeCrossSell";
import Link from "next/link";
import { Sparkles, Droplet, FlaskConical, Box, Tag, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Perfume Making & Compounding Supplies | SCENTLAB",
  description: "200-proof perfumer's base alcohol, roll-on vials, pipettes, custom metallic labels, and complete compounding kits.",
};

export default function PerfumeMakingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 font-mono">
      {/* Visual Workflow Builder */}
      <PerfumeMakingWorkflow />

      {/* Cross-Sell & Discovery Block */}
      <CompleteYourPerfumeCrossSell />

      {/* Subcategory Exploration Grid */}
      <div className="space-y-4 pt-6 border-t border-lab-800">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Explore Perfume Making Subcategories
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <Link
            href="/fragrance"
            className="p-4 rounded-xl border border-lab-800 bg-lab-950 hover:border-amber-500/50 transition flex flex-col justify-between"
          >
            <Droplet className="w-5 h-5 text-amber-400 mb-2" />
            <div>
              <span className="font-bold text-white uppercase block">Fragrance Oils</span>
              <span className="text-[10px] text-lab-500">Uncut pure perfume fractions</span>
            </div>
          </Link>

          <Link
            href="/shop/bottles"
            className="p-4 rounded-xl border border-lab-800 bg-lab-950 hover:border-amber-500/50 transition flex flex-col justify-between"
          >
            <Box className="w-5 h-5 text-amber-400 mb-2" />
            <div>
              <span className="font-bold text-white uppercase block">Glass Bottles</span>
              <span className="text-[10px] text-lab-500">Roll-ons & spray atomizers</span>
            </div>
          </Link>

          <Link
            href="/custom-labels"
            className="p-4 rounded-xl border border-lab-800 bg-lab-950 hover:border-amber-500/50 transition flex flex-col justify-between"
          >
            <Tag className="w-5 h-5 text-amber-400 mb-2" />
            <div>
              <span className="font-bold text-white uppercase block">Custom Labels</span>
              <span className="text-[10px] text-lab-500">Metallic foil die-cut studio labels</span>
            </div>
          </Link>

          <Link
            href="/testing"
            className="p-4 rounded-xl border border-lab-800 bg-lab-950 hover:border-amber-500/50 transition flex flex-col justify-between"
          >
            <FlaskConical className="w-5 h-5 text-indigo-400 mb-2" />
            <div>
              <span className="font-bold text-white uppercase block">Testing Supplies</span>
              <span className="text-[10px] text-lab-500">Blotters & 5ml trial vials</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
