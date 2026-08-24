"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Check, Search, X } from "lucide-react";

interface PackagingItem {
  id: string;
  name: string;
  slug: string;
  subcategory: "Boxes" | "Tags" | "Security Stickers" | "Heat Shrink Wrap Bags";
  description: string;
  dimensions?: string;
  imageUrl?: string;
  sku: string;
  packageOptions: Array<{
    id: string;
    label: string;
    quantity: number;
    price: number;
    unitPrice: number;
  }>;
}

const PACKAGING_PRODUCTS: PackagingItem[] = [
  {
    id: "prod_box_10ml",
    name: "Roll-On Box — 10 ml",
    slug: "roll-on-box-10ml",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 0.95\" × 3.65\" × 0.95\" (2.4 × 9.3 × 2.4 cm) for 10ml glass roll-ons.",
    dimensions: "0.95\" × 3.65\" × 0.95\"",
    sku: "BOX-ROL-10ML",
    imageUrl: "/images/products/perfume-boxes.jpg",
    packageOptions: [
      { id: "pkg_box_10ml_25", label: "25u", quantity: 25, price: 11.25, unitPrice: 0.45 },
      { id: "pkg_box_10ml_50", label: "50u", quantity: 50, price: 20.00, unitPrice: 0.40 },
      { id: "pkg_box_10ml_100", label: "100u", quantity: 100, price: 35.00, unitPrice: 0.35 },
      { id: "pkg_box_10ml_250", label: "250u", quantity: 250, price: 75.00, unitPrice: 0.30 },
    ],
  },
  {
    id: "prod_box_30ml",
    name: "Rectangular Perfume Box — 30 ml",
    slug: "rectangular-perfume-box-30ml",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 1.65\" × 4.85\" × 1.65\" (4.2 × 12.3 × 4.2 cm) for 30ml spray bottles.",
    dimensions: "1.65\" × 4.85\" × 1.65\"",
    sku: "BOX-FLD-30ML",
    imageUrl: "/images/products/perfume-boxes.jpg",
    packageOptions: [
      { id: "pkg_box_30ml_25", label: "25u", quantity: 25, price: 16.25, unitPrice: 0.65 },
      { id: "pkg_box_30ml_50", label: "50u", quantity: 50, price: 29.00, unitPrice: 0.58 },
      { id: "pkg_box_30ml_100", label: "100u", quantity: 100, price: 50.00, unitPrice: 0.50 },
    ],
  },
  {
    id: "prod_box_50ml",
    name: "Rectangular Perfume Box — 50 ml",
    slug: "rectangular-perfume-box-50ml",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 2.10\" × 5.20\" × 2.10\" (5.3 × 13.2 × 5.3 cm) for 50ml perfume bottles.",
    dimensions: "2.10\" × 5.20\" × 2.10\"",
    sku: "BOX-FLD-50ML",
    imageUrl: "/images/products/perfume-boxes.jpg",
    packageOptions: [
      { id: "pkg_box_50ml_25", label: "25u", quantity: 25, price: 18.75, unitPrice: 0.75 },
      { id: "pkg_box_50ml_50", label: "50u", quantity: 50, price: 34.00, unitPrice: 0.68 },
      { id: "pkg_box_50ml_100", label: "100u", quantity: 100, price: 60.00, unitPrice: 0.60 },
    ],
  },
  {
    id: "prod_shrink_4x6",
    name: "POF Heat Shrink Bags (4×6 in · 10ml Roll-On)",
    slug: "shrink-wrap-bags-4x6",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge crystal-clear polyolefin shrink film. Pre-sealed bottom for 10ml roll-on bottles and packaging.",
    dimensions: "4\" × 6\"",
    sku: "PKG-SHR-0406",
    imageUrl: "/images/products/shrink-wrap.jpg",
    packageOptions: [
      { id: "pkg_shrink_4x6_50", label: "50u", quantity: 50, price: 5.00, unitPrice: 0.10 },
      { id: "pkg_shrink_4x6_100", label: "100u", quantity: 100, price: 10.00, unitPrice: 0.10 },
    ],
  },
  {
    id: "prod_shrink_6x6",
    name: "POF Heat Shrink Bags (6×6 in · 30ml Bottle)",
    slug: "shrink-wrap-bags-6x6",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge POF heat shrink film for 30ml spray atomizers and small rectangular perfume boxes.",
    dimensions: "6\" × 6\"",
    sku: "PKG-SHR-0606",
    imageUrl: "/images/products/shrink-wrap.jpg",
    packageOptions: [
      { id: "pkg_shrink_6x6_50", label: "50u", quantity: 50, price: 6.00, unitPrice: 0.12 },
      { id: "pkg_shrink_6x6_100", label: "100u", quantity: 100, price: 11.00, unitPrice: 0.11 },
    ],
  },
  {
    id: "prod_shrink_6x8",
    name: "POF Heat Shrink Bags (6×8 in · 50ml/100ml)",
    slug: "shrink-wrap-bags-6x8",
    subcategory: "Heat Shrink Wrap Bags",
    description: "100 Gauge POF heat shrink film for 50ml and 100ml presentation boxes and glass bottles.",
    dimensions: "6\" × 8\"",
    sku: "PKG-SHR-0608",
    imageUrl: "/images/products/shrink-wrap.jpg",
    packageOptions: [
      { id: "pkg_shrink_6x8_50", label: "50u", quantity: 50, price: 6.00, unitPrice: 0.12 },
      { id: "pkg_shrink_6x8_100", label: "100u", quantity: 100, price: 11.00, unitPrice: 0.11 },
    ],
  },
  {
    id: "prod_security_stickers",
    name: "Holographic Security Seals",
    slug: "holographic-security-stickers",
    subcategory: "Security Stickers",
    description: "Tamper-evident holographic security stickers for box tucks, bottle caps, and laboratory closures.",
    dimensions: "0.75 in diameter",
    sku: "PKG-SEC-HOLO-100",
    imageUrl: "/images/products/security-stickers.jpg",
    packageOptions: [
      { id: "pkg_sec_100", label: "100u", quantity: 100, price: 4.50, unitPrice: 0.045 },
      { id: "pkg_sec_200", label: "200u", quantity: 200, price: 6.00, unitPrice: 0.03 },
    ],
  },
  {
    id: "prod_tags_cord",
    name: "Metallic Hang Tags with Elastic Cord",
    slug: "tags-with-cord",
    subcategory: "Tags",
    description: "Metallic hang tags with elastic cord for perfume packaging, bottle neck presentation, and branding.",
    dimensions: "Pack with Cord",
    sku: "PKG-TAG-50",
    imageUrl: "/images/products/hang-tags.jpg",
    packageOptions: [
      { id: "pkg_tag_50", label: "50u", quantity: 50, price: 3.80, unitPrice: 0.076 },
      { id: "pkg_tag_100", label: "100u", quantity: 100, price: 5.00, unitPrice: 0.05 },
    ],
  },
];

