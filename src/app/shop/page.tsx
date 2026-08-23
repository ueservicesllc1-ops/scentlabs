import React from "react";
import Link from "next/link";
import { Product } from "@/types/product";
import { productService } from "@/lib/firestore/products";
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

export default async function ShopMainPage() {
  const products = await productService.getAllProducts();

  return (
    <div className="space-y-12 pb-20 font-sans text-stone-900">
      {/* Category Hero Banner */}
      <div className="border-b border-[#eae6df] bg-[#fbf9f4] py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e5dfd5] text-amber-800 text-xs font-semibold uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" /> MASTER PERFUME COMPOUNDING STORE
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-stone-950 tracking-tight">
              Direct Formulation & Compounding Catalog
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl font-light">
              Industrial grade fragrance oils, 200-proof perfumer&apos;s base alcohol, amber glass roll-ons, graduated transfer pipettes, personalized metallic labels, and presentation boxes.
            </p>
          </div>

          {/* Master Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
            <Link
              href="/fragrance"
              className="p-5 rounded-2xl border border-[#eae6df] bg-white hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between group"
            >
              <Droplet className="w-6 h-6 text-amber-700 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-stone-900 block font-serif text-sm">Fragrance Oils</span>
                <span className="text-[10px] text-stone-500">Pure uncut concentrates</span>
              </div>
            </Link>

            <Link
              href="/perfume-making"
              className="p-5 rounded-2xl border border-[#eae6df] bg-white hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between group"
            >
              <Sparkles className="w-6 h-6 text-amber-700 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-stone-900 block font-serif text-sm">Perfume Making</span>
                <span className="text-[10px] text-stone-500">Base alcohol, pipettes, kits</span>
              </div>
            </Link>

            <Link
              href="/packaging"
              className="p-5 rounded-2xl border border-[#eae6df] bg-white hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between group"
            >
              <Box className="w-6 h-6 text-amber-700 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-stone-900 block font-serif text-sm">Packaging</span>
                <span className="text-[10px] text-stone-500">Cricut boxes, seals, shrink wrap</span>
              </div>
            </Link>

            <Link
              href="/testing"
              className="p-5 rounded-2xl border border-[#eae6df] bg-white hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between group"
            >
              <FlaskConical className="w-6 h-6 text-amber-700 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-stone-900 block font-serif text-sm">Testing Supplies</span>
                <span className="text-[10px] text-stone-500">Blotters, 5ml trial vials</span>
              </div>
            </Link>

            <Link
              href="/custom-labels"
              className="p-5 rounded-2xl border border-amber-300 bg-amber-50/50 hover:border-amber-600 hover:shadow-md transition flex flex-col justify-between group"
            >
              <Tag className="w-6 h-6 text-amber-700 mb-4 group-hover:scale-110 transition" />
              <div>
                <span className="font-bold text-amber-900 block font-serif text-sm">Custom Labels</span>
                <span className="text-[10px] text-amber-700">Gold foil, die-cut to size</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Catalog View with Filters */}
      <CategoryPage
        title="Complete Formulation Catalog"
        categoryName="All Products"
        description="Browse all available formulation raw materials, vessels, bases, testing blotters, and bespoke packaging materials."
        subcategories={SHOP_SUBCATEGORIES}
        products={products}
      />
    </div>
  );
}
