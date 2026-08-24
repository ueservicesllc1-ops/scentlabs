"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { TestingProduct } from "@/types/testing";
import { useCart } from "@/context/CartContext";

export function TestingProductCard({ product }: { product: TestingProduct }) {
  const { addItem } = useCart();
  const [selectedPkgIndex, setSelectedPkgIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const activePkg = product.packageOptions?.[selectedPkgIndex] || product.packageOptions?.[0] || {
    id: "pkg_0", name: "Default", quantity: 1,
    price: product.basePrice || 5.0, unitPrice: product.basePrice || 5.0,
  };

  const handleAdd = () => {
    const prod: any = {
      id: product.id,
      name: `${product.name} (${activePkg.quantity} ${product.unit}s)`,
      slug: product.slug,
      category: "testing",
      sku: `${product.sku}-${activePkg.quantity}`,
      basePrice: activePkg.price,
      media: [{ url: product.primaryImage, type: "image", isPrimary: true, altText: product.name }],
      packageOptions: product.packageOptions || [activePkg],
    };
    addItem(prod, activePkg, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const categoryLabel = (product.subcategory || product.category || "Testing")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const [imgError, setImgError] = useState(false);

  return (
    <article className="sl-card">
      {/* Image */}
      <Link href={`/testing/${product.slug}`} className="sl-card-image block" style={{ display: "block" }}>
        {product.primaryImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.primaryImage} alt={product.name}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} />
        ) : (
          <div className="sl-card-placeholder">
            <div className="sl-card-placeholder-line" />
            <span className="sl-card-placeholder-label">{categoryLabel}</span>
            <div className="sl-card-placeholder-line" />
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="sl-card-body">
        <span className="sl-card-eyebrow">{categoryLabel}</span>

        <Link href={`/testing/${product.slug}`}>
          <h3 className="sl-card-name">{product.name}</h3>
        </Link>

        {product.description && (
          <p style={{ fontSize: 11, color: "var(--sl-gray-mid)", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
            {product.description}
          </p>
        )}

        {/* Pack size pills */}
        {product.packageOptions && product.packageOptions.length > 1 && (
          <div className="sl-card-pills">
            {product.packageOptions.slice(0, 4).map((pkg, idx) => (
              <button key={pkg.id} type="button"
                onClick={() => setSelectedPkgIndex(idx)}
                className={`sl-pill ${selectedPkgIndex === idx ? "active" : ""}`}
              >
                {pkg.quantity}{product.unit?.[0] || "u"}
              </button>
            ))}
          </div>
        )}

        <div className="sl-card-footer">
          <div>
            <span className="sl-price">${activePkg.price.toFixed(2)}</span>
            <span className="sl-price-unit">${activePkg.unitPrice.toFixed(3)} / {product.unit || "unit"}</span>
          </div>
          <button type="button" onClick={handleAdd} className={`sl-add-btn ${added ? "added" : ""}`}>
            {added ? <><Check className="inline w-3 h-3 mr-1" />Done</> : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
