"use client";

import React from "react";
import { calculateLabelSheetYield } from "@/lib/custom-labels/sheet-calculator";
import { Layers, FileText } from "lucide-react";

interface LabelSheetYieldBadgeProps {
  width: number;
  height: number;
  quantity: number;
}

export function LabelSheetYieldBadge({
  width,
  height,
  quantity,
}: LabelSheetYieldBadgeProps) {
  const yieldInfo = calculateLabelSheetYield(width, height, quantity);

  return (
    <div className="p-3 rounded-xl bg-lab-900/50 border border-lab-800 text-[11px] font-mono text-lab-300 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
        <span>
          Production Yield: <strong className="text-white">{yieldInfo.optimalLabelsPerSheet} labels</strong> per 8.5&quot; × 11&quot; sheet ({yieldInfo.optimalOrientation})
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-lab-400">
        <FileText className="w-3 h-3 text-lab-500" />
        <span>Est. ~<strong>{yieldInfo.estimatedSheetsRequired} sheets</strong> (includes 10% scrap/bleed buffer)</span>
      </div>
    </div>
  );
}
