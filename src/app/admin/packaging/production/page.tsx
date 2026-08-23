"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { packagingRepository } from "@/lib/firestore/packaging";
import { productionRepository } from "@/lib/firestore/production";
import { ProductionJob, PackagingMaterial, BoxSizeVariant } from "@/types/packaging";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Scissors, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Box, 
  Play,
  RotateCcw 
} from "lucide-react";

export default function AdminPackagingProductionPage() {
  const [jobs, setJobs] = useState<ProductionJob[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [boxes, setBoxes] = useState<BoxSizeVariant[]>([]);
  const [loading, setLoading] = useState(true);

  // New Job Form State
  const [selectedBoxId, setSelectedBoxId] = useState("");
  const [quantity, setQuantity] = useState(50);
  const [wasteSheets, setWasteSheets] = useState(2);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadData = async () => {
    setLoading(true);
    const jbs = await productionRepository.getProductionJobs();
    setJobs(jbs);
    const mats = await packagingRepository.getRawMaterials();
    setMaterials(mats);
    const bxs = await packagingRepository.getBoxVariants();
    setBoxes(bxs);
    if (bxs.length > 0 && !selectedBoxId) {
      setSelectedBoxId(bxs[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedBox = boxes.find((b) => b.id === selectedBoxId) || boxes[0];
  const sheetsNeeded = selectedBox ? Math.ceil(selectedBox.sheetsRequiredPerBox * quantity) : 25;

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBox) return;

    const newJob: ProductionJob = {
      id: `job_${Date.now()}`,
      productId: "prod_perfume_boxes",
      variantId: selectedBox.id,
      boxName: selectedBox.name,
      quantity,
      materialId: selectedBox.materialId,
      materialName: selectedBox.materialName,
      sheetsRequired: sheetsNeeded,
      estimatedTimeMinutes: Math.round(quantity * 0.4),
      status: "queued",
      notes: `Batch run: ${quantity}x ${selectedBox.name}`,
      createdBy: "Admin",
      createdAt: new Date().toISOString(),
    };

    await productionRepository.createProductionJob(newJob);
    await loadData();
    setSuccessMsg(`Production job ${newJob.id} queued for Cricut cutting.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleExecuteJob = async (job: ProductionJob) => {
    const res = await productionRepository.executeAndCompleteJob({
      jobId: job.id,
      materialId: job.materialId,
      variantId: job.variantId,
      sheetsToConsume: job.sheetsRequired,
      outputBoxQuantity: job.quantity,
      wasteSheets: 1,
      createdBy: "Admin",
    });

    if (!res.success) {
      setErrorMsg(res.error || "Failed to execute production job.");
      return;
    }

    await loadData();
    setSuccessMsg(`Job #${job.id} completed! Consumed ${job.sheetsRequired} sheets and added ${job.quantity} boxes to shelf inventory.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/packaging"
              className="inline-flex items-center gap-1 text-xs text-lab-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Packaging Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase">
              Cricut Production Queue & Cardstock Ingestion
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Dispatch cutting jobs, track assembly status, and automatically consume raw cardstock sheets.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Stage: Create Job & Jobs Queue */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Dispatch New Production Job */}
          <div className="lg:col-span-4 p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4 text-xs">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" /> Dispatch Cricut Cutting Run
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Select Box Model</label>
                <select
                  value={selectedBoxId}
                  onChange={(e) => setSelectedBoxId(e.target.value)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                >
                  {boxes.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-lab-400 block mb-1 uppercase text-[10px]">Quantity of Boxes</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 5)}
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="p-4 rounded-xl border border-lab-800 bg-lab-950 space-y-1">
                <span className="text-[10px] text-lab-500 uppercase block">Calculated Sheet Requirement</span>
                <span className="text-lg font-bold text-amber-400">{sheetsNeeded} Sheets</span>
                <span className="text-[10px] text-lab-400 block">
                  {selectedBox?.materialName}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 shadow"
              >
                Queue Job for Production
              </button>
            </form>
          </div>

          {/* Right: Active & Completed Jobs */}
          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Production Ledger & Jobs
            </h3>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Job ID</th>
                    <th className="p-3">Box Formulation</th>
                    <th className="p-3">Quantity</th>
                    <th className="p-3">Sheets Consumed</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-lab-800/30 transition">
                      <td className="p-3 font-mono text-lab-500">{job.id.slice(0, 12)}</td>
                      <td className="p-3 font-bold text-white uppercase">
                        <div>{job.boxName}</div>
                        <div className="text-[10px] text-lab-500 font-normal">{job.materialName}</div>
                      </td>
                      <td className="p-3 font-bold text-indigo-400">{job.quantity} units</td>
                      <td className="p-3 font-mono text-amber-400">{job.sheetsRequired} sheets</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            job.status === "completed"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                              : "bg-amber-950 text-amber-400 border border-amber-500/40"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {job.status !== "completed" ? (
                          <button
                            type="button"
                            onClick={() => handleExecuteJob(job)}
                            className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-lab-950 font-bold uppercase text-[10px] inline-flex items-center gap-1 transition shadow"
                          >
                            <Play className="w-3 h-3" /> Complete & Deduct
                          </button>
                        ) : (
                          <span className="text-[10px] text-lab-500">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
