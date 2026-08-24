"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { FragranceOil } from "@/types/fragrance";
import { useCart } from "@/context/CartContext";

interface FragranceCardProps {
  fragrance: FragranceOil;
}

export function FragranceCard({ fragrance }: FragranceCardProps) {
  const { addItem } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [added, setAdded] = useState(false);

  // SCENTLAB strictly sells ONLY approved sizes: 1 OZ, 2 OZ, 4 OZ, 8 OZ, 16 OZ
  const ALLOWED_SIZES = [1, 2, 4, 8, 16];

  const variants = (fragrance.repackagingVariants?.length
    ? fragrance.repackagingVariants.filter((v) => v.active && ALLOWED_SIZES.includes(v.sellingSize))
    : []
  );

  const safeVariants = variants.length > 0 ? variants : [
    {
      id: "1oz",
      sellingSize: 1,
      sellingUnit: "oz" as const,
      retailPrice: 8.5,
      sku: `${fragrance.id}-1OZ`,
      active: true,
    } as any,
  ];

  const activeVariant = safeVariants[selectedVariantIndex] || safeVariants[0];
  const activePrice =
    typeof activeVariant.retailPrice === "number" ? activeVariant.retailPrice : 0;
  const activeSize = activeVariant.sellingSize || 1;

  const sizeLabel = (v: any) => {
    return `${v.sellingSize} OZ`;
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const pkg: any = {
      id: activeVariant.id,
      name: `${activeVariant.sellingSize} ${activeVariant.sellingUnit || "oz"}`,
      quantity: activeSize,
      price: activePrice,
      unitPrice: activeSize ? activePrice / activeSize : activePrice,
    };
    const prod: any = {
      id: `${fragrance.id}_${activeVariant.id}`,
      name: `${fragrance.name} — ${sizeLabel(activeVariant)}`,
      slug: fragrance.slug,
      sku: activeVariant.sku || fragrance.id,
      category: "fragrance",
      basePrice: activePrice,
      currency: "USD",
      packageOptions: [pkg],
      media: [],
    };
    addItem(prod, pkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageUrl =
    fragrance.primaryImage ||
    ((fragrance as any).media && (fragrance as any).media[0]?.url);

  const displayVariants = safeVariants.slice(0, 5);

  return (
    <article className="sl-card">
      {/* ── Image ── */}
      <Link href={`/fragrance/${fragrance.slug}`} className="sl-card-image block" style={{ display: "block" }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={fragrance.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
          />
        ) : (
          <div className="sl-card-placeholder">
            <div className="sl-card-placeholder-line" />
            <span className="sl-card-placeholder-label">{fragrance.scentFamily || "Fragrance"}</span>
            <div className="sl-card-placeholder-line" />
          </div>
        )}

        {/* Gender badge */}
        {fragrance.gender && (
          <span className="sl-badge">
            {fragrance.gender.charAt(0).toUpperCase() + fragrance.gender.slice(1)}
          </span>
        )}
      </Link>

      {/* ── Body ── */}
      <div className="sl-card-body">
        {/* Eyebrow */}
        <span className="sl-card-eyebrow">{fragrance.scentFamily || "Fragrance Oil"}</span>

        {/* Name */}
        <Link href={`/fragrance/${fragrance.slug}`}>
          <h3 className="sl-card-name">{fragrance.name}</h3>
        </Link>

        {/* Reference */}
        {fragrance.fragranceReference && (
          <p className="sl-card-meta">{fragrance.fragranceReference}</p>
        )}

        {/* Size pills */}
        {displayVariants.length > 0 && (
          <div className="sl-card-pills">
            {displayVariants.map((v, idx) => (
              <button
                key={v.id || idx}
                type="button"
                onClick={() => setSelectedVariantIndex(idx)}
                className={`sl-pill ${selectedVariantIndex === idx ? "active" : ""}`}
              >
                {sizeLabel(v)}
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="sl-card-footer">
          <div>
            <span className="sl-price">${activePrice.toFixed(2)}</span>
            <span className="sl-price-unit">
              {activeSize > 0 ? `$${(activePrice / activeSize).toFixed(2)} / oz` : ""}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className={`sl-add-btn ${added ? "added" : ""}`}
          >
            {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
