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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categoryTiles.map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="flex flex-col justify-between p-4 sm:p-5 bg-white border border-gray-200 rounded-xl hover:border-emerald-600 hover:shadow-sm transition group no-underline min-h-[110px]"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-emerald-800 mb-1">{cat.label}</p>
                  <p className="text-[10px] text-gray-500 font-light leading-relaxed">{cat.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 mt-3 group-hover:translate-x-0.5 transition-transform" />
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
