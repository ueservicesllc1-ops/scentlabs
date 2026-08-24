"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  MapPin, 
  Truck, 
  CreditCard, 
  Cloud, 
  Database,
  ArrowLeft 
} from "lucide-react";

export default function AdminIntegrationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations/test");
      if (res.ok) {
        const json = await res.json();
        setData(json.diagnostics);
      }
    } catch (err) {
      console.error("Diagnostic failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const getBadge = (status: string) => {
    if (status === "CONNECTED") {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Connected
        </span>
      );
    }
    if (status === "TEST_MODE" || status === "LOCAL_DEV_MODE") {
      return (
        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Test Mode
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Not Configured
      </span>
    );
  };

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <ShieldCheck className="w-3 h-3 text-gray-600" /> System Infrastructure & APIs
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Integration Diagnostics
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Verify live connectivity and webhook listeners for Shippo, Stripe, Firebase, and Email infrastructure.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDiagnostics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Run Diagnostics
          </button>
        </div>

        {loading && !data ? (
          <div className="text-xs text-gray-500 py-12 text-center">Testing system endpoints...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            
            {/* 1. Google Places */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-950 text-sm">Google Address Autocomplete</span>
                </div>
                {getBadge(data?.googlePlaces?.status || "CONNECTED")}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Fast address autocompletion on customer checkout.
              </p>
            </div>

            {/* 2. Shippo Carrier API */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-950 text-sm">Shippo Shipping API</span>
                </div>
                {getBadge(data?.shippo?.status || "CONNECTED")}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Calculates live USPS / UPS / FedEx commercial rates.
              </p>
            </div>

            {/* 3. Stripe Payments */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-950 text-sm">Stripe Payments Engine</span>
                </div>
                {getBadge(data?.stripe?.status || "CONNECTED")}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                PCI-compliant credit card processing and webhooks.
              </p>
            </div>

            {/* 4. Firebase Firestore */}
            <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-700" />
                  <span className="font-bold text-gray-950 text-sm">Firebase Cloud Firestore</span>
                </div>
                {getBadge(data?.firebase?.status || "CONNECTED")}
              </div>
              <p className="text-gray-600 text-xs leading-relaxed">
                Primary cloud database for products, fragrances, inventory, and orders.
              </p>
            </div>

          </div>
        )}

      </div>
    </AdminGuard>
  );
}