const SUBCATEGORIES = [
  "All",
  "Boxes",
  "Heat Shrink Wrap Bags",
  "Security Stickers",
  "Tags",
];

function PackagingProductCard({ item }: { item: PackagingItem }) {
  const { addItem } = useCart();
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const activePkg = item.packageOptions[selectedPkgIndex] || item.packageOptions[0];

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    const productProxy: any = {
      id: `${item.id}_${activePkg.quantity}`,
      name: `${item.name} (${activePkg.quantity} Units)`,
      slug: item.slug,
      category: "packaging",
      sku: `${item.sku}-${activePkg.quantity}`,
      basePrice: activePkg.price,
      currency: "USD",
      packageOptions: [
        {
          id: activePkg.id,
          name: activePkg.label,
          quantity: activePkg.quantity,
          price: activePkg.price,
          unitPrice: activePkg.unitPrice,
        },
      ],
      media: item.imageUrl ? [{ url: item.imageUrl, type: "image", isPrimary: true, altText: item.name }] : [],
    };

    addItem(productProxy, productProxy.packageOptions[0], 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="sl-card">
      {/* ── Image ── */}
      <Link href={`/product/${item.slug}`} className="sl-card-image block" style={{ display: "block" }}>
        {item.imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div className="sl-card-placeholder">
            <div className="sl-card-placeholder-line" />
            <span className="sl-card-placeholder-label">{item.subcategory}</span>
            <div className="sl-card-placeholder-line" />
          </div>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="sl-card-body">
        <span className="sl-card-eyebrow">{item.subcategory}</span>

        <Link href={`/product/${item.slug}`}>
          <h3 className="sl-card-name">{item.name}</h3>
        </Link>

        {item.dimensions && (
          <p className="text-[10px] font-mono text-gray-500 font-medium">
            {item.dimensions}
          </p>
        )}

        <p style={{ fontSize: 11, color: "var(--sl-gray-mid)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
          {item.description}
        </p>

        {/* Quantity / Pack Selector Pills */}
        <div className="sl-card-pills">
          {item.packageOptions.map((pkg, idx) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedPkgIndex(idx)}
              className={`sl-pill ${selectedPkgIndex === idx ? "active" : ""}`}
            >
              {pkg.label}
            </button>
          ))}
        </div>

        {/* Footer: Price + Add Button */}
        <div className="sl-card-footer">
          <div>
            <span className="sl-price">${activePkg.price.toFixed(2)}</span>
            <span className="sl-price-unit">
              ${activePkg.unitPrice.toFixed(2)} / unit
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className={`sl-add-btn ${added ? "added" : ""}`}
          >
            {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}

export function PackagingCatalog() {
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = useMemo(() => {
    return PACKAGING_PRODUCTS.filter((item) => {
      const matchCat =
        selectedSubcategory === "All" ||
        item.subcategory === selectedSubcategory;
      const matchSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedSubcategory, searchQuery]);

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      
      {/* ── Page Header ── */}
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="sl-catalog-header">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <span className="sl-catalog-eyebrow">Presentation & Protection</span>
              <h1 className="sl-catalog-title">Perfume Packaging Supplies</h1>
              <p className="sl-catalog-subtitle">
                Cajas plegables de línea, sellos holográficos de seguridad, bolsas termorretráctiles POF y etiquetas colgantes.
              </p>
            </div>

            {/* Search */}
            <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#8A8A8A" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packaging…"
                style={{
                  width: "100%",
                  fontSize: 12,
                  paddingLeft: 36,
                  paddingRight: searchQuery ? 32 : 12,
                  paddingTop: 8,
                  paddingBottom: 8,
                  border: "1px solid var(--sl-gray-light)",
                  background: "white",
                  color: "var(--sl-ink)",
                  outline: "none",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--sl-green)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--sl-gray-light)")}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
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
      <div className="sl-filter-bar" style={{ top: 48 }}>
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 40, paddingRight: 40, gap: 0 }}>
          {SUBCATEGORIES.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`sl-filter-pill ${selectedSubcategory === sub ? "active" : ""}`}
              onClick={() => setSelectedSubcategory(sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8 space-y-12">
        
        {/* ── Standard Product Grid (4 Columns) ── */}
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3 flex justify-between items-center">
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">
              Packaging Catalog
            </span>
            <span className="text-xs text-gray-400 font-mono">
              {filteredProducts.length} productos
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <h3 className="text-base font-semibold text-gray-950">No Packaging Products Found</h3>
              <p className="text-xs text-gray-500 font-light">
                No items match your search or filter selection.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--sl-gray-light)" }}>
              {filteredProducts.map((item) => (
                <div key={item.id} style={{ background: "white" }}>
                  <PackagingProductCard item={item} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
