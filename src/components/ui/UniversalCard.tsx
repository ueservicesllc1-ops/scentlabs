"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

/**
 * UniversalCard — the ONE card component used across ALL SCENTLAB pages.
 * Fragrances, Bottles, Supplies, Testing, Packaging, Custom Labels.
 */
export interface UniversalCardProduct {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  href: string;
  imageUrl?: string;
  eyebrow?: string;          // Category label shown above name (e.g. "Fragrance Oils", "Testing")
  badge?: string;            // Small top-right badge (e.g. "Men", "Women", "New")
  badgeVariant?: "default" | "green"; // Style of badge
  meta?: string;             // Italic subtext below name
  price?: number;            // Starting price
  priceLabel?: string;       // Override price display (e.g. "From $2.49")
  unitLabel?: string;        // Unit text below price (e.g. "per oz", "per unit")
  pills?: Array<{ label: string; value: string; price?: number }>; // Size/pack selector
  requiresCustomization?: boolean;
  // cart integration
  cartProduct?: any;
  cartPackage?: any;
}

interface Props {
  product: UniversalCardProduct;
  onPillChange?: (value: string) => void;
}

export function UniversalCard({ product }: Props) {
  const { addItem } = useCart();
  const [selectedPill, setSelectedPill] = useState(0);
  const [added, setAdded] = useState(false);

  const activePill = product.pills?.[selectedPill];
  const displayPrice = activePill?.price ?? product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!product.cartProduct) return;
    const pkg = product.cartPackage || product.cartProduct?.packageOptions?.[0];
    if (!pkg) return;
    addItem(product.cartProduct, pkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="sl-card">
      {/* ── Image ── */}
      <Link href={product.href} className="sl-card-image block">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
        ) : (
          <div className="sl-card-placeholder">
            <div className="sl-card-placeholder-line" />
            <span className="sl-card-placeholder-label">{product.eyebrow || "SCENTLAB"}</span>
            <div className="sl-card-placeholder-line" />
          </div>
        )}

        {/* Badge */}
        {product.badge && (
          <span className={`sl-badge ${product.badgeVariant === "green" ? "sl-badge-green" : ""}`}>
            {product.badge}
          </span>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="sl-card-body">
        {product.eyebrow && (
          <span className="sl-card-eyebrow">{product.eyebrow}</span>
        )}

        <Link href={product.href}>
          <h3 className="sl-card-name">{product.name}</h3>
        </Link>

        {product.meta && (
          <p className="sl-card-meta">{product.meta}</p>
        )}

        {/* Pills */}
        {product.pills && product.pills.length > 0 && (
          <div className="sl-card-pills">
            {product.pills.map((pill, idx) => (
              <button
                key={pill.value}
                type="button"
                onClick={() => setSelectedPill(idx)}
                className={`sl-pill ${selectedPill === idx ? "active" : ""}`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        )}

        {/* Footer: price + action */}
        <div className="sl-card-footer">
          <div>
            {displayPrice !== undefined ? (
              <>
                <span className="sl-price">
                  {product.priceLabel ?? `$${displayPrice.toFixed(2)}`}
                </span>
                {product.unitLabel && (
                  <span className="sl-price-unit">{product.unitLabel}</span>
                )}
              </>
            ) : (
              <span className="sl-price">—</span>
            )}
          </div>

          {product.requiresCustomization ? (
            <Link href={product.href} className="sl-add-btn customize">
              Customize
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={`sl-add-btn ${added ? "added" : ""}`}
            >
              {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
