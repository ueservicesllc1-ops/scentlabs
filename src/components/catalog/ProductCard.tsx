"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const activePkg = product.packageOptions?.[0] || {
    id: "pkg_default",
    name: "Standard Pack",
    quantity: 1,
    price: product.basePrice || 0,
    unitPrice: product.basePrice || 0,
  };

  const requiresCustomization =
    Boolean(product.isCustomLabelProduct) ||
    Boolean(product.customizable) ||
    (product.category as string) === "custom-labels" ||
    (product.category as string) === "custom";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (requiresCustomization) return;
    addItem(product, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imageUrl =
    product.primaryImageUrl ||
    (product.media && (product.media as any[])[0]?.url) ||
    (product.images && (product.images as any[])[0]?.url);

  let productUrl = `/product/${product.slug}`;
  if (product.category === "fragrance" || product.category === "fragrance_oils") productUrl = `/fragrance/${product.slug}`;
  else if (product.category === "testing") productUrl = `/testing/${product.slug}`;
  else if (product.category === "custom-labels" || product.category === "custom_labels") productUrl = `/custom-labels/${product.id}`;

  const startingPrice = product.packageOptions?.length
    ? Math.min(...product.packageOptions.map((p) => p.price))
    : product.basePrice || activePkg.price || 0;

  const categoryLabel = product.categoryName || product.category || "Supplies";

  const [imgError, setImgError] = useState(false);

  return (
    <article className="sl-card">
      {/* Image */}
      <Link href={productUrl} className="sl-card-image block" style={{ display: "block" }}>
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
        {product.featured && (
          <span className="sl-badge sl-badge-green">Featured</span>
        )}
        {product.isCustomLabelProduct && (
          <span className="sl-badge">Custom</span>
        )}
      </Link>

      {/* Body */}
      <div className="sl-card-body">
        <span className="sl-card-eyebrow">{categoryLabel}</span>

        <Link href={productUrl}>
          <h3 className="sl-card-name">{product.name}</h3>
        </Link>

        {product.description && (
          <p className="sl-card-meta" style={{ WebkitLineClamp: 1, fontStyle: "normal", color: "var(--sl-gray-mid)", fontSize: 11 }}>
            {product.description}
          </p>
        )}

        <div className="sl-card-footer">
          <div>
            <span className="sl-price">From ${startingPrice.toFixed(2)}</span>
            {activePkg.unitPrice && activePkg.unitPrice !== startingPrice && (
              <span className="sl-price-unit">${activePkg.unitPrice.toFixed(3)} / unit</span>
            )}
          </div>
          {requiresCustomization ? (
            <Link href={productUrl} className="sl-add-btn customize">Customize</Link>
          ) : (
            <button type="button" onClick={handleAdd} className={`sl-add-btn ${added ? "added" : ""}`}>
              {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
