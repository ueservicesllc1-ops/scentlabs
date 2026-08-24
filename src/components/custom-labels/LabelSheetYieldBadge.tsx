"use client";

import React from "react";
import { calculateLabelSheetYield } from "@/lib/custom-labels/sheet-calculator";
import { Layers } from "lucide-react";

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
    <div className="p-2.5 bg-gray-50 border border-gray-200 text-xs text-gray-600 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-[#2B5F4A] flex-shrink-0" />
        <span>
          Sheet Yield: <strong className="text-gray-900 font-semibold">{yieldInfo.optimalLabelsPerSheet} labels</strong> / sheet
        </span>
      </div>
      <span className="font-mono text-[11px] text-gray-500">
        ~{yieldInfo.estimatedSheetsRequired} sheets total
      </span>
    </div>
  );
}
