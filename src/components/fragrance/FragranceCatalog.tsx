"use client";

import React, { useEffect, useState, useMemo } from "react";
import { FragranceOil } from "@/types/fragrance";
import { fragranceRepository } from "@/lib/firestore/fragrance";
import { FragranceCard } from "./FragranceCard";
import { Search, X } from "lucide-react";

const FAMILIES = [
  "All", "Woody", "Amber", "Floral", "Fresh", "Citrus",
  "Oriental", "Musk", "Gourmand", "Spicy", "Tobacco", "Green", "Leather",
];
const PAGE_SIZE = 48;

export function FragranceCatalog() {
  const [fragrances, setFragrances] = useState<FragranceOil[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("All");
  const [gender, setGender] = useState("all");
  const [sort, setSort] = useState<"name" | "price_asc" | "price_desc">("name");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fragranceRepository.getAllFragrances().then((all) => {
      // Public storefront: only show fragrances that have at least one photo
      const withPhoto = all.filter(
        (f) => !!(f.primaryImage || (f.images && f.images.length > 0))
      );
      setFragrances(withPhoto);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return fragrances
      .filter((f) => {
        if ((f as any).status === "draft" || (f as any).status === "archived") return false;

        const q = search.toLowerCase();
        const matchQ = !q || f.name.toLowerCase().includes(q) ||
          (f.scentFamily && f.scentFamily.toLowerCase().includes(q)) ||
          (f.fragranceReference && f.fragranceReference.toLowerCase().includes(q));
        const matchF = family === "All" || f.scentFamily?.toLowerCase() === family.toLowerCase();
        const matchG = gender === "all" || f.gender?.toLowerCase() === gender.toLowerCase();
        return matchQ && matchF && matchG;
      })
      .sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        const pa = a.repackagingVariants?.length ? Math.min(...a.repackagingVariants.map((v) => v.retailPrice)) : 0;
        const pb = b.repackagingVariants?.length ? Math.min(...b.repackagingVariants.map((v) => v.retailPrice)) : 0;
        return sort === "price_asc" ? pa - pb : pb - pa;
      });
  }, [fragrances, search, family, gender, sort]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = page * PAGE_SIZE < filtered.length;
  const hasFilters = search || family !== "All" || gender !== "all";

  const reset = () => { setSearch(""); setFamily("All"); setGender("all"); setSort("name"); setPage(1); };

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>

      {/* ── Page Header ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="sl-catalog-header">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="sl-catalog-eyebrow">Pure Concentration · Grade-A</span>
              <h1 className="sl-catalog-title">Fragrance Oils</h1>
              <p className="sl-catalog-subtitle">
                1,600+ wholesale fragrance concentrates fractioned to order.
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72 shrink-0">
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#8A8A8A" }} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search fragrances…"
                className="w-full text-xs pl-9 pr-8 py-2 border border-gray-300 bg-white text-gray-900 rounded-md outline-none focus:border-[#2B5F4A]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#8A8A8A", background: "none", border: "none", cursor: "pointer" }}
                >
                  <X style={{ width: 13, height: 13 }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div className="sl-filter-bar sticky z-30 bg-white border-b border-gray-200 top-0">
        <div className="flex items-center w-full px-3 sm:px-6 overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          {/* Family pills */}
          <div className="flex items-center flex-nowrap shrink-0">
            {FAMILIES.map((f) => (
              <button
                key={f}
                type="button"
                className={`sl-filter-pill ${family === f ? "active" : ""}`}
                onClick={() => { setFamily(f); setPage(1); }}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-[8px]" />

          {/* Quick Selects in filter bar */}
          <div className="flex items-center shrink-0">
            <select
              value={gender}
              onChange={(e) => { setGender(e.target.value); setPage(1); }}
              className="text-[10px] font-semibold tracking-wider uppercase border-none bg-transparent text-gray-500 cursor-pointer py-3.5 px-2 outline-none"
            >
              <option value="all">All</option>
              <option value="women">Women</option>
              <option value="men">Men</option>
              <option value="unisex">Unisex</option>
            </select>

            <div className="w-[1px] h-4 bg-gray-200 mx-1" />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="text-[10px] font-semibold tracking-wider uppercase border-none bg-transparent text-gray-500 cursor-pointer py-3.5 px-2 outline-none"
            >
              <option value="name">A–Z</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>

            {hasFilters && (
              <>
                <div className="w-[1px] h-4 bg-gray-200 mx-1" />
                <button
                  type="button"
                  onClick={reset}
                  className="text-[10px] font-semibold tracking-wider uppercase border-none bg-transparent text-[#C8963E] cursor-pointer py-3.5 px-2"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">

        <p style={{ fontSize: 10, color: "var(--sl-gray-mid)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 20 }}>
          {loading ? "Loading…" : `${filtered.length.toLocaleString()} references`}
        </p>

        {loading ? (
          <div style={{ paddingTop: 120, paddingBottom: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: 18, height: 18, border: "2px solid var(--sl-green)", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sl-gray-mid)" }}>Loading essences…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--sl-gray-mid)" }}>No fragrances match your selection.</p>
            <button type="button" onClick={reset}
              style={{ marginTop: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", color: "var(--sl-green)", cursor: "pointer", textDecoration: "underline" }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Responsive grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
              {paginated.map((frag) => (
                <FragranceCard key={frag.id} fragrance={frag} />
              ))}
            </div>

            {/* Responsive override */}
            <style>{`
              @media (max-width: 1024px) { .frag-grid { grid-template-columns: repeat(3, 1fr) !important; } }
              @media (max-width: 640px)  { .frag-grid { grid-template-columns: repeat(2, 1fr) !important; } }
            `}</style>

            {/* Load more */}
            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
                <button type="button" onClick={() => setPage((p) => p + 1)}
                  style={{ padding: "12px 40px", border: "1px solid var(--sl-ink)", background: "transparent", color: "var(--sl-ink)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "var(--sl-ink)"; (e.target as HTMLButtonElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "transparent"; (e.target as HTMLButtonElement).style.color = "var(--sl-ink)"; }}
                >
                  Load More ({filtered.length - page * PAGE_SIZE} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
