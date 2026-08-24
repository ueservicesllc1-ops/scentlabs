"use client";

import React, { useState } from "react";
import { X, ShieldAlert, Check, Plus, Minus } from "lucide-react";
import { inventoryRepository } from "@/lib/firestore/inventory";

interface StockAdjustmentModalProps {
  productId: string;
  productName: string;
  currentStock: number;
  unit?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newStock: number) => void;
}

export default function StockAdjustmentModal({
  productId,
  productName,
  currentStock,
  unit = "units",
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract" | "set">("add");
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>("recount");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  let calculatedNewStock = currentStock;
  if (adjustmentType === "add") calculatedNewStock = currentStock + (Number(quantity) || 0);
  else if (adjustmentType === "subtract") calculatedNewStock = Math.max(0, currentStock - (Number(quantity) || 0));
  else if (adjustmentType === "set") calculatedNewStock = Math.max(0, Number(quantity) || 0);

  const delta = calculatedNewStock - currentStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (delta === 0) {
      setErrorMsg("Adjustment results in no stock change.");
      return;
    }

    setIsSubmitting(true);
    try {
      const reasonMap: Record<string, "Count Correction" | "Damaged" | "Lost" | "Found" | "Waste" | "Other"> = {
        recount: "Count Correction",
        damage: "Damaged",
        loss: "Lost",
        found: "Found",
        waste: "Waste",
        other: "Other",
      };
      const mappedReason = reasonMap[reason] || "Other";

      await inventoryRepository.adjustInventory(
        productId,
        calculatedNewStock,
        mappedReason,
        notes ? `${notes} (Admin UI Adjustment)` : `Manual stock adjustment (${reason})`,
        "ueservicesllc1@gmail.com"
      );

      onSuccess(calculatedNewStock);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to record stock adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-lab-950 border border-lab-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-lab-800 flex items-center justify-between bg-lab-900/40">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              Audit-Logged Stock Adjustment
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">{productName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-lab-400 hover:text-white hover:bg-lab-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          {/* Current vs Projected */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-lab-900/50 border border-lab-800 rounded-xl">
            <div>
              <span className="text-[10px] uppercase font-bold text-lab-500">Current Stock</span>
              <div className="text-xl font-mono font-bold text-white mt-1">
                {currentStock} <span className="text-xs font-normal text-lab-400">{unit}</span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-lab-500">New Projected Stock</span>
              <div className={`text-xl font-mono font-bold mt-1 ${delta >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                {calculatedNewStock} <span className="text-xs font-normal text-lab-400">{unit}</span>
                <span className="text-xs ml-2 font-mono text-lab-400">({delta >= 0 ? `+${delta}` : delta})</span>
              </div>
            </div>
          </div>

          {/* Adjustment Mode */}
          <div>
            <label className="block text-xs uppercase font-bold text-lab-400 mb-2">Adjustment Action</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("add")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustmentType === "add"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : "bg-lab-900 border-lab-800 text-lab-400 hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Add Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("subtract")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustmentType === "subtract"
                    ? "bg-amber-500/20 border-amber-500 text-amber-400"
                    : "bg-lab-900 border-lab-800 text-lab-400 hover:text-white"
                }`}
              >
                <Minus className="w-3.5 h-3.5" /> Remove Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType("set")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  adjustmentType === "set"
                    ? "bg-blue-500/20 border-blue-500 text-blue-400"
                    : "bg-lab-900 border-lab-800 text-lab-400 hover:text-white"
                }`}
              >
                Set Total
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">
              {adjustmentType === "set" ? "New Total Count" : "Quantity to Adjust"}
            </label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-base font-mono px-3.5 py-2.5 bg-lab-900 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Reason Selector */}
          <div>
            <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Reason for Adjustment</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-lab-900 border border-lab-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="recount">Physical Inventory Recount / Cycle Count</option>
              <option value="damage">Damaged / Expired / Unsellable Stock</option>
              <option value="sample_use">Testing / Lab Sample Consumption</option>
              <option value="return">Customer Return / Restock</option>
              <option value="manual_correction">Administrative Correction</option>
              <option value="purchase_receipt">Direct Vendor Delivery</option>
            </select>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs uppercase font-bold text-lab-400 mb-1.5">Internal Audit Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Broken during carton unloading at dock B..."
              className="w-full text-xs px-3.5 py-2 bg-lab-900 border border-lab-800 rounded-xl text-white placeholder:text-lab-600 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-lab-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-lab-400 hover:text-white bg-lab-900 border border-lab-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || delta === 0}
              className="px-5 py-2 rounded-xl text-xs font-bold text-black bg-amber-500 hover:bg-amber-400 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? "Recording..." : "Record & Update Inventory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
