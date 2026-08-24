"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { customLabelRepository } from "@/lib/firestore/custom-labels";
import { CustomLabelConfiguration, CustomLabelStatus } from "@/types/custom-label";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Layers, 
  FileText, 
  ExternalLink,
  ArrowLeft,
  Settings,
  Eye,
  Tag
} from "lucide-react";

export default function AdminCustomLabelsPage() {
  const [configs, setConfigs] = useState<CustomLabelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedConfig, setSelectedConfig] = useState<CustomLabelConfiguration | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    const all = await customLabelRepository.getAllConfigurations();
    setConfigs(all);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleUpdateStatus = async (id: string, status: CustomLabelStatus) => {
    await customLabelRepository.updateConfigurationStatus(id, status);
    fetchConfigs();
    if (selectedConfig && selectedConfig.id === id) {
      setSelectedConfig({ ...selectedConfig, status });
    }
  };

  const filteredConfigs = configs.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.brandName.toLowerCase().includes(q) ||
      c.fragranceName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Tag className="w-3 h-3 text-gray-600" /> Custom Labels Queue & Proof Approvals
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Label Configurations ({configs.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Inspect buyer artwork, verify foil specifications, and advance the printing pipeline.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Link
              href="/admin/custom-labels/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition"
            >
              <Settings className="w-3.5 h-3.5" /> Pricing & Cost Engine
            </Link>
          </div>
        </div>

        {/* ━━━━ ACTIVE PRICING TIERS OVERVIEW ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <span className="text-[11px] text-[#2B5F4A] font-bold uppercase tracking-wider block">
                ACTIVE CUSTOM LABEL PRICING TIERS (1.5 × 2.5 IN)
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Current live storefront volume discount schedule (MOQ 50 Labels).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">50 Labels</span>
              <div className="text-base font-bold text-gray-950 font-mono mt-0.5">$12.50</div>
              <span className="text-[10px] text-gray-600 font-mono">$0.250 / ea</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">100 Labels</span>
              <div className="text-base font-bold text-gray-950 font-mono mt-0.5">$22.00</div>
              <span className="text-[10px] text-gray-600 font-mono">$0.220 / ea</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">250 Labels</span>
              <div className="text-base font-bold text-gray-950 font-mono mt-0.5">$50.00</div>
              <span className="text-[10px] text-gray-600 font-mono">$0.200 / ea</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">500 Labels</span>
              <div className="text-base font-bold text-gray-950 font-mono mt-0.5">$90.00</div>
              <span className="text-[10px] text-gray-600 font-mono">$0.180 / ea</span>
            </div>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <span className="text-[10px] font-bold text-gray-500 uppercase block">1,000 Labels</span>
              <div className="text-base font-bold text-gray-950 font-mono mt-0.5">$160.00</div>
              <span className="text-[10px] text-gray-600 font-mono">$0.160 / ea</span>
            </div>
          </div>
        </div>

        {/* ━━━━ SEARCH & STATUS FILTER ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col sm:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, brand name, or fragrance name..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:border-[#2B5F4A] focus:outline-none focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by approval status"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-[#2B5F4A] focus:outline-none"
          >
            <option value="all">All Approval Statuses</option>
            <option value="draft">Draft</option>
            <option value="pendingReview">Proof Pending</option>
            <option value="approved">Approved</option>
            <option value="production">In Production</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* ━━━━ CONFIGURATIONS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Config ID</th>
                  <th className="py-3 px-4">Brand / Fragrance</th>
                  <th className="py-3 px-4">Dimensions</th>
                  <th className="py-3 px-4">Material / Finish</th>
                  <th className="py-3 px-4 text-right">Quantity</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No custom label configurations found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredConfigs.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 font-mono font-semibold text-gray-950">
                        {c.id.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-950">{c.brandName}</div>
                        <div className="text-[10px] text-gray-500">{c.fragranceName}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-mono">
                        {c.width || 1.5}&quot; × {c.height || 2.5}&quot;
                      </td>
                      <td className="py-3 px-4 text-gray-700 capitalize">
                        {c.materialName || "Gold Foil + Matte Vinyl"}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900 font-semibold">
                        {(c.quantity || 50).toLocaleString()} labels
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-950">
                        ${(c.price || 12.5).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            c.status === "approved" || c.status === "completed"
                              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                              : c.status === "production"
                              ? "bg-purple-50 border-purple-200 text-purple-800"
                              : c.status === "rejected"
                              ? "bg-red-50 border-red-200 text-red-800"
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedConfig(c)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                        >
                          <Eye className="w-3 h-3 text-gray-500" /> Inspect Proof
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminGuard>
  );
}
