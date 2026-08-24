import React from "react";
import Link from "next/link";
import { productService } from "@/lib/firestore/products";
import { CategoryPage } from "@/components/catalog/CategoryPage";
import { 
  Droplet, 
  FlaskConical, 
  Box, 
  Tag, 
  Sparkles,
  ArrowRight
} from "lucide-react";

const SHOP_SUBCATEGORIES = [
  "Fragrance Oils",
  "Glass Bottles",
  "Packaging",
  "Custom Labels",
  "Testing Supplies",
  "Perfume Making",
  "Perfumes",
];

const categoryTiles = [
  { label: "Fragrance Oils", desc: "1,600+ Grade-A concentrates", href: "/fragrance" },
  { label: "Glass Bottles", desc: "Roll-ons, atomizers, droppers", href: "/bottles" },
  { label: "Custom Labels", desc: "Metallic foil, oil-proof vinyl", href: "/custom-labels" },
  { label: "Packaging", desc: "Boxes, shrink wrap, seals", href: "/packaging" },
  { label: "Testing Supplies", desc: "Strips, blotters, pipettes", href: "/testing" },
  { label: "Perfume Making", desc: "Solvents, bases, kits", href: "/perfume-making" },
  { label: "Perfumes", desc: "Designer and branded fragrances", href: "/perfumes" },
];

export default async function ShopMainPage() {
  const products = await productService.getAllProducts();

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {/* Category Hero Banner */}
      <div className="border-b border-gray-200 bg-gray-50 py-12 px-6 lg:px-10">
        <div className="max-w-screen-xl mx-auto space-y-6">
          <div className="space-y-2">
            <span className="sl-catalog-eyebrow">Direct Wholesale Formulary</span>
            <h1 className="sl-catalog-title">
              Perfume Formulation & Supplies
            </h1>
            <p className="sl-catalog-subtitle">
              Pure uncut fragrance concentrates, flint glass roll-on vials, graduated transfer pipettes, and custom die-cut labels.
            </p>
          </div>

          {/* Master Category Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, background: "var(--sl-gray-light)" }}>
            {categoryTiles.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "20px 16px",
                  background: "white",
                  textDecoration: "none",
                  transition: "background 0.15s",
                  minHeight: 110
                }}
                className="hover:bg-emerald-50/50"
              >
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sl-ink)", margin: "0 0 4px" }}>{cat.label}</p>
                  <p style={{ fontSize: 10, color: "var(--sl-gray-mid)", margin: 0, fontWeight: 300 }}>{cat.desc}</p>
                </div>
                <ArrowRight style={{ width: 12, height: 12, color: "#2B5F4A", marginTop: 12 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Catalog View with Filters */}
      <CategoryPage
        title="Complete Formulation Catalog"
        categoryName="All Products"
        description="Browse all available formulation raw materials, vessels, bases, testing blotters, and bespoke packaging materials."
        subcategories={SHOP_SUBCATEGORIES}
        products={products}
      />
    </div>
  );
}
