"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { shippingSettingsRepository } from "@/lib/firestore/shipping-settings";
import { ShippingSettings, ShippingOrigin, ParcelDimensions } from "@/types/shipping";
import { 
  Truck, 
  MapPin, 
  Box, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw 
} from "lucide-react";

export default function AdminShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Origin fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Default parcel fields
  const [weight, setWeight] = useState(1.5);
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(4);

  const loadSettings = async () => {
    const s = await shippingSettingsRepository.getSettings();
    setSettings(s);
    setName(s.origin.name);
    setCompany(s.origin.company);
    setStreet1(s.origin.street1);
    setStreet2(s.origin.street2 || "");
    setCity(s.origin.city);
    setState(s.origin.state);
    setZip(s.origin.zip);
    setCountry(s.origin.country);
    setPhone(s.origin.phone);
    setEmail(s.origin.email);

    setWeight(s.defaultParcel.weight);
    setLength(s.defaultParcel.length);
    setWidth(s.defaultParcel.width);
    setHeight(s.defaultParcel.height);
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ShippingSettings = {
      origin: {
        name,
        company,
        street1,
        street2,
        city,
        state,
        zip,
        country,
        phone,
        email,
      },
      defaultParcel: {
        weight: Number(weight),
        massUnit: "lb",
        length: Number(length),
        width: Number(width),
        height: Number(height),
        distanceUnit: "in",
      },
      freeShippingThreshold: 150,
      fallbackFlatRate: 6.99,
      updatedAt: new Date().toISOString(),
    };

    await shippingSettingsRepository.saveSettings(updated);
    setSettings(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              FULFILLMENT CONFIGURATION
            </span>
            <h1 className="text-2xl font-black text-white uppercase">
              Shipping Origin & Parcels
            </h1>
          </div>
          <Link
            href="/admin"
            className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin
          </Link>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Shipping origin and default parcel configuration saved.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* 1. Warehouse Origin */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400" /> Warehouse Shipping Origin (Shippo From Address)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Contact Person / Dept</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Company Name</label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Street Address 1</label>
                <input
                  type="text"
                  required
                  value={street1}
                  onChange={(e) => setStreet1(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Street Address 2 (Suite/Dock)</label>
                <input
                  type="text"
                  value={street2}
                  onChange={(e) => setStreet2(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* 2. Default Parcel */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" /> Default Parcel Box (Fallback Dimensions)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Base Weight (lb)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Length (in)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={length}
                  onChange={(e) => setLength(parseFloat(e.target.value))}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Width (in)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Height (in)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value))}
                  className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/10 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Shipping Settings
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
