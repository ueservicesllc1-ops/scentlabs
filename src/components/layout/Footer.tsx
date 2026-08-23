import React from "react";
import Link from "next/link";
import { FlaskConical, ShieldCheck, Box, RefreshCw, Sparkles, Droplet, Tag, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-lab-800 bg-lab-950 text-lab-400 text-xs font-mono">
      {/* Brand Value Pillars */}
      <div className="border-b border-lab-800/80 bg-lab-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lab-800 border border-lab-700 text-amber-400">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase">
                Pure Fragrance Fractions
              </h4>
              <p className="text-[11px] text-lab-400 mt-0.5">
                Grade-A uncut perfume bases, woody accords, and floral concentrates.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lab-800 border border-lab-700 text-indigo-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase">
                200-Proof Alcohol & Bases
              </h4>
              <p className="text-[11px] text-lab-400 mt-0.5">
                Crystal clear denatured perfumer&apos;s base sold by liter and dispensing size.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lab-800 border border-lab-700 text-amber-400">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase">
                Precision Label Matching
              </h4>
              <p className="text-[11px] text-lab-400 mt-0.5">
                Metallic foil labels die-cut precisely to bottle outer diameters (e.g. 1.5x2.25&quot;).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lab-800 border border-lab-700 text-emerald-400">
              <Box className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-white font-bold text-xs uppercase">
                Cricut Fabrication & Boxes
              </h4>
              <p className="text-[11px] text-lab-400 mt-0.5">
                110 lb premium presentation boxes, security seals, and shrink wrap.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        {/* Brand Summary */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-lab-800 border border-lab-700 flex items-center justify-center text-amber-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <span className="text-base font-black text-white tracking-tight">SCENTLAB</span>
          </div>
          <p className="text-xs text-lab-300 leading-relaxed max-w-sm">
            Everything you need to formulate, bottle, label, and package your own fragrances.
          </p>
          <p className="text-[10px] text-lab-500">
            Laboratory supplies for indie perfumers, brand founders, and compounding studios.
          </p>
        </div>

        {/* Catalog Categories */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
            Catalog
          </h5>
          <ul className="space-y-1.5 text-xs text-lab-400">
            <li><Link href="/shop" className="hover:text-white transition">All Supplies</Link></li>
            <li><Link href="/fragrance" className="hover:text-amber-400 transition">Fragrance Oils</Link></li>
            <li><Link href="/perfume-making" className="hover:text-amber-400 transition">Perfume Making</Link></li>
            <li><Link href="/packaging" className="hover:text-white transition">Packaging & Boxes</Link></li>
            <li><Link href="/testing" className="hover:text-indigo-400 transition">Testing Supplies</Link></li>
            <li><Link href="/custom-labels" className="hover:text-amber-400 transition">Custom Labels</Link></li>
          </ul>
        </div>

        {/* Customer Account & Orders */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
            Account & Support
          </h5>
          <ul className="space-y-1.5 text-xs text-lab-400">
            <li><Link href="/account" className="hover:text-white transition">Customer Account</Link></li>
            <li><Link href="/account/orders" className="hover:text-white transition">Order History</Link></li>
            <li><Link href="/account/custom-labels" className="hover:text-white transition">Saved Custom Labels</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Contact Lab Support</Link></li>
          </ul>
        </div>

        {/* Legal & Administration */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold text-white uppercase tracking-wider">
            Information
          </h5>
          <ul className="space-y-1.5 text-xs text-lab-400">
            <li><Link href="/about" className="hover:text-white transition">About SCENTLAB</Link></li>
            <li><Link href="/contact" className="hover:text-white transition">Shipping & Returns</Link></li>
            <li><Link href="/admin/login" className="text-lab-600 hover:text-amber-400 transition flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-lab-900 py-6 px-4 text-center text-[10px] text-lab-500">
        © {new Date().getFullYear()} SCENTLAB LLC. Direct formulation, fractioning & packaging systems. All rights reserved.
      </div>
    </footer>
  );
}
