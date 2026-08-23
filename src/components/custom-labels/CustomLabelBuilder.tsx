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
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { LabelPreview } from "./LabelPreview";
import { LabelSizeSelector } from "./LabelSizeSelector";
import { LabelMaterialSelector } from "./LabelMaterialSelector";
import { LabelQuantitySelector } from "./LabelQuantitySelector";
import { LabelSheetYieldBadge } from "./LabelSheetYieldBadge";
import { 
  Sparkles, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  FileCheck, 
  Layers,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

interface CustomLabelBuilderProps {
  initialProductId?: string; // e.g. "prod_rollon_10ml" or "10ml-roll-on"
}

export function CustomLabelBuilder({ initialProductId }: CustomLabelBuilderProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();

  // Find referenced bottle product if any
  const referencedProduct = INITIAL_PRODUCTS.find(
    (p) => p.id === initialProductId || p.slug === initialProductId || p.slug === "10ml-glass-roll-on-bottles"
  );

  // Default size matching bottle config or 1.5 x 2.25 for 10ml roll-on
  const recommendedSizeId =
    referencedProduct?.id === "prod_rollon_10ml" || initialProductId?.includes("rollon") || initialProductId?.includes("roll-on")
      ? "size_1_5x2_25"
      : referencedProduct?.customLabelConfig?.hasCustomLabel
      ? "size_1_5x2_25"
      : "size_1_5x2";

  const initialSize =
    STANDARD_LABEL_SIZES.find((s) => s.id === recommendedSizeId) || STANDARD_LABEL_SIZES[4];

  const [selectedSize, setSelectedSize] = useState<LabelSize>(initialSize);
  const [selectedMaterial, setSelectedMaterial] = useState<LabelMaterial>(STANDARD_LABEL_MATERIALS[0]);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(50);

  // Customization Form State
  const [brandName, setBrandName] = useState("AURA NOIR");
  const [fragranceName, setFragranceName] = useState("SANTAL IMPERIAL");
  const [customText, setCustomText] = useState("BATCH NO. 04 • HAND POURED IN BROOKLYN");
  const [volumeText, setVolumeText] = useState("EAU DE PARFUM • 10 ML / 0.34 FL OZ");
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

  // Price Calculation
  const pricing = calculateLabelPricing(
    selectedSize.width,
    selectedSize.height,
    selectedQuantity,
    selectedMaterial.id
  );

  // File Upload Handler to Backblaze B2 via API
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

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to upload file to Backblaze B2.");
      }

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
      setError(err.message || "Failed to upload asset.");
    } finally {
      setUploading(false);
    }
  };

  const handleAddToCart = async () => {
    setError("");
    const configId = `cl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Create CustomLabelConfiguration record
    const configurationRecord: CustomLabelConfiguration = {
      id: configId,
      customerId: user?.uid || null,
      productId: referencedProduct?.id,
      customLabelProductId: "prod_custom_labels",
      labelSizeId: selectedSize.id,
      labelSizeName: selectedSize.name,
      width: selectedSize.width,
      height: selectedSize.height,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      quantity: selectedQuantity,
      brandName,
      fragranceName,
      customText,
      logoFileId: logoFileId || undefined,
      logoUrl: logoUrl || undefined,
      designFileId: designFileId || undefined,
      designUrl: designUrl || undefined,
      notes: notes || undefined,
      status: "draft",
      price: pricing.totalPrice,
      unitPrice: pricing.unitPrice,
      designData: {
        dimensions: {
          width: selectedSize.width,
          height: selectedSize.height,
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

    // 2. Persist configuration in Firestore repository
    await customLabelRepository.saveConfiguration(configurationRecord);

    // 3. Add to Cart with exact configuration ID reference
    const customLabelProduct = INITIAL_PRODUCTS.find((p) => p.id === "prod_custom_labels") || INITIAL_PRODUCTS[4];

    addItem(
      customLabelProduct,
      {
        id: `pkg_custom_${selectedQuantity}u`,
        quantity: selectedQuantity,
        price: pricing.totalPrice,
        unitPrice: pricing.unitPrice,
      },
      1,
      {
        isCustomItem: true,
        customLabelSpecs: {
          bottleName: referencedProduct?.name || "Standard Container",
          dimensions: `${selectedSize.name} (${selectedMaterial.name})`,
          material: selectedMaterial.name,
          customText: `${brandName} — ${fragranceName}`,
        },
      }
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Breadcrumb & Header */}
      <div>
        <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs text-lab-400 hover:text-white mb-2 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" /> CUSTOM PERFUME LABELS STUDIO
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              {referencedProduct ? `Custom Labels for ${referencedProduct.name}` : "Custom Perfume & Oil Labels"}
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Precision die-cut metallic foil on waterproof vinyl. Designed for perfume oils, atomizers, and glass roll-ons.
            </p>
          </div>

          {referencedProduct && (
            <div className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 text-xs text-lab-300 flex items-center gap-2">
              <span>Matched container:</span>
              <strong className="text-white">{referencedProduct.name}</strong>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Visual Preview & Yield Badge */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950/60 shadow-xl space-y-4">
            <LabelPreview
              brandName={brandName}
              fragranceName={fragranceName}
              customText={customText}
              volumeText={volumeText}
              logoUrl={logoUrl}
              size={selectedSize}
              material={selectedMaterial}
            />

            <LabelSheetYieldBadge
              width={selectedSize.width}
              height={selectedSize.height}
              quantity={selectedQuantity}
            />
          </div>
        </div>

        {/* Right Column: Configuration Selectors & Typography Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Size Selector */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40">
            <LabelSizeSelector
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              recommendedSizeId={recommendedSizeId}
            />
          </div>

          {/* 2. Material & Foil Selector */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40">
            <LabelMaterialSelector
              selectedMaterial={selectedMaterial}
              onSelectMaterial={setSelectedMaterial}
            />
          </div>

          {/* 3. Quantity & Volume Pricing Selector */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40">
            <LabelQuantitySelector
              selectedQuantity={selectedQuantity}
              onSelectQuantity={setSelectedQuantity}
              size={selectedSize}
              material={selectedMaterial}
            />
          </div>

          {/* 4. Brand & Text Details */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              4. Brand Typography & Formulation Text
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-lab-400 block mb-1 text-[10px] uppercase">Brand / Studio Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="AURA NOIR"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-lab-400 block mb-1 text-[10px] uppercase">Fragrance Name</label>
                <input
                  type="text"
                  value={fragranceName}
                  onChange={(e) => setFragranceName(e.target.value)}
                  placeholder="SANTAL IMPERIAL"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 text-[10px] uppercase">Subtitle / Concentration / Batch Info</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="BATCH NO. 04 • ARTISANAL COMPOSITION"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-lab-400 block mb-1 text-[10px] uppercase">Volume Text</label>
                <input
                  type="text"
                  value={volumeText}
                  onChange={(e) => setVolumeText(e.target.value)}
                  placeholder="10 ML / 0.34 FL OZ"
                  className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 5. Logo & Design File Upload (B2 Integration) */}
          <div className="p-6 rounded-2xl border border-lab-800 bg-lab-900/40 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              5. Logo & Vector Artwork (Optional)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Logo Upload Box */}
              <div className="p-4 rounded-xl border border-dashed border-lab-700 bg-lab-950 text-center space-y-2 relative">
                <UploadCloud className="w-6 h-6 text-amber-400 mx-auto" />
                <div>
                  <span className="font-bold text-white block">Upload Brand Logo</span>
                  <span className="text-[10px] text-lab-500">PNG, JPG, SVG (Max 15MB)</span>
                </div>
                {logoFile ? (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {logoFile.name}
                  </div>
                ) : (
                  <label className="inline-block px-3 py-1.5 rounded bg-lab-800 hover:bg-lab-700 text-white cursor-pointer text-[11px] transition">
                    Browse File
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "logo");
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Ready Design File Upload */}
              <div className="p-4 rounded-xl border border-dashed border-lab-700 bg-lab-950 text-center space-y-2 relative">
                <FileCheck className="w-6 h-6 text-indigo-400 mx-auto" />
                <div>
                  <span className="font-bold text-white block">Upload Print-Ready File</span>
                  <span className="text-[10px] text-lab-500">PDF, SVG, High-Res PNG</span>
                </div>
                {designFile ? (
                  <div className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {designFile.name}
                  </div>
                ) : (
                  <label className="inline-block px-3 py-1.5 rounded bg-lab-800 hover:bg-lab-700 text-white cursor-pointer text-[11px] transition">
                    Browse Design
                    <input
                      type="file"
                      accept=".pdf,.svg,.png,.jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "design");
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Price Summary & Add to Cart Action */}
          <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-4 shadow-2xl">
            <div className="flex justify-between items-baseline border-b border-lab-800 pb-3">
              <div>
                <span className="text-[10px] text-lab-400 uppercase block">Custom Batch Total ({selectedQuantity} units)</span>
                <span className="text-2xl font-black text-amber-400">
                  {formatCurrency(pricing.totalPrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-lab-400 uppercase block">Unit Price</span>
                <span className="text-sm font-bold text-white">
                  {formatUnitPrice(pricing.unitPrice)} / label
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={uploading}
                className="flex-1 py-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-950" /> Added to Batch!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add Custom Labels to Cart ({formatCurrency(pricing.totalPrice)})
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="px-5 py-4 rounded-xl text-xs font-bold uppercase bg-lab-900 border border-lab-800 text-white hover:bg-lab-800 transition flex items-center gap-1.5"
              >
                View Cart <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
