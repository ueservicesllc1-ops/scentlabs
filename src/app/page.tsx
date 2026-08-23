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
  Scissors,
  ArrowRight,
  CheckCircle2,
  Package
} from "lucide-react";
import { INITIAL_PRODUCTS } from "@/data/products";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";
import { ProductCard } from "@/components/catalog/ProductCard";
import { PerfumeMakingWorkflow } from "@/components/perfume-making/PerfumeMakingWorkflow";

const CATEGORY_TILES = [
  {
    name: "Fragrance Oils",
    slug: "fragrance",
    desc: "Grade-A uncut perfume bases, woody accords & floral essences",
    href: "/fragrance",
    icon: Droplet,
    color: "text-amber-400",
  },
  {
    name: "Perfume Making",
    slug: "perfume-making",
    desc: "200-proof perfumer's base alcohol, bottles, transfer pipettes & kits",
    href: "/perfume-making",
    icon: Sparkles,
    color: "text-amber-400",
  },
  {
    name: "Packaging & Boxes",
    slug: "packaging",
    desc: "110 lb Cricut presentation boxes, holographic security seals & POF wrap",
    href: "/packaging",
    icon: Box,
    color: "text-emerald-400",
  },
  {
    name: "Testing Supplies",
    slug: "testing",
    desc: "Lint-free blotter strips, 5ml trial vials & fine mist spray atomizers",
    href: "/testing",
    icon: FlaskConical,
    color: "text-indigo-400",
  },
  {
    name: "Custom Labels",
    slug: "custom-labels",
    desc: "Metallic foil labels die-cut precisely to bottle outer diameters",
    href: "/custom-labels",
    icon: Tag,
    color: "text-amber-400",
  },
];

export default function HomePage() {
  const featuredProducts = INITIAL_PRODUCTS.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="space-y-20 pb-20 font-mono">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-20 border-b border-lab-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-lab-900/60 via-lab-950 to-lab-950 -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lab-900 border border-lab-700 text-xs text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              SCENTLAB DIRECT FORMULATION & COMPOUNDING PLATFORM
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
              PROFESSIONAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">
                FRAGRANCE SUPPLIES
              </span>
            </h1>

            <p className="text-base sm:text-lg text-lab-300 font-normal leading-relaxed">
              &quot;Everything you need to formulate, bottle, label, and package your own perfumes.&quot;
            </p>

            <p className="text-xs sm:text-sm text-lab-400 leading-relaxed max-w-2xl">
              Buy bulk supplier quantities fractioned into accessible packs. Pure fragrance oils, 200-proof base alcohol, high-precision glassware, custom foil labels, and retail presentation boxes.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/shop"
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-white text-lab-950 hover:bg-lab-200 transition flex items-center gap-2 shadow-lg"
              >
                <Layers className="w-4 h-4" /> Shop All Supplies
              </Link>
              <Link
                href="/fragrance"
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-lab-900 border border-lab-700 text-white hover:bg-lab-800 transition flex items-center gap-2"
              >
                <Droplet className="w-4 h-4 text-amber-400" /> Fragrance Oils
              </Link>
              <Link
                href="/perfume-making"
                className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-amber-500/10"
              >
                <Sparkles className="w-4 h-4" /> Start Making
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHAT DO YOU NEED? (5 Pillar Navigation) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-lab-800 pb-4">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
            HOW SCENTLAB WORKS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            What Do You Need For Your Perfume Line?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {CATEGORY_TILES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={cat.href}
                className="p-5 rounded-2xl border border-lab-800 bg-lab-950/80 hover:border-amber-500/50 hover:bg-lab-900 transition flex flex-col justify-between group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="w-8 h-8 rounded-lg bg-lab-900 border border-lab-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <span className="text-[10px] text-lab-600 font-bold">0{idx + 1}</span>
                  </div>

                  <h3 className="font-bold text-white uppercase text-sm group-hover:text-amber-400 transition">
                    {cat.name}
                  </h3>

                  <p className="text-lab-400 text-[11px] leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-lab-900 flex items-center justify-between text-amber-400 text-[11px] font-bold">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Visual 6-Step Perfume Studio Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PerfumeMakingWorkflow />
      </section>

      {/* 4. Featured Production Supplies */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex justify-between items-end border-b border-lab-800 pb-4">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
                LABORATORY ESSENTIALS
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Featured Compounding Supplies
              </h2>
            </div>

            <Link
              href="/shop"
              className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Pure Fragrance Concentrates Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end border-b border-lab-800 pb-4">
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest block">
              GRADE-A UNCUT BASES
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              Popular Fragrance Oils
            </h2>
          </div>

          <Link
            href="/fragrance"
            className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase flex items-center gap-1"
          >
            All Fragrances <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {INITIAL_FRAGRANCES.slice(0, 3).map((frag) => (
            <div
              key={frag.id}
              className="p-5 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] text-amber-400 font-bold uppercase">
                  <span>{frag.scentFamily}</span>
                  <span>{frag.gender}</span>
                </div>
                <h3 className="text-base font-bold text-white uppercase">{frag.name}</h3>
                <p className="text-xs text-lab-400 line-clamp-2 leading-relaxed">
                  {frag.description}
                </p>
                <div className="text-xs text-amber-400 font-bold">
                  Starting at ${frag.repackagingVariants[0]?.retailPrice.toFixed(2)} / 1 oz
                </div>
              </div>

              <Link
                href={`/fragrance/${frag.slug}`}
                className="w-full py-2.5 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-center font-bold text-xs text-white uppercase transition"
              >
                View Fragrance & Tiers
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
