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
  Eye
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
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fragranceName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> CUSTOM LABELS QUEUE & PROOF APPROVALS
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Label Configurations ({configs.length})
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Inspect buyer artwork, verify foil specifications, and advance printing pipeline.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/custom-labels/pricing"
              className="px-4 py-2 rounded-lg bg-amber-500 text-lab-950 hover:brightness-110 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Settings className="w-3.5 h-3.5" /> Pricing & Cost Engine
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Products
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by brand, fragrance name, or configuration ID..."
              className="w-full bg-lab-950 border border-lab-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Proof Statuses</option>
              <option value="draft">Draft</option>
              <option value="pendingReview">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="production">In Production</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Configurations Table */}
        <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Config ID</th>
                <th className="p-3">Brand & Fragrance</th>
                <th className="p-3">Die-Cut Size</th>
                <th className="p-3">Substrate / Foil</th>
                <th className="p-3">Batch Qty</th>
                <th className="p-3">Total Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-800/60">
              {filteredConfigs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">
                    No custom label configurations found.
                  </td>
                </tr>
              ) : (
                filteredConfigs.map((cfg) => (
                  <tr key={cfg.id} className="hover:bg-lab-800/30 transition">
                    <td className="p-3 font-bold text-white">
                      {cfg.id}
                    </td>
                    <td className="p-3">
                      <div className="text-white font-bold uppercase">{cfg.brandName}</div>
                      <div className="text-[10px] text-amber-400">{cfg.fragranceName}</div>
                    </td>
                    <td className="p-3 text-lab-300">
                      {cfg.labelSizeName} ({cfg.width}&quot; × {cfg.height}&quot;)
                    </td>
                    <td className="p-3 text-lab-300">
                      {cfg.materialName}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {cfg.quantity} units
                    </td>
                    <td className="p-3 font-bold text-amber-400">
                      {formatCurrency(cfg.price)}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block border ${
                        cfg.status === "approved" || cfg.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : cfg.status === "production"
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      }`}>
                        {cfg.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedConfig(cfg)}
                        className="px-2.5 py-1 rounded bg-lab-800 hover:bg-lab-700 text-white transition text-[11px] inline-flex items-center gap-1 border border-lab-700"
                      >
                        <Eye className="w-3 h-3" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Config Modal / Inspection Panel */}
        {selectedConfig && (
          <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-lab-800 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                  CUSTOM LABEL SPECIFICATION & PROOF
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedConfig.brandName} — {selectedConfig.fragranceName}
                </h2>
                <p className="text-xs text-lab-400">
                  Config ID: <strong className="text-white">{selectedConfig.id}</strong> • Created: {new Date(selectedConfig.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedConfig.status}
                  onChange={(e) => handleUpdateStatus(selectedConfig.id, e.target.value as CustomLabelStatus)}
                  className="bg-lab-900 border border-lab-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="draft">Draft</option>
                  <option value="pendingReview">Pending Review</option>
                  <option value="approved">Approved</option>
                  <option value="production">In Production</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setSelectedConfig(null)}
                  className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/30 space-y-2">
                <span className="text-[10px] text-lab-500 uppercase block">Print Specifications</span>
                <div className="flex justify-between">
                  <span className="text-lab-400">Die-Cut Size:</span>
                  <span className="text-white font-bold">{selectedConfig.labelSizeName} ({selectedConfig.width}&quot; × {selectedConfig.height}&quot;)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lab-400">Foil / Material:</span>
                  <span className="text-amber-400 font-bold">{selectedConfig.materialName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lab-400">Batch Quantity:</span>
                  <span className="text-white font-bold">{selectedConfig.quantity} labels</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lab-400">Customer Subtext:</span>
                  <span className="text-white">{selectedConfig.customText || "None"}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/30 space-y-2">
                <span className="text-[10px] text-lab-500 uppercase block">Customer Uploaded Assets (Backblaze B2)</span>
                <div className="space-y-2">
                  {selectedConfig.logoUrl ? (
                    <a
                      href={selectedConfig.logoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded bg-lab-950 border border-lab-800 text-amber-400 hover:underline flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Brand Logo File
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-lab-500 italic block">No logo asset uploaded</span>
                  )}

                  {selectedConfig.designUrl ? (
                    <a
                      href={selectedConfig.designUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded bg-lab-950 border border-lab-800 text-indigo-400 hover:underline flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Ready Vector Print File
                      </span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-lab-500 italic block">No vector file uploaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
