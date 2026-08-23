import React from "react";
import Link from "next/link";
import { 
  FlaskConical, 
  Sparkles, 
  Layers, 
  Box, 
  Droplet, 
  ShieldCheck, 
  Tag, 
  ArrowRight, 
  CheckCircle2, 
  Package, 
  Search,
  SlidersHorizontal,
  Truck,
  Star,
  ChevronRight
} from "lucide-react";
import { productService } from "@/lib/firestore/products";
import { ProductCard } from "@/components/catalog/ProductCard";

const CATEGORY_SHOWCASE = [
  {
    name: "Fragrance Oils",
    slug: "fragrance",
    tagline: "Grade-A Uncut Essences",
    desc: "100% pure uncut aromatic concentrates, sandalwood, floral bouquets & amber accords.",
    href: "/fragrance",
    icon: Droplet,
    badge: "100% Pure & Uncut",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "Perfume Making & Bases",
    slug: "perfume-making",
    tagline: "200-Proof SDA-40B Base",
    desc: "Commercial perfumer's alcohol, graduated transfer pipettes, and formulation kits.",
    href: "/perfume-making",
    icon: Sparkles,
    badge: "Laboratory Grade",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "Glassware & Roll-Ons",
    slug: "bottles",
    tagline: "Amber & Clear Vessels",
    desc: "5ml, 10ml, and 1oz UV-shielding amber glass bottles with stainless steel roller balls.",
    href: "/bottles",
    icon: FlaskConical,
    badge: "Bulk Fractioned",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "Custom Metallic Labels",
    slug: "custom-labels",
    tagline: "Gold Foil & Matte Vinyl",
    desc: "Private label printing die-cut to exact bottle outer diameters with square-inch pricing.",
    href: "/custom-labels",
    icon: Tag,
    badge: "Custom Die-Cut",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "Packaging & Presentation",
    slug: "packaging",
    tagline: "110 lb Cricut Boxes",
    desc: "Luxury presentation boxes, POF heat shrink wrap, and holographic security seals.",
    href: "/packaging",
    icon: Box,
    badge: "Retail Ready",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
  {
    name: "Testing & Blotter Strips",
    slug: "testing",
    tagline: "Olfactory Evaluation",
    desc: "Lint-free testing paper, trial vials, and 5ml fine mist evaluation atomizers.",
    href: "/testing",
    icon: Layers,
    badge: "Evaluation Tools",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
  },
];

export default async function HomePage() {
  const allProducts = await productService.getAllProducts();
  const featuredProducts = allProducts.filter((p) => p.featured || p.status === "active").slice(0, 8);

  return (
    <div className="space-y-24 pb-24 font-sans text-stone-900">
      
      {/* 1. High-Impact Luxury Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 border-b border-[#eae6df] bg-gradient-to-b from-[#fbf9f4] via-[#f7f5f0] to-[#fcfbf9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            
            {/* Prestige Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#e5dfd5] text-[11px] font-semibold text-amber-800 tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              DIRECT COMPOUNDING & PERFUMERY SUPPLIES
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-stone-950 tracking-tight leading-[1.12]">
              The Fine Art of <br />
              <span className="italic font-normal text-amber-800">
                Fragrance Formulation
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
              Everything you need to formulate, compound, bottle, label, and package commercial-grade perfumes. 
            </p>

            {/* Hero Integrated Search Bar */}
            <div className="max-w-xl mx-auto pt-2">
              <form action="/search" method="GET" className="relative shadow-md rounded-2xl">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  name="q"
                  placeholder="Search pure fragrance oils, amber bottles, 200 proof alcohol, foil labels..."
                  className="w-full text-sm pl-12 pr-28 py-3.5 bg-white border border-[#d6d0c4] rounded-2xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
                >
                  Explore
                </button>
              </form>

              {/* Quick search tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-[11px] text-stone-500">
                <span className="font-semibold uppercase tracking-wider text-stone-400">Popular:</span>
                <Link href="/fragrance/santal-33" className="hover:text-amber-800 hover:underline">Santal 33 Oil</Link>
                <span>&bull;</span>
                <Link href="/bottles" className="hover:text-amber-800 hover:underline">10ml Amber Roll-Ons</Link>
                <span>&bull;</span>
                <Link href="/perfume-making" className="hover:text-amber-800 hover:underline">Perfumer&apos;s Base</Link>
                <span>&bull;</span>
                <Link href="/custom-labels" className="hover:text-amber-800 hover:underline">Gold Foil Labels</Link>
                <span>&bull;</span>
                <Link href="/testing" className="hover:text-amber-800 hover:underline">Blotter Strips</Link>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
              <Link
                href="/shop"
                className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-stone-900 text-white hover:bg-stone-800 transition flex items-center gap-2 shadow-md"
              >
                Browse Full Catalog <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/custom-labels"
                className="px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-amber-900 border border-[#d6d0c4] hover:bg-stone-50 transition flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-amber-700" /> Custom Label Studio
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Curated Formulation Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#eae6df]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Curated Atelier Supplies
            </span>
            <h2 className="font-serif text-3xl font-normal text-stone-950 mt-1">
              Formulation Categories
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            View All Categories <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_SHOWCASE.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="luxury-card rounded-2xl p-6 flex flex-col justify-between group transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-800 group-hover:scale-105 transition">
                      <Icon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5f3ee] text-stone-700 border border-[#e5dfd5]">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 block">
                      {cat.tagline}
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-800 transition mt-0.5">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#f0ece5] flex items-center justify-between text-xs font-bold text-stone-900 group-hover:text-amber-800">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Compounding Essentials Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#eae6df]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Formulation Direct Supplies
            </span>
            <h2 className="font-serif text-3xl font-normal text-stone-950 mt-1">
              Featured Compounding Essentials
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            Explore Complete Shop <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. The 4-Step Formulation Atelier Compounding Guide */}
      <section className="border-y border-[#eae6df] bg-[#fbf9f4] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
              Laboratory Standard Operating Procedure
            </span>
            <h2 className="font-serif text-3xl font-normal text-stone-950">
              The Complete Perfume Formulation Workflow
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              From pure uncut raw essence to retail presentation packaging in 4 streamlined compounding phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#e5dfd5] space-y-3 shadow-sm">
              <span className="text-xs font-mono font-bold text-amber-700 block">STEP 01</span>
              <h3 className="font-serif text-lg font-bold text-stone-900">Select Grade-A Essence</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Choose pure uncut fragrance oil essences fractioned into accessible trial or compounding bottles.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e5dfd5] space-y-3 shadow-sm">
              <span className="text-xs font-mono font-bold text-amber-700 block">STEP 02</span>
              <h3 className="font-serif text-lg font-bold text-stone-900">Compound With Base</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Dilute precisely with 200-Proof SDA-40B perfumer&apos;s alcohol using graduated pipettes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e5dfd5] space-y-3 shadow-sm">
              <span className="text-xs font-mono font-bold text-amber-700 block">STEP 03</span>
              <h3 className="font-serif text-lg font-bold text-stone-900">Bottle & Seal</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Transfer into UV-shielding amber glass roll-on bottles with stainless steel balls or spray atomizers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#e5dfd5] space-y-3 shadow-sm">
              <span className="text-xs font-mono font-bold text-amber-700 block">STEP 04</span>
              <h3 className="font-serif text-lg font-bold text-stone-900">Brand & Package</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Apply custom gold metallic foil labels, presentation gift boxes, and tamper-evident shrink seals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Custom Label Atelier Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-stone-950 text-white p-8 md:p-14 overflow-hidden shadow-2xl">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-bold text-amber-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> PRIVATE LABEL ATELIER
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight">
              Die-Cut Gold Foil & Metallic Labels <br />
              <span className="italic text-amber-400">Tailored to Your Glassware</span>
            </h2>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-light">
              Upload your brand logo and custom artwork. Our automated system calculates the exact circumference and height for your bottles, computing sheet yield and square-inch pricing with gold foil, matte black, or gloss clear vinyl.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/custom-labels"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2"
              >
                Launch Custom Label Studio <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop"
                className="px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-wider rounded-xl border border-stone-800 transition"
              >
                Explore All Products
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
