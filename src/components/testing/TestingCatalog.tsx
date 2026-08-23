"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TestingProduct, SampleKitBundleFoundation } from "@/types/testing";
import { testingRepository } from "@/lib/firestore/testing";
import { TestingProductCard } from "./TestingProductCard";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { 
  FlaskConical, 
  Search, 
  Sparkles, 
  Package, 
  Layers, 
  ShoppingBag, 
  Check, 
  ArrowRight 
} from "lucide-react";

const SUBCATEGORIES = [
  "All",
  "Blotter Strips",
  "Sample Bottles",
  "Atomizers",
  "Testing Kits",
];

export function TestingCatalog() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<TestingProduct[]>([]);
  const [kits, setKits] = useState<SampleKitBundleFoundation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedKitId, setAddedKitId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const prods = await testingRepository.getAllTestingProducts();
      setProducts(prods);
      const kt = await testingRepository.getTestingKits();
      setKits(kt);
      setLoading(false);
    };
    load();
  }, []);

  const handleAddKit = (kit: SampleKitBundleFoundation) => {
    const kitProxy: any = {
      id: kit.id,
      name: kit.name,
      slug: kit.slug,
      category: "testing",
      sku: "TEST-KIT-STARTER",
      basePrice: kit.bundlePrice || 8.50,
      media: [{ url: "/images/products/testing-kit.jpg", type: "image", isPrimary: true, altText: kit.name }],
      packageOptions: [
        { id: `pkg_${kit.id}`, quantity: 1, price: kit.bundlePrice || 8.50, unitPrice: kit.bundlePrice || 8.50 },
      ],
      pricingTiers: [],
    };

    const pkg = { id: `pkg_${kit.id}`, quantity: 1, price: kit.bundlePrice || 8.50, unitPrice: kit.bundlePrice || 8.50 };
    addItem(kitProxy, pkg, 1);
    setAddedKitId(kit.id);
    setTimeout(() => setAddedKitId(null), 2500);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sampleSize && p.sampleSize.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSub = selectedSubcategory === "All" || p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    return matchesSearch && matchesSub;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 font-mono">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-widest">
          <FlaskConical className="w-4 h-4" /> LABORATORY & OLFACTIVE EVALUATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Fragrance Testing & Sample Supplies
        </h1>
        <p className="text-xs text-lab-400 max-w-3xl leading-relaxed">
          Calibrated lint-free blotter strips, 5 ml amber glass sample vials, fine mist atomizers, and discovery kits. Essential tools for evaluating evaporation curves before committing to bulk production.
        </p>
      </div>

      {/* Testing Kit Starter Feature Banner */}
      {kits.length > 0 && (selectedSubcategory === "All" || selectedSubcategory === "Testing Kits") && (
        <div className="p-6 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-lab-900 to-lab-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 text-[10px] font-bold uppercase">
                Featured Testing Bundle
              </span>
              <span className="text-[11px] text-emerald-400 font-bold">Save 20% Bundle Discount</span>
            </div>
            <h2 className="text-xl font-bold text-white uppercase">{kits[0].name}</h2>
            <p className="text-xs text-lab-300 max-w-2xl leading-relaxed">
              Includes 10x 5ml Amber Sample Bottles, 50x Lint-Free Blotters, 2x 5ml Spray Atomizers, and 1x 10ml Atomizer for comprehensive formulation testing.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 whitespace-nowrap">
            <div>
              <span className="text-[10px] text-lab-500 uppercase block">Bundle Price</span>
              <span className="text-2xl font-black text-amber-400">{formatCurrency(kits[0].bundlePrice || 8.50)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleAddKit(kits[0])}
              className={`px-5 py-3 rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 shadow-lg ${
                addedKitId === kits[0].id
                  ? "bg-emerald-500 text-lab-950"
                  : "bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20"
              }`}
            >
              {addedKitId === kits[0].id ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              {addedKitId === kits[0].id ? "Added Kit!" : "Add Starter Kit"}
            </button>
          </div>
        </div>
      )}

      {/* Subcategory Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SUBCATEGORIES.map((sub) => {
          const isSelected = selectedSubcategory === sub;
          return (
            <button
              key={sub}
              type="button"
              onClick={() => setSelectedSubcategory(sub)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? "bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/20"
                  : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white hover:border-lab-700"
              }`}
            >
              {sub}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blotters, 5ml vials, atomizers..."
          className="w-full bg-lab-950 border border-lab-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-lab-600 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mr-3" />
          Loading testing supplies...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-16 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
          <FlaskConical className="w-10 h-10 text-lab-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Testing Supplies Found</h3>
          <p className="text-xs text-lab-400">
            Try adjusting your search or selecting &quot;All&quot; subcategories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <TestingProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Two-Way Navigation Banner: Testing -> Fragrance */}
      <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-white uppercase block">
            Looking for Pure Fragrance Oils to Evaluate?
          </span>
          <p className="text-xs text-lab-400 mt-0.5">
            Browse our Grade-A uncut perfume bases, woody accords, and floral essences.
          </p>
        </div>

        <Link
          href="/fragrance"
          className="px-5 py-2.5 rounded-xl bg-lab-800 hover:bg-amber-500 hover:text-lab-950 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 whitespace-nowrap"
        >
          Shop Fragrance Oils <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
