"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Check, Search, X, Package as PackageIcon } from "lucide-react";
import { productService } from "@/lib/firestore/products";

interface PackagingItem {
  id: string;
  name: string;
  slug: string;
  subcategory: "Boxes" | "Tags" | "Security Stickers" | "Heat Shrink Wrap Bags" | string;
  description: string;
  dimensions?: string;
  imageUrl?: string;
  sku: string;
  status?: string;
  packageOptions: Array<{
    id: string;
    label: string;
    quantity: number;
    price: number;
    unitPrice: number;
  }>;
}

const DEFAULT_PACKAGING_PRODUCTS: PackagingItem[] = [
  {
    id: "prod_box_10ml",
    name: "Roll-On Box — 10 ml",
    slug: "roll-on-box-10ml",
    subcategory: "Boxes",
    description: "110 lb Smooth White Cardstock. Fixed dimensions: 0.95\" × 3.65\" × 0.95\" (2.4 × 9.3 × 2.4 cm) for 10ml glass roll-ons.",
    dimensions: "0.95\" × 3.65\" × 0.95\"",
    sku: "BOX-ROL-10ML",
    status: "active",
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
    status: "active",
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
    status: "active",
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
    imageUrl: "https://m.media-amazon.com/images/I/71WjT-Yc7OL._AC_SL1500_.jpg",
    status: "active",
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
    imageUrl: "https://m.media-amazon.com/images/I/71WjT-Yc7OL._AC_SL1500_.jpg",
    status: "active",
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
    imageUrl: "https://m.media-amazon.com/images/I/71WjT-Yc7OL._AC_SL1500_.jpg",
    status: "active",
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
    status: "active",
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
    status: "active",
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

  const hasValidImage = !!(item.imageUrl && item.imageUrl.trim().length > 0 && !imgError);

  return (
    <article className="sl-card">
      {/* ── Image ── */}
      <Link href={`/product/${item.slug}`} className="sl-card-image block" style={{ display: "block" }}>
        {hasValidImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: "12px", transition: "transform 0.4s ease" }}
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
            <span className="sl-price">${(activePkg?.price || 0).toFixed(2)}</span>
            <span className="sl-price-unit">
              ${(activePkg?.unitPrice || 0).toFixed(2)} / unit
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
  const [productsList, setProductsList] = useState<PackagingItem[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const allProds = await productService.getAllProducts();
        
        // Build initial active map
        const activeItems: PackagingItem[] = [];

        // 1. Process default items
        DEFAULT_PACKAGING_PRODUCTS.forEach((defItem) => {
          const match = (allProds || []).find(
            (p) => p.id === defItem.id || p.slug === defItem.slug || p.sku === defItem.sku
          );

          if (match) {
            // Only add if explicitly active
            if (match.status === "active") {
              const liveImg =
                match.primaryImageUrl ||
                (match.media && (match.media as any[])[0]?.url) ||
                (match.images && match.images[0]?.url) ||
                defItem.imageUrl ||
                "";

              activeItems.push({
                ...defItem,
                name: match.name || defItem.name,
                description: match.description || match.shortDescription || defItem.description,
                imageUrl: liveImg,
                status: match.status,
              });
            }
            // If match.status === "draft" or "archived", do NOT add (it's hidden!)
          } else {
            // Not customized yet, show default if active
            if (defItem.status === "active") {
              activeItems.push(defItem);
            }
          }
        });

        // 2. Add any other custom active packaging products created in Firestore
        (allProds || []).forEach((p) => {
          if (
            p.status === "active" &&
            (p.category === "packaging" || p.categoryId === "cat_packaging" || p.id.startsWith("prod_pack_")) &&
            !activeItems.some((item) => item.id === p.id)
          ) {
            const liveImg =
              p.primaryImageUrl ||
              (p.media && (p.media as any[])[0]?.url) ||
              (p.images && p.images[0]?.url) ||
              "";

            activeItems.push({
              id: p.id,
              name: p.name,
              slug: p.slug,
              subcategory: (p.subcategory as any) || "Boxes",
              description: p.description || p.shortDescription || "",
              sku: p.sku,
              imageUrl: liveImg,
              status: p.status,
              packageOptions:
                p.packageOptions && p.packageOptions.length > 0
                  ? p.packageOptions.map((opt: any) => ({
                      id: opt.id,
                      label: opt.name || `${opt.quantity}u`,
                      quantity: opt.quantity,
                      price: opt.price,
                      unitPrice: opt.unitPrice || opt.price / opt.quantity,
                    }))
                  : [
                      {
                        id: `pkg_${p.id}`,
                        label: "1u",
                        quantity: 1,
                        price: p.basePrice,
                        unitPrice: p.basePrice,
                      },
                    ],
            });
          }
        });

        setProductsList(activeItems);
      } catch (err) {
        console.error("Failed to load packaging catalog:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    return productsList.filter((item) => {
      if (item.status && item.status !== "active") return false;

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
  }, [productsList, selectedSubcategory, searchQuery]);

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

        {/* ── Subcategory Navigation Tabs ── */}
        <div className="sl-filter-bar flex justify-between items-center">
          <div className="sl-tabs">
            {SUBCATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedSubcategory(cat)}
                className={`sl-tab ${selectedSubcategory === cat ? "active" : ""}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <span className="text-xs text-gray-500 font-mono">
            {filteredProducts.length} productos
          </span>
        </div>

        {/* ── Product Grid ── */}
        <div className="py-8 pb-16">
          {loading ? (
            <div className="py-20 text-center text-gray-400 text-xs">
              Cargando catálogo de empaques...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-2">
              <PackageIcon className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-gray-900">No hay productos de empaque visibles en esta sección</p>
              <p className="text-xs text-gray-500 font-light">Prueba seleccionando otra subcategoría o ajustando la búsqueda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((item) => (
                <PackagingProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
