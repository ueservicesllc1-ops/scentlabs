import React from "react";
import Link from "next/link";
import { FlaskConical, ShieldCheck, Box, Layers } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
          SCENTLAB PHILOSOPHY
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
          "Everything you need to create, package and sell your own fragrances."
        </h1>
        <p className="text-base text-lab-300 leading-relaxed font-mono pt-2">
          SCENTLAB is an independent industrial e-commerce platform dedicated exclusively to perfumers, 
          creators, and fragrance brands.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-2">
          <Box className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white font-mono text-sm">Bulk to Fractional</h3>
          <p className="text-xs text-lab-400 leading-relaxed">
            We purchase directly from master glassblowers and container manufacturers in 1,500+ unit quantities 
            and fraction them into useful batches of 10, 50, 100, and 250 units.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-2">
          <FlaskConical className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white font-mono text-sm">Laboratory Integrity</h3>
          <p className="text-xs text-lab-400 leading-relaxed">
            Glassware, atomizers, transfer pipettes and high-tack labels are tested against ethanol, 
            carrier oils, and volatile aromatic compounds.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-lab-800 bg-lab-900/40 space-y-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-white font-mono text-sm">Direct Bottle Matching</h3>
          <p className="text-xs text-lab-400 leading-relaxed">
            No guessing label sizes. Every bottle in our catalog has an exact companion label 
            (e.g., 10 ml Roll-On $\rightarrow$ 1.5" × 2.25" metallic foil).
          </p>
        </div>
      </div>
    </div>
  );
}
