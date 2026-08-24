"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const defaultPackage =
    product.packageOptions?.find((p) => p.isDefault) || product.packageOptions?.[0] || {
      id: "pkg_0",
      name: "Default",
      quantity: 1,
      price: product.basePrice,
      unitPrice: product.basePrice,
    };

  const startingPrice = product.packageOptions?.length
    ? Math.min(...product.packageOptions.map((p) => p.price))
    : product.basePrice;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, defaultPackage, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageUrl =
    product.primaryImageUrl ||
    (product.media && product.media[0]?.url);

  const categoryLabel = (product.categoryName || product.category || "Supply")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const [imgError, setImgError] = useState(false);

  return (
    <article className="sl-card">
      {/* Image */}
      <Link href={`/product/${product.slug}`} className="sl-card-image block" style={{ display: "block" }}>
        {imageUrl && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={product.name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
        ) : (
          <div className="sl-card-placeholder">
            <div className="sl-card-placeholder-line" />
            <span className="sl-card-placeholder-label">{categoryLabel}</span>
            <div className="sl-card-placeholder-line" />
          </div>
        )}
        {product.featured && <span className="sl-badge sl-badge-green">Featured</span>}
      </Link>

      {/* Body */}
      <div className="sl-card-body">
        <span className="sl-card-eyebrow">{categoryLabel}</span>

        <Link href={`/product/${product.slug}`}>
          <h3 className="sl-card-name">{product.name}</h3>
        </Link>

        {product.description && (
          <p style={{ fontSize: 11, color: "var(--sl-gray-mid)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
            {product.description}
          </p>
        )}

        <div className="sl-card-footer">
          <div>
            <span className="sl-price">From ${startingPrice.toFixed(2)}</span>
            <span className="sl-price-unit">${defaultPackage.unitPrice.toFixed(3)} / unit</span>
          </div>
          <button type="button" onClick={handleAdd} className={`sl-add-btn ${added ? "added" : ""}`}>
            {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
