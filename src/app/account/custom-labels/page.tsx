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
  ExternalLink,
  Plus
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
          customText: config.customText || config.fragranceName,
        },
      }
    );

    setActionMsg(`Etiqueta "${config.brandName || "Personalizada"}" agregada al carrito.`);
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Tag className="w-4 h-4 text-amber-600" /> Diseños de Etiquetas Foil & Acabados
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
              Proyectos de Etiquetas Personalizadas
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              Revisa tus diseños guardados, materiales metálicos/matte y reordena tiradas con precios por volumen.
            </p>
          </div>

          <Link
            href="/custom-labels"
            className="px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase text-xs tracking-wider transition flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Diseñar Nueva Etiqueta
          </Link>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-medium">
            <span>{actionMsg}</span>
            <Link href="/cart" className="underline font-bold ml-2 text-[#166534]">
              Ver Carrito
            </Link>
          </div>
        )}

        {/* Configurations Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl">
            Cargando proyectos de etiquetas...
          </div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 rounded-2xl bg-white space-y-3 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-950">No hay etiquetas guardadas</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Crea tu primer diseño con estampado metálico foil a la medida exacta de tus botellas de perfumería.
            </p>
            <Link
              href="/custom-labels"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
            >
              Comenzar a Diseñar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configs.map((cfg) => (
              <div
                key={cfg.id}
                className="p-6 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs hover:border-gray-300 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Nombre de Marca</span>
                      <h4 className="text-base font-bold text-gray-950">
                        {cfg.brandName || "Etiqueta Personalizada"}
                      </h4>
                      <p className="text-xs text-gray-600 font-medium">
                        {cfg.fragranceName || cfg.labelSizeName}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase tracking-wider">
                      {cfg.materialName}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1 text-gray-600 font-light">
                    <div><strong>Dimensiones:</strong> {cfg.width}&quot; x {cfg.height}&quot; ({cfg.labelSizeName})</div>
                    <div><strong>Material:</strong> {cfg.materialName}</div>
                    <div><strong>Tirada guardada:</strong> {cfg.quantity} unidades</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => handleReorderLabel(cfg)}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#2B5F4A]" /> Reordenar Lote
                  </button>

                  <Link
                    href={`/custom-labels?configId=${cfg.id}`}
                    className="text-xs text-[#2B5F4A] hover:underline font-bold"
                  >
                    Editar en Estudio &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}
