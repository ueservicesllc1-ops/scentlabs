"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 space-y-5 font-mono">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
        <XCircle className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white uppercase">
          Your Payment Was Cancelled
        </h1>
        <p className="text-xs text-lab-300 leading-relaxed">
          No charges were incurred. Your selected production batch items and volume tiers remain saved in your cart.
        </p>
      </div>

      <div className="pt-2 flex flex-col gap-2">
        <Link
          href="/cart"
          className="w-full py-3 rounded-lg text-xs font-bold uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow"
        >
          <ShoppingBag className="w-4 h-4" /> Return to Cart
        </Link>
        <Link
          href="/shop"
          className="w-full py-2.5 rounded-lg text-xs font-mono text-lab-400 hover:text-white transition block text-center"
        >
          Continue Browsing Catalog
        </Link>
      </div>
    </div>
  );
}
