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
        <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Connected
        </span>
      );
    }
    if (status === "TEST_MODE" || status === "LOCAL_DEV_MODE") {
      return (
        <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Test Mode
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-500/40 text-[10px] font-bold uppercase flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Not Configured
      </span>
    );
  };

  return (
    <AdminGuard>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex justify-between items-end">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              SYSTEM INFRASTRUCTURE & APIS
            </span>
            <h1 className="text-2xl font-black text-white uppercase">
              Integration Diagnostics
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchDiagnostics}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold text-xs uppercase transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Run Diagnostic
            </button>

            <Link
              href="/admin"
              className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>
        </div>

        {loading && !data ? (
          <div className="text-xs text-lab-500 py-12 text-center">Testing system endpoints...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Google Places */}
            <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lab-900 border border-lab-800 flex items-center justify-center text-amber-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm">Google Places API</h3>
                    <p className="text-[10px] text-lab-400">Address Autocomplete & Validation</p>
                  </div>
                </div>
                {data && getBadge(data.googlePlaces?.status)}
              </div>

              <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[11px] text-lab-300 space-y-1">
                <div>• Key Configured: {data?.googlePlaces?.configured ? "Yes" : "No"}</div>
                {data?.googlePlaces?.keyPreview && <div>• Key Preview: {data.googlePlaces.keyPreview}</div>}
                <div>• Usage: Client-side autocomplete with session token caching</div>
              </div>
            </div>

            {/* 2. Shippo */}
            <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lab-900 border border-lab-800 flex items-center justify-center text-amber-400">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm">Shippo Shipping API</h3>
                    <p className="text-[10px] text-lab-400">Live Multi-Carrier Rates & Labels</p>
                  </div>
                </div>
                {data && getBadge(data.shippo?.status)}
              </div>

              <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[11px] text-lab-300 space-y-1">
                <div>• Mode: {data?.shippo?.mode || "Live / Test"}</div>
                {data?.shippo?.keyPreview && <div>• Key Preview: {data.shippo.keyPreview}</div>}
                <div>• Carriers: USPS Ground Advantage, Priority, UPS Ground</div>
              </div>
            </div>

            {/* 3. Stripe */}
            <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lab-900 border border-lab-800 flex items-center justify-center text-amber-400">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm">Stripe Payments</h3>
                    <p className="text-[10px] text-lab-400">Checkout Sessions & Webhook Engine</p>
                  </div>
                </div>
                {data && getBadge(data.stripe?.status)}
              </div>

              <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[11px] text-lab-300 space-y-1">
                <div>• Mode: {data?.stripe?.mode || "Test Mode"}</div>
                <div>• Webhook Protection: SHA-256 HMAC signature verification</div>
              </div>
            </div>

            {/* 4. Backblaze B2 */}
            <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lab-900 border border-lab-800 flex items-center justify-center text-amber-400">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm">Backblaze B2 Storage</h3>
                    <p className="text-[10px] text-lab-400">S3-Compatible Private Artifact Vault</p>
                  </div>
                </div>
                {data && getBadge(data.backblazeB2?.status)}
              </div>

              <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[11px] text-lab-300 space-y-1">
                <div>• Target Bucket: {data?.backblazeB2?.bucketName}</div>
                <div>• Security: Private signed URLs for customer designs & shipping labels</div>
              </div>
            </div>

            {/* 5. Firebase */}
            <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3 md:col-span-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-lab-900 border border-lab-800 flex items-center justify-center text-amber-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase text-sm">Firebase Cloud Firestore & Auth</h3>
                    <p className="text-[10px] text-lab-400">Database & Customer Authentication</p>
                  </div>
                </div>
                {data && getBadge(data.firebase?.status)}
              </div>

              <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 text-[11px] text-lab-300 space-y-1">
                <div>• Project ID: {data?.firebase?.projectId}</div>
                <div>• Auth Methods: Google SSO & Email/Password with SHA-256 Admin PIN Gateway (1619)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
