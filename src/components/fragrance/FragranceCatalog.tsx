"use client";

import React, { useEffect, useState } from "react";
import { FragranceOil, ScentFamily } from "@/types/fragrance";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { FragranceCard } from "./FragranceCard";
import { 
  Sparkles, 
  Search, 
  Filter, 
  FlaskConical, 
  SlidersHorizontal, 
  Droplet 
} from "lucide-react";

const SCENT_FAMILIES: ScentFamily[] = [
  "All",
  "Woody",
  "Amber",
  "Tobacco",
  "Fresh",
  "Floral",
  "Citrus",
  "Oriental",
  "Musk",
  "Gourmand",
  "Spicy",
  "Green",
  "Leather",
];

export function FragranceCatalog() {
  const [fragrances, setFragrances] = useState<FragranceOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc">("name");

  useEffect(() => {
    const fetchFragrances = async () => {
      const all = await fragranceRepository.getAllFragrances();
      setFragrances(all);
      setLoading(false);
    };

    fetchFragrances();
  }, []);

  const filteredFragrances = fragrances
    .filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.scentFamily.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.fragranceReference && f.fragranceReference.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFamily =
        selectedFamily === "All" || f.scentFamily.toLowerCase() === selectedFamily.toLowerCase();

      const matchesGender =
        selectedGender === "all" || (f.gender && f.gender.toLowerCase() === selectedGender.toLowerCase());

      return matchesSearch && matchesFamily && matchesGender;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const minA = Math.min(...a.repackagingVariants.map((v) => v.retailPrice));
      const minB = Math.min(...b.repackagingVariants.map((v) => v.retailPrice));
      if (sortBy === "price_asc") return minA - minB;
      if (sortBy === "price_desc") return minB - minA;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-lab-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest">
          <Droplet className="w-4 h-4" /> UNCUT PERFUME & BODY OIL FRACTIONS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Pure Fragrance Oils Catalog
        </h1>
        <p className="text-xs text-lab-400 max-w-3xl leading-relaxed">
          Laboratory-grade, Grade-A uncut fragrance oils. Sourced directly in bulk and fractioned into 1 oz, 2 oz, 4 oz, 8 oz, and 16 oz dark glass containers with precision volume scaling.
        </p>
      </div>

      {/* Scent Family Pill Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SCENT_FAMILIES.map((family) => {
          const isSelected = selectedFamily === family;
          return (
            <button
              key={family}
              type="button"
              onClick={() => setSelectedFamily(family)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? "bg-amber-500 text-lab-950 border-amber-400 shadow-md shadow-amber-500/20"
                  : "bg-lab-900/60 text-lab-400 border-lab-800 hover:text-white hover:border-lab-700"
              }`}
            >
              {family}
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fragrance oils, olfactive accords, or inspiration..."
            className="w-full bg-lab-950 border border-lab-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full bg-lab-950 border border-lab-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Gender Accords</option>
            <option value="unisex">Unisex</option>
            <option value="masculine">Masculine</option>
            <option value="feminine">Feminine</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full bg-lab-950 border border-lab-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
          Loading fragrance oils catalog...
        </div>
      ) : filteredFragrances.length === 0 ? (
        <div className="p-16 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
          <FlaskConical className="w-10 h-10 text-lab-600 mx-auto" />
          <h3 className="text-sm font-bold text-white uppercase">No Fragrance Oils Found</h3>
          <p className="text-xs text-lab-400">
            No formulations matched your filters. Try clearing your search query or selecting &quot;All&quot; scent families.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFragrances.map((fragrance) => (
            <FragranceCard key={fragrance.id} fragrance={fragrance} />
          ))}
        </div>
      )}
    </div>
  );
}
