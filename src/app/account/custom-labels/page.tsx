"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { customLabelRepository } from "@/lib/firestore/custom-labels";
import { CustomLabelConfiguration } from "@/types/custom-label";
import { calculateLabelPricing } from "@/lib/custom-labels/pricing";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { INITIAL_PRODUCTS } from "@/data/products";
import { 
  Tag, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from "lucide-react";

export default function CustomerCustomLabelsPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [configs, setConfigs] = useState<CustomLabelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  const loadConfigs = async () => {
    if (user) {
      const fetched = await customLabelRepository.getConfigurationsByCustomer(user.uid);
      setConfigs(fetched);
    } else {
      const all = await customLabelRepository.getAllConfigurations();
      setConfigs(all);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) loadConfigs();
  }, [user, authLoading]);

  const handleReorderLabel = (config: CustomLabelConfiguration) => {
    const livePricing = calculateLabelPricing(
      config.width,
      config.height,
      config.quantity,
      config.materialId
    );

    const customLabelProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_custom_labels") || INITIAL_PRODUCTS[4];

    addItem(
      customLabelProduct,
      {
        id: `pkg_custom_${config.quantity}u`,
        quantity: config.quantity,
        price: livePricing.totalPrice,
        unitPrice: livePricing.unitPrice,
      },
      1,
      {
        isCustomItem: true,
        customLabelSpecs: {
          bottleName: config.labelSizeName,
          dimensions: `${config.width}" x ${config.height}" (${config.materialName})`,
          material: config.materialName,
          customText: `${config.brandName} — ${config.fragranceName}`,
        },
      }
    );

    setActionMsg(`Added "${config.brandName} - ${config.fragranceName}" (${config.quantity}u) to cart with live pricing (${formatCurrency(livePricing.totalPrice)}).`);
  };

  const handleDuplicateDesign = async (config: CustomLabelConfiguration) => {
    if (!user) return;

    const duplicateId = `cl_config_${Date.now()}`;
    const duplicateConfig: CustomLabelConfiguration = {
      ...config,
      id: duplicateId,
      brandName: `${config.brandName} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await customLabelRepository.saveConfiguration(duplicateConfig);
    await loadConfigs();
    setActionMsg(`Duplicated design "${config.brandName}" as a new draft (${duplicateId}).`);
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-mono">
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" /> METALLIC FOIL DESIGN STUDIO ARCHIVE
            </div>
            <h2 className="text-xl font-bold text-white uppercase mt-1">
              Custom Labels & Artwork
            </h2>
            <p className="text-xs text-lab-400">
              Manage saved metallic foil label specs, artwork uploads, duplicate recipes, or reorder directly.
            </p>
          </div>

          <Link
            href="/custom-labels"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4" /> Create New Design
          </Link>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between">
            <span>{actionMsg}</span>
            <Link href="/cart" className="underline font-bold ml-2 text-white">
              View Cart
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-xs text-lab-500 py-10 text-center">Loading saved label designs...</div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
            <Tag className="w-8 h-8 text-lab-600 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">No Saved Label Configurations</h3>
            <p className="text-xs text-lab-400">
              Customize metallic foil labels matched to 10ml roll-ons, 30ml atomizers, or custom glassware.
            </p>
            <Link
              href="/custom-labels"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase"
            >
              Start First Label Design
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((config) => (
              <div
                key={config.id}
                className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition"
              >
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-white uppercase block text-sm">
                        {config.brandName || "Custom Label"}
                      </span>
                      <span className="text-[11px] text-amber-400 font-bold">
                        {config.fragranceName}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-lab-900 text-amber-400 border border-amber-500/30">
                      {config.status}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-lab-900/60 border border-lab-800/80 space-y-1 text-[11px] text-lab-300">
                    <div>• Format: {config.labelSizeName} ({config.width}&quot; x {config.height}&quot;)</div>
                    <div>• Material: {config.materialName}</div>
                    <div>• Batch Size: {config.quantity} units</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-lab-900 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => handleDuplicateDesign(config)}
                    className="text-[11px] text-lab-400 hover:text-white font-bold uppercase flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> Duplicate Design
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReorderLabel(config)}
                    className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 font-bold text-xs uppercase transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reorder ({formatCurrency(config.price)})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
