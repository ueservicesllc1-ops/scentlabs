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
      <div className="space-y-8 font-sans max-w-4xl">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Truck className="w-3 h-3 text-gray-600" /> Shippo Origin & Freight Settings
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Warehouse Shipping Origin
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              This physical address is sent to Shippo API to calculate real-time USPS and UPS shipping rates.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg text-[#166534] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Shipping origin and default parcel specifications saved successfully.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          
          {/* Warehouse Physical Address Card */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#2B5F4A]" /> Dispatch Warehouse Address
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Contact Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 font-semibold block mb-1">Street Address</label>
              <input
                type="text"
                value={street1}
                onChange={(e) => setStreet1(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">State (2 Letters)</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 uppercase focus:border-[#2B5F4A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">ZIP / Postal Code</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Default Parcel Dimensions */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-950 flex items-center gap-2">
              <Box className="w-4 h-4 text-[#2B5F4A]" /> Default Box Dimensions
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-gray-700 font-semibold block mb-1">Weight (lbs)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Length (in)</label>
                <input
                  type="number"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Width (in)</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-700 font-semibold block mb-1">Height (in)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 font-mono focus:border-[#2B5F4A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition"
            >
              <Save className="w-4 h-4" /> Save Shipping Settings
            </button>
          </div>
        </form>

      </div>
    </AdminGuard>
  );
}
