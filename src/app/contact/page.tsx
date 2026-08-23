"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="text-xs font-mono text-amber-400 uppercase tracking-widest">
          CONTACT & WHOLESALE SUPPORT
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
          Get in Touch with SCENTLAB
        </h1>
        <p className="text-sm text-lab-400 font-mono">
          Need custom label sizing, large freight wholesale runs (5,000+ units), or formula compounding advice?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-7 p-6 rounded-xl border border-lab-800 bg-lab-900/40 space-y-4">
          {sent ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-mono">Message Transmitted</h3>
              <p className="text-xs font-mono text-lab-400">Our lab dispatch team will reply within 24 hours.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="space-y-3 text-xs font-mono"
            >
              <div>
                <span className="text-lab-400 block mb-1">Your Name / Brand</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Noir Perfumery"
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <span className="text-lab-400 block mb-1">Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="contact@brand.com"
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <span className="text-lab-400 block mb-1">Inquiry Type</span>
                <select className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-white">
                  <option>Wholesale Order (500 - 10,000+ Units)</option>
                  <option>Custom Label Sizing & Foil Run</option>
                  <option>Order Fulfillment & Tracking</option>
                  <option>General Sourcing Inquiry</option>
                </select>
              </div>
              <div>
                <span className="text-lab-400 block mb-1">Message Details</span>
                <textarea
                  rows={4}
                  required
                  placeholder="Specify SKU, desired unit count, bottle dimensions or questions..."
                  className="w-full bg-lab-950 border border-lab-800 rounded px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded text-xs font-mono font-bold bg-amber-500 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Lab Inquiry
              </button>
            </form>
          )}
        </div>

        <div className="md:col-span-5 p-6 rounded-xl border border-lab-800 bg-lab-950 space-y-6 font-mono text-xs">
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase text-xs">Direct Inquiries</h4>
            <p className="text-lab-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" /> support@scentlab.pro
            </p>
            <p className="text-lab-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400" /> +1 (800) 555-SCENT
            </p>
          </div>

          <div className="space-y-2 pt-4 border-t border-lab-800">
            <h4 className="text-white font-bold uppercase text-xs">Warehouse Logistics</h4>
            <p className="text-lab-400 leading-relaxed">
              SCENTLAB Distro Center<br />
              Industrial Supply Zone 4<br />
              USA
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
