"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { productRepository } from "@/lib/firestore/products";
import { CategoryPage } from "@/components/catalog/CategoryPage";
import { 
  Sparkles, 
  Droplet, 
  FlaskConical, 
  Box, 
  Tag, 
  Layers, 
  ArrowRight,
  ShieldCheck 
} from "lucide-react";

const SHOP_SUBCATEGORIES = [
  "Fragrance",
  "Bottles",
  "Packaging",
  "Tools",
  "Testing",
  "Custom Labels",
];

export default function ShopMainPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await productRepository.getAll();
      setProducts(all);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-12 pb-16 font-mono">
      {/* Hero Quick Category Jumps */}
      <div className="border-b border-lab-800/80 bg-gradient-to-b from-lab-950 via-lab-900/60 to-lab-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> MASTER PERFUME COMPOUNDING STORE
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Direct Formulation & Compounding Supplies
            </h1>
            <p className="text-xs sm:text-sm text-lab-300 leading-relaxed">
              Industrial grade fragrance oils, 200-proof perfumer&apos;s base alcohol, flint glass roll-ons, graduated transfer pipettes, personalized metallic labels, and presentation boxes.
            </p>
          </div>

          {/* 5 Master Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
            <Link
              href="/fragrance"
              className="p-4 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-amber-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg"
            >
              <Droplet className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-white uppercase block">Fragrance Oils</span>
                <span className="text-[10px] text-lab-400">Pure uncut concentrates</span>
              </div>
            </Link>

            <Link
              href="/perfume-making"
              className="p-4 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-amber-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg"
            >
              <Sparkles className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-white uppercase block">Perfume Making</span>
                <span className="text-[10px] text-lab-400">Base alcohol, pipettes, kits</span>
              </div>
            </Link>

            <Link
              href="/packaging"
              className="p-4 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-amber-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg"
            >
              <Box className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-white uppercase block">Packaging</span>
                <span className="text-[10px] text-lab-400">Cricut boxes, seals, shrink wrap</span>
              </div>
            </Link>

            <Link
              href="/testing"
              className="p-4 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-indigo-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg"
            >
              <FlaskConical className="w-6 h-6 text-indigo-400 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-white uppercase block">Testing Supplies</span>
                <span className="text-[10px] text-lab-400">Blotters, 5ml trial vials</span>
              </div>
            </Link>

            <Link
              href="/custom-labels"
              className="p-4 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-amber-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg col-span-2 sm:col-span-1"
            >
              <Tag className="w-6 h-6 text-amber-400 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-white uppercase block">Custom Labels</span>
                <span className="text-[10px] text-lab-400">Metallic foil die-cut studio</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Catalog View */}
      <CategoryPage
        title="Complete Supplies Catalog"
        categoryName="Shop"
        description="Filter by product category, pack size, or search for specific supplies across our entire catalog."
        subcategories={SHOP_SUBCATEGORIES}
        products={products}
        loading={loading}
      />
    </div>
  );
}
