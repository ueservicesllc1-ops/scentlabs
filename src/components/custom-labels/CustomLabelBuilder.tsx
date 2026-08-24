"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  STANDARD_LABEL_SIZES, 
  STANDARD_LABEL_MATERIALS 
} from "@/config/custom-labels";
import { LabelSize, LabelMaterial, CustomLabelConfiguration } from "@/types/custom-label";
import { calculateLabelPricing } from "@/lib/custom-labels/pricing";
import { customLabelRepository } from "@/lib/firestore/custom-labels";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { INITIAL_PRODUCTS } from "@/data/products";
import { LabelPreview } from "./LabelPreview";
import { LabelSizeSelector } from "./LabelSizeSelector";
import { LabelMaterialSelector } from "./LabelMaterialSelector";
import { LabelQuantitySelector } from "./LabelQuantitySelector";
import { LabelSheetYieldBadge } from "./LabelSheetYieldBadge";
import { 
  Sparkles, 
  Check, 
  ShoppingBag, 
  ArrowLeft,
  AlertCircle,
  UploadCloud,
  FileText,
  ShieldCheck,
  Tag
} from "lucide-react";

interface CustomLabelBuilderProps {
  initialProductId?: string;
}

export function CustomLabelBuilder({ initialProductId }: CustomLabelBuilderProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  // Determine whether this is PRODUCT 1 (Roll-On Label — 10 ml) or PRODUCT 2 (General Custom Labels)
  const isRollOnLabel =
    initialProductId === "prod_rollon_10ml" ||
    initialProductId === "prod_rollon_label_10ml" ||
    initialProductId === "roll-on" ||
    initialProductId?.includes("rollon") ||
    initialProductId?.includes("roll-on");

  // Fixed size for Roll-On Label (1.5 x 2.5 in); for general Custom Labels default is 1.5 x 2.5 in but selectable
  const rollOnFixedSize =
    STANDARD_LABEL_SIZES.find((s) => s.id === "size_1_5x2_5") || STANDARD_LABEL_SIZES[5];

  const [selectedSize, setSelectedSize] = useState<LabelSize>(rollOnFixedSize);
  const [selectedMaterial, setSelectedMaterial] = useState<LabelMaterial>(STANDARD_LABEL_MATERIALS[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(50);

  // Customization Form State
  const [brandName, setBrandName] = useState("AURA NOIR");
  const [fragranceName, setFragranceName] = useState(isRollOnLabel ? "THE LAST KIN" : "SANTAL IMPERIAL");
  const [customText, setCustomText] = useState("BATCH NO. 04 \u2022 HAND POURED ATELIER");
  const [volumeText, setVolumeText] = useState(isRollOnLabel ? "EAU DE PARFUM \u2022 10 ML" : "EAU DE PARFUM \u2022 50 ML");
  const [notes, setNotes] = useState("");

  // Uploads
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFileId, setLogoFileId] = useState<string>("");
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [designUrl, setDesignUrl] = useState<string>("");
  const [designFileId, setDesignFileId] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  // Active Size (Roll-on always strictly uses rollOnFixedSize)
  const effectiveSize = isRollOnLabel ? rollOnFixedSize : selectedSize;

  // Price Calculation
  const pricing = calculateLabelPricing(
    effectiveSize.width,
    effectiveSize.height,
    selectedQuantity,
    selectedMaterial.id
  );

  const handleFileUpload = async (file: File, type: "logo" | "design") => {
    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", user?.uid || "guest");
      formData.append("fileType", type);
      formData.append("configurationId", `cfg_${Date.now()}`);

      const response = await fetch("/api/custom-labels/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload artwork file to storage.");
      }

      const data = await response.json();

      if (type === "logo") {
        setLogoFile(file);
        setLogoUrl(data.url);
        setLogoFileId(data.fileId);
      } else {
        setDesignFile(file);
        setDesignUrl(data.url);
        setDesignFileId(data.fileId);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = async () => {
    setError("");

    const configurationRecord: CustomLabelConfiguration = {
      id: `cfg_${Date.now()}`,
      customerId: user?.uid || "guest",
      productId: isRollOnLabel ? "prod_rollon_10ml" : undefined,
      customLabelProductId: isRollOnLabel ? "prod_rollon_label_10ml" : "prod_custom_labels",
      labelSizeId: effectiveSize.id,
      labelSizeName: effectiveSize.name,
      width: effectiveSize.width,
      height: effectiveSize.height,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      quantity: selectedQuantity,
      brandName,
      fragranceName,
      customText: `${customText} | ${volumeText}`,
      logoUrl: logoUrl || undefined,
      logoFileId: logoFileId || undefined,
      designUrl: designUrl || undefined,
      designFileId: designFileId || undefined,
      notes: notes || undefined,
      status: "draft",
      price: pricing.totalPrice,
      unitPrice: pricing.unitPrice,
      designData: {
        dimensions: {
          width: effectiveSize.width,
          height: effectiveSize.height,
          unit: "in",
        },
        background: {
          finish: selectedMaterial.finishType,
        },
        textFields: {
          brandName,
          fragranceName,
          customText,
          volumeText,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await customLabelRepository.saveConfiguration(configurationRecord);

    if (isRollOnLabel) {
      // PRODUCT 1 — ROLL-ON LABEL (Dedicated fixed product)
      const rollOnLabelProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_rollon_label_10ml") || {
        id: "prod_rollon_label_10ml",
        name: "Roll-On Label — 10 ml",
        slug: "roll-on-label-10ml",
        category: "custom-labels",
        sku: "LBL-ROL-10ML",
        basePrice: 0.25,
        currency: "USD",
      };

      addItem(
        rollOnLabelProduct as any,
        {
          id: `pkg_rollon_label_${selectedQuantity}u`,
          name: `Roll-On Label — 10 ml (${selectedQuantity} Labels)`,
          quantity: selectedQuantity,
          price: pricing.totalPrice,
          unitPrice: pricing.unitPrice,
        },
        1,
        {
          isCustomItem: true,
          customLabelSpecs: {
            product: "Roll-On Label — 10 ml",
            size: "1.5 × 2.5 in (Fixed 10ml Roll-On)",
            dimensions: "1.5 × 2.5 in",
            material: selectedMaterial.name,
            finish: selectedMaterial.finishType,
            quantity: selectedQuantity,
            unitPrice: pricing.unitPrice,
            total: pricing.totalPrice,
            designFile: designUrl || logoUrl || "Online Typographic Proof",
            bottleName: "10 ml Glass Roll-On Bottle",
            customText: `${brandName} — ${fragranceName}`,
          },
        }
      );
    } else {
      // PRODUCT 2 — GENERAL CUSTOM LABELS (Size-selectable product)
      const customLabelProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_custom_labels") || {
        id: "prod_custom_labels",
        name: "Custom Labels",
        slug: "custom-perfume-labels",
        category: "custom-labels",
        sku: "CUS-LBL-VAR",
        basePrice: 0.25,
        currency: "USD",
      };

      addItem(
        customLabelProduct as any,
        {
          id: `pkg_custom_label_${selectedSize.id}_${selectedQuantity}u`,
          name: `Custom Labels — ${selectedSize.width} × ${selectedSize.height} in (${selectedQuantity} Labels)`,
          quantity: selectedQuantity,
          price: pricing.totalPrice,
          unitPrice: pricing.unitPrice,
        },
        1,
        {
          isCustomItem: true,
          customLabelSpecs: {
            product: "Custom Labels",
            size: `${selectedSize.width} × ${selectedSize.height} in`,
            dimensions: `${selectedSize.width} × ${selectedSize.height} in`,
            material: selectedMaterial.name,
            finish: selectedMaterial.finishType,
            quantity: selectedQuantity,
            unitPrice: pricing.unitPrice,
            total: pricing.totalPrice,
            designFile: designUrl || logoUrl || "Online Typographic Proof",
            customText: `${brandName} — ${fragranceName}`,
          },
        }
      );
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-8">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 border-b border-gray-100 pb-4 mb-6">
          <Link href={isRollOnLabel ? "/product/10ml-glass-roll-on-bottles" : "/shop"} className="hover:text-gray-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> {isRollOnLabel ? "Back to 10ml Roll-On Bottle" : "Wholesale Catalog"}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">
            {isRollOnLabel ? "Roll-On Label — 10 ml" : "Custom Labels Studio"}
          </span>
        </nav>

        {/* Page Header */}
        <div className="sl-catalog-header mb-8">
          <span className="sl-catalog-eyebrow">
            {isRollOnLabel 
              ? "Dedicated 10 ml Roll-On Specification · Precision Metallic Foil" 
              : "General-Purpose Personalized Labels · Any Container / Bottle"}
          </span>
          <h1 className="sl-catalog-title">
            {isRollOnLabel ? "Roll-On Label — 10 ml" : "Custom Labels"}
          </h1>
          <p className="sl-catalog-subtitle">
            {isRollOnLabel 
              ? "Etiquetas metálicas de precisión precalibradas exclusivamente para frascos roll-on de 10 ml. Tamaño fijo (1.5 × 2.5 in) sin necesidad de seleccionar dimensiones."
              : "Etiquetas personalizadas para frascos de 10ml, 30ml, 50ml, 100ml o envases propios. Selecciona las dimensiones exactas para tu frasco."}
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Visual Preview & Yield Badge */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
            <div className="p-6 border border-gray-200 bg-white space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-[10px] font-semibold tracking-[0.2em] text-gray-500 uppercase">Live Proof</span>
                <span className="text-[10px] font-mono text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                  {selectedMaterial.name}
                </span>
              </div>

              <LabelPreview
                brandName={brandName}
                fragranceName={fragranceName}
                customText={customText}
                volumeText={volumeText}
                logoUrl={logoUrl}
                size={effectiveSize}
                material={selectedMaterial}
              />

              <LabelSheetYieldBadge
                width={effectiveSize.width}
                height={effectiveSize.height}
                quantity={selectedQuantity}
              />
            </div>
          </div>

          {/* Right Column: Configuration Selectors & Typography Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PRODUCT 1: FIXED SIZE BADGE (No size selector) */}
            {isRollOnLabel ? (
              <div className="p-5 border border-[#2B5F4A] bg-[#F6FAF8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-[#2B5F4A]" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#2B5F4A] block">
                      Fixed Label Size
                    </span>
                    <span className="text-xs font-semibold text-gray-900 block">
                      1.5 × 2.5 in (3.81 × 6.35 cm)
                    </span>
                    <span className="text-[10px] text-gray-500 font-light">
                      Calibrated specifically for 10 ml Glass Roll-On Bottle
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#2B5F4A] text-white text-[9px] font-bold tracking-widest uppercase">
                  Pre-Set
                </span>
              </div>
            ) : (
              /* PRODUCT 2: GENERAL CUSTOM LABELS SIZE SELECTOR */
              <div className="p-6 border border-gray-200 bg-white shadow-sm">
                <LabelSizeSelector
                  selectedSize={selectedSize}
                  onSelectSize={setSelectedSize}
                  recommendedSizeId="size_1_5x2_5"
                />
              </div>
            )}

            {/* Material & Foil Selector */}
            <div className="p-6 border border-gray-200 bg-white shadow-sm">
              <LabelMaterialSelector
                selectedMaterial={selectedMaterial}
                onSelectMaterial={setSelectedMaterial}
              />
            </div>

            {/* Typography Customization Form */}
            <div className="p-6 border border-gray-200 bg-white shadow-sm space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gray-900">
                  {isRollOnLabel ? "2. Label Typography & Text" : "3. Label Typography & Text"}
                </span>
                <span className="text-[10px] text-gray-400">Updates Proof in Real Time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 block">Brand / House Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#2B5F4A] focus:outline-none transition"
                    placeholder="e.g. AURA NOIR"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 block">Fragrance Name</label>
                  <input
                    type="text"
                    value={fragranceName}
                    onChange={(e) => setFragranceName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#2B5F4A] focus:outline-none transition"
                    placeholder="e.g. SANTAL IMPERIAL"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 block">Batch / Subtitle Text</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#2B5F4A] focus:outline-none transition"
                    placeholder="e.g. BATCH NO. 04 • HAND POURED"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 block">Volume / Concentration</label>
                  <input
                    type="text"
                    value={volumeText}
                    onChange={(e) => setVolumeText(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-[#2B5F4A] focus:outline-none transition"
                    placeholder={isRollOnLabel ? "e.g. 10 ML / 0.34 FL OZ" : "e.g. 50 ML / 1.7 FL OZ"}
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Volume Pricing Selector */}
            <div className="p-6 border border-gray-200 bg-white shadow-sm">
              <LabelQuantitySelector
                selectedQuantity={selectedQuantity}
                onSelectQuantity={setSelectedQuantity}
                size={effectiveSize}
                material={selectedMaterial}
              />
            </div>

            {/* Investment Summary & Add To Cart Button */}
            <div className="p-6 bg-gray-50 border border-gray-200 space-y-4">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 block">
                    {isRollOnLabel ? "Roll-On Label — 10 ml" : `Custom Labels (${effectiveSize.width} × ${effectiveSize.height} in)`}
                  </span>
                  <span className="text-xs text-gray-700">
                    {selectedQuantity} Labels @ ${pricing.unitPrice.toFixed(2)} / unit
                  </span>
                </div>
                <span className="text-2xl font-semibold text-gray-950">${pricing.totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                style={{
                  background: added ? "#2B5F4A" : "#111111",
                  color: "white",
                  padding: "14px 24px",
                  width: "100%",
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
                onMouseEnter={(e) => { if (!added) (e.target as HTMLElement).style.background = "#2B5F4A"; }}
                onMouseLeave={(e) => { if (!added) (e.target as HTMLElement).style.background = "#111111"; }}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Order
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add {selectedQuantity} Labels to Order
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
