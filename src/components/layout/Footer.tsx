import React from "react";
import Link from "next/link";
import { 
  FlaskConical, 
  ShieldCheck, 
  Truck, 
  Layers, 
  Sparkles, 
  Droplet, 
  Box, 
  Tag,
  Mail,
  Lock
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#f5f3ee] text-[#292524] border-t border-[#e5e0d8] font-sans">
      
      {/* 1. Value Assurances Banner */}
      <div className="border-b border-[#e5e0d8] py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                <Droplet className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">100% Pure Uncut Oils</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Laboratory Grade-A uncut aromatic concentrates without DPG or carrier dilution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                <Layers className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Fractioned Wholesale</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Bulk supplier quantities repackaged into accessible 50u, 100u, and 250u laboratory packs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                <Tag className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Custom Die-Cut Labels</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Gold metallic foil and matte vinyl labels tailored to exact bottle outer dimensions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 shrink-0">
                <Truck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Same-Day US Dispatch</h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Fast, fully insured USPS & UPS fulfillment directly from our laboratory dock.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-[#d6d0c4] flex items-center justify-center text-amber-800 shadow-sm">
                <FlaskConical className="w-4 h-4 stroke-[1.75]" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#1c1917] uppercase">
                SCENTLAB
              </span>
            </Link>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm">
              SCENTLAB is an enterprise direct-compounding platform providing master perfumers, boutique indie brands, and artisanal fragrance creators with formulation supplies, uncut essences, and private label packaging.
            </p>
            <div className="pt-2 text-[11px] text-stone-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Encrypted Stripe Checkout &bull; Commercial Quality Verified</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-900">Formulation Supplies</h5>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link href="/fragrance" className="hover:text-amber-800 transition">Fragrance Oils (Grade A)</Link></li>
              <li><Link href="/perfume-making" className="hover:text-amber-800 transition">Perfumer&apos;s Base Alcohol</Link></li>
              <li><Link href="/bottles" className="hover:text-amber-800 transition">Amber Glass Roll-Ons</Link></li>
              <li><Link href="/testing" className="hover:text-amber-800 transition">Testing Blotter Strips</Link></li>
              <li><Link href="/shop" className="hover:text-amber-800 transition">Full Catalog</Link></li>
            </ul>
          </div>

          {/* Packaging & Branding */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-900">Branding & Packaging</h5>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link href="/custom-labels" className="hover:text-amber-800 transition">Custom Metallic Labels</Link></li>
              <li><Link href="/packaging" className="hover:text-amber-800 transition">Presentation Boxes</Link></li>
              <li><Link href="/packaging" className="hover:text-amber-800 transition">POF Heat Shrink Wrap</Link></li>
              <li><Link href="/custom-labels" className="hover:text-amber-800 transition">Holographic Security Seals</Link></li>
              <li><Link href="/wholesale" className="hover:text-amber-800 transition">Volume Wholesale Pricing</Link></li>
            </ul>
          </div>

          {/* Account & Support */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-widest text-stone-900">Client Concierge</h5>
            <ul className="space-y-2 text-xs text-stone-600">
              <li><Link href="/account" className="hover:text-amber-800 transition">Customer Dashboard</Link></li>
              <li><Link href="/account/orders" className="hover:text-amber-800 transition">Track Orders</Link></li>
              <li><Link href="/contact" className="hover:text-amber-800 transition">Formulation Support</Link></li>
              <li><Link href="/admin" className="hover:text-amber-800 transition">Admin Portal (PIN 1619)</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-14 pt-8 border-t border-[#e2dcd4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div>
            &copy; {new Date().getFullYear()} SCENTLAB ATELIER & FORMULATIONS. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:underline">About ScentLab</Link>
            <Link href="/contact" className="hover:underline">Contact Concierge</Link>
            <Link href="/admin/login" className="hover:underline">Admin Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
