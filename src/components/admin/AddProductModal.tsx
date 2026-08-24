"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  Plus, 
  Sparkles, 
  Droplet, 
  Box, 
  FlaskConical, 
  Check, 
  AlertCircle, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  Info,
  ScanLine,
  Barcode,
  Wand2,
  Upload,
  Search,
  Building2,
  Compass,
  ArrowRight
} from "lucide-react";
import { Product, ProductType, ProductStatus } from "@/types/product";
import { productService, generateSlug } from "@/lib/firestore/products";
import { 
  ARABIC_HOUSES, 
  DESIGNER_NICHE_HOUSES, 
  searchPerfumePresets, 
  PerfumePreset,
  PerfumeHouse
} from "@/data/perfume-catalog-database";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

type ProductCategoryOption = {
  id: string;
  name: string;
  category: string;
  productType: ProductType;
  icon: React.ElementType;
  description: string;
  color: string;
};

const CATEGORY_OPTIONS: ProductCategoryOption[] = [
  {
    id: "perfumes",
    name: "Perfumes (Finished)",
    category: "finished_perfumes",
    productType: "finished_perfume",
    icon: Sparkles,
    description: "Perfumes terminados listos para la venta al público",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    id: "fragrances",
    name: "Fragancias / Esencias",
    category: "fragrances",
    productType: "raw_material",
    icon: Droplet,
    description: "Aceites y concentrados de fragancia pura",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    id: "bottles",
    name: "Botellas & Roll-ons",
    category: "bottles",
    productType: "physical",
    icon: FlaskConical,
    description: "Frascos de vidrio, tapas, atomizadores y roll-ons",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    id: "packaging",
    name: "Cajas & Empaques",
    category: "packaging",
    productType: "packaging",
    icon: Box,
    description: "Cajas plegables, cajas rígidas y empaques de lujo",
    color: "bg-purple-50 text-purple-800 border-purple-200",
  },
  {
    id: "supplies",
    name: "Insumos & Alcohol",
    category: "supplies",
    productType: "physical",
    icon: Layers,
    description: "Base de perfume, pipetas, tiras olfativas y herramientas",
    color: "bg-gray-50 text-gray-800 border-gray-200",
  },
];

export function AddProductModal({ isOpen, onClose, onSaved }: AddProductModalProps) {
  const [selectedCatId, setSelectedCatId] = useState("perfumes");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [measure, setMeasure] = useState("100 ml / 3.4 fl oz");
  const [concentration, setConcentration] = useState("Eau de Parfum (EDP)");
  const [gender, setGender] = useState("Unisex");
  const [imageUrl, setImageUrl] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProductStatus>("active");
  const [sku, setSku] = useState("");
  const [justScanned, setJustScanned] = useState(false);

  // Perfume-specific Master Inspiration Fields
  const [inspiredBy, setInspiredBy] = useState("");
  const [originalBrand, setOriginalBrand] = useState("");
  const [estimatedSimilarity, setEstimatedSimilarity] = useState("");
  const [isOneToOne, setIsOneToOne] = useState("No");
  const [notes, setNotes] = useState("");
  const [referencePrice, setReferencePrice] = useState<number | "">("");

  // Perfume House Database Selection & Search
  const [houseTab, setHouseTab] = useState<"arabic" | "designer">("arabic");
  const [selectedHouse, setSelectedHouse] = useState<string>("Lattafa Perfumes");
  const [searchPresetQuery, setSearchPresetQuery] = useState("");
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [searchingAi, setSearchingAi] = useState(false);
  const [aiLookupResults, setAiLookupResults] = useState<PerfumePreset[]>([]);

  // Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [aiSuccessToast, setAiSuccessToast] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);

  // AI Photo Candidates State
  const [aiPhotoCandidates, setAiPhotoCandidates] = useState<string[]>([]);
  const [searchingPhotos, setSearchingPhotos] = useState(false);

  // Barcode Pistol Scanner Popup Modal
  const [showBarcodeScanPopup, setShowBarcodeScanPopup] = useState(false);
  const [popupScannedCode, setPopupScannedCode] = useState("");
  const [popupScanSuccess, setPopupScanSuccess] = useState(false);
  const popupBarcodeRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentCategory = CATEGORY_OPTIONS.find((c) => c.id === selectedCatId) || CATEGORY_OPTIONS[0];
  const activeHouseList = houseTab === "arabic" ? ARABIC_HOUSES : DESIGNER_NICHE_HOUSES;
  const currentHouseData = activeHouseList.find((h) => h.name === selectedHouse);

  // Live Auto-complete preset search from offline database + AI results
  const localResults = searchPresetQuery.trim().length >= 2 ? searchPerfumePresets(searchPresetQuery) : [];
  const presetResults = aiLookupResults.length > 0 ? aiLookupResults : localResults;

  const handleAiLookup = async (queryText?: string) => {
    const q = (queryText || searchPresetQuery || name).trim();
    if (!q) {
      setError("Por favor escribe el nombre de un perfume para buscar con IA.");
      return;
    }

    setSearchingAi(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/perfumes/lookup?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success && data.results?.length > 0) {
        setAiLookupResults(data.results);
        setShowPresetDropdown(true);

        // If exact URL or 1 single result, auto-populate immediately
        if (data.results.length === 1 || q.startsWith("http://") || q.startsWith("https://")) {
          handleSelectPreset(data.results[0]);
          setAiSuccessToast(`¡${data.results[0].name} (${data.results[0].brand}) autocompletado con IA! ✓`);
          setTimeout(() => setAiSuccessToast(""), 3500);
        } else {
          setAiSuccessToast(`Se encontraron ${data.results.length} perfumes. Elige el que buscas de la lista.`);
          setTimeout(() => setAiSuccessToast(""), 4000);
        }
      } else {
        setError(`No se encontraron detalles para "${q}". Puedes llenarlo manualmente.`);
      }
    } catch (e) {
      console.error("AI lookup error:", e);
      setError("Error al consultar la IA. Por favor intenta de nuevo.");
    } finally {
      setSearchingAi(false);
    }
  };

  const fetchAiPhotos = async (queryText: string) => {
    if (!queryText.trim()) return;
    setSearchingPhotos(true);
    try {
      const res = await fetch(`/api/admin/perfumes/images?q=${encodeURIComponent(queryText.trim())}`);
      const data = await res.json();
      if (data.success && data.images?.length > 0) {
        setAiPhotoCandidates(data.images);
        if (!imageUrl) {
          setImageUrl(data.images[0]);
        }
      }
    } catch (e) {
      console.error("Failed to fetch AI photos:", e);
    } finally {
      setSearchingPhotos(false);
    }
  };

  const handleSelectPreset = (preset: PerfumePreset & { imageUrl?: string; barcode?: string }) => {
    setName(preset.name);
    setBrand(preset.brand);
    setConcentration(preset.concentration);
    setGender(preset.gender);
    setMeasure(preset.measure);
    if (preset.description) setDescription(preset.description);
    if (preset.imageUrl && !imageUrl) setImageUrl(preset.imageUrl);
    if (preset.inspiredBy) setInspiredBy(preset.inspiredBy);
    if (preset.originalBrand) setOriginalBrand(preset.originalBrand);
    if (preset.estimatedSimilarity) setEstimatedSimilarity(preset.estimatedSimilarity);
    if (preset.isOneToOne) setIsOneToOne(preset.isOneToOne);
    if (preset.notes) setNotes(preset.notes);
    if (preset.referencePrice) setReferencePrice(preset.referencePrice);
    if (preset.suggestedPrice && !sellingPrice) setSellingPrice(preset.suggestedPrice);
    if (preset.suggestedCost && !costPrice) setCostPrice(preset.suggestedCost);

    setSearchPresetQuery("");
    setShowPresetDropdown(false);

    // Fetch candidate photos automatically!
    fetchAiPhotos(`${preset.brand} ${preset.name}`);

    // Open Barcode Pistol Scanner Popup immediately!
    setPopupScannedCode("");
    setPopupScanSuccess(false);
    setShowBarcodeScanPopup(true);
    setTimeout(() => {
      popupBarcodeRef.current?.focus();
    }, 150);
  };

  const handlePopupBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const code = popupScannedCode.trim();
      if (code) {
        setPopupScanSuccess(true);
        setSku(code);
        setJustScanned(true);

        // Confirmation beep
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.value = 0.15;
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 140);
        } catch {}

        setTimeout(() => {
          setShowBarcodeScanPopup(false);
          setPopupScanSuccess(false);
          setTimeout(() => setJustScanned(false), 2500);
        }, 600);
      }
    }
  };

  const handleSkipScan = () => {
    setShowBarcodeScanPopup(false);
  };

  const handleGenerateSkuFromPopup = () => {
    const prefix = selectedCatId === "perfumes" ? "PERF" : selectedCatId === "fragrances" ? "FRAG" : "ITEM";
    const cleanName = (name || "PROD").slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "");
    const random = Math.floor(100000 + Math.random() * 900000);
    const autoCode = `${prefix}-${cleanName}-${random}`;
    setSku(autoCode);
    setShowBarcodeScanPopup(false);
  };

  const handleGenerateSku = () => {
    const prefix = selectedCatId === "perfumes" ? "PERF" : selectedCatId === "fragrances" ? "FRAG" : "ITEM";
    const cleanName = (name || "PROD").slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "");
    const random = Math.floor(100000 + Math.random() * 900000);
    setSku(`${prefix}-${cleanName}-${random}`);
  };

  const handleBarcodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (sku.trim()) {
        setJustScanned(true);
        // Beep confirmation
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.value = 880;
          gain.gain.value = 0.1;
          osc.start();
          setTimeout(() => { osc.stop(); ctx.close(); }, 120);
        } catch {}
        setTimeout(() => setJustScanned(false), 2000);
      }
    }
  };

  // Image Upload to Backblaze B2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("entityType", "product");
      formData.append("entityId", sku || name ? generateSlug(name) : "general");
      formData.append("isPrimary", "true");

      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.mediaAsset?.url) {
        setImageUrl(data.mediaAsset.url);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      } else {
        // Fallback: convert to local data URL if S3 client is in dev/mock mode
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImageUrl(event.target.result as string);
            setUploadSuccess(true);
            setTimeout(() => setUploadSuccess(false), 2500);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      // Graceful fallback to client data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 2500);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre del producto es obligatorio.");
      return;
    }
    if (sellingPrice === "" || Number(sellingPrice) < 0) {
      setError("Por favor ingresa un precio de venta válido.");
      return;
    }

    setLoading(true);
    setError("");

    const autoSku = sku.trim() || `${selectedCatId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const autoSlug = generateSlug(`${brand ? brand + " " : ""}${name}`);
    const cost = costPrice !== "" ? Number(costPrice) : 0;
    const basePrice = Number(sellingPrice);

    const newProduct: Product = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      slug: autoSlug,
      category: selectedCatId,
      categoryName: currentCategory.name,
      subcategory: selectedCatId === "perfumes" ? (houseTab === "arabic" ? "Árabe" : "Diseñador / Nicho") : undefined,
      productType: selectedCatId === "perfumes" ? "finished_perfume" : "physical",
      brand: brand.trim() || (selectedCatId === "perfumes" ? "Lattafa" : "SCENTLAB"),
      brandType: houseTab === "arabic" ? "arabic" : "designer_niche",
      description: description.trim() || `${name} - ${currentCategory.name}`,
      shortDescription: description.trim().slice(0, 140) || `${name} (${measure || "100 ml"})`,
      sku: autoSku,
      upc: autoSku.length >= 8 && /^\d+$/.test(autoSku) ? autoSku : undefined,
      barcode: autoSku.length >= 8 && /^\d+$/.test(autoSku) ? autoSku : undefined,
      status: status,
      basePrice: basePrice,
      price: basePrice,
      cost: cost,
      referencePrice: typeof referencePrice === "number" ? referencePrice : undefined,
      costData: {
        supplierCost: cost,
        unitCost: cost,
        totalUnitCost: cost,
      },
      inspiredBy: inspiredBy.trim() || undefined,
      originalBrand: originalBrand.trim() || undefined,
      relationshipType: inspiredBy.trim() ? "Inspirado / dupe" : undefined,
      estimatedSimilarity: estimatedSimilarity.trim() || undefined,
      isOneToOne: isOneToOne.trim() || undefined,
      notes: notes.trim() || undefined,
      currency: "USD",
      tags: [selectedCatId, ...(brand ? [brand.toLowerCase()] : []), ...(gender ? [gender.toLowerCase()] : [])],
      attributes: {
        ...(measure ? { measure, size: measure } : {}),
        ...(selectedCatId === "perfumes" ? { concentration, gender } : {}),
        ...(brand ? { brand } : {}),
        ...(inspiredBy ? { inspiredBy, originalBrand } : {}),
      },
      inventory: {
        quantityInStock: 0,
        lowStockThreshold: 5,
        reorderPoint: 5,
        status: "out_of_stock",
      },
      primaryImageUrl: imageUrl.trim() || undefined,
      images: imageUrl.trim() ? [{ id: `img_${Date.now()}`, url: imageUrl.trim(), sortOrder: 0, isPrimary: true }] : [],
      media: imageUrl.trim()
        ? [
            {
              id: `media_${Date.now()}`,
              b2Key: "",
              url: imageUrl.trim(),
              fileName: "product-image.jpg",
              mimeType: "image/jpeg",
              size: 0,
              sortOrder: 1,
              isPrimary: true,
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const result = await productService.saveProduct(newProduct);
      if (!result.success) {
        throw new Error(result.error || "Error al guardar el producto.");
      }
      onSaved(result.product || newProduct);
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al crear el producto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#FAFAFA]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2B5F4A] text-white flex items-center justify-center shadow-xs">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-950 tracking-tight">Agregar Nuevo Producto</h2>
              <p className="text-[11px] text-gray-500">Crea productos con autocompletado de marcas y carga a Backblaze B2.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scrollable */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* 1. Category Destination Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
              1. Categoría de Destino
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const isSelected = selectedCatId === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition ${
                      isSelected
                        ? "border-[#2B5F4A] bg-[#2B5F4A]/5 ring-2 ring-[#2B5F4A]/20 shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center ${cat.color}`}>
                        <IconComponent className="w-3 h-3" />
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#2B5F4A]" />}
                    </div>
                    <span className="text-[11px] font-bold text-gray-900 leading-tight">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Intelligent Perfume House & Model Database (When Perfumes is selected) */}
          {selectedCatId === "perfumes" && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#2B5F4A]" />
                  <span className="text-xs font-bold text-gray-950">
                    Autocompletado Inteligente por Casa de Perfume
                  </span>
                </div>
                
                {/* House Type Tabs */}
                <div className="flex bg-white/80 p-0.5 rounded-lg border border-emerald-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => { setHouseTab("arabic"); setSelectedHouse(""); }}
                    className={`px-3 py-1 rounded-md transition ${
                      houseTab === "arabic"
                        ? "bg-[#2B5F4A] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    🕌 Perfumería Árabe
                  </button>
                  <button
                    type="button"
                    onClick={() => { setHouseTab("designer"); setSelectedHouse(""); }}
                    className={`px-3 py-1 rounded-md transition ${
                      houseTab === "designer"
                        ? "bg-[#2B5F4A] text-white shadow-2xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ✨ Diseñador & Nicho
                  </button>
                </div>
              </div>

              {/* Fast Autocomplete Search Bar */}
              <div className="space-y-1.5">
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Escribe el nombre (ej. Oud Mood, Tous, Asad, Khamrah, Santal, Aventus, Sauvage)..."
                      value={searchPresetQuery}
                      onChange={(e) => {
                        setSearchPresetQuery(e.target.value);
                        setAiLookupResults([]);
                        setShowPresetDropdown(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAiLookup();
                        }
                      }}
                      onFocus={() => setShowPresetDropdown(true)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-emerald-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] font-medium"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={searchingAi || !searchPresetQuery.trim()}
                    onClick={() => handleAiLookup()}
                    className="px-3.5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-xs whitespace-nowrap"
                  >
                    {searchingAi ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Buscando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Buscar con IA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Autocomplete Dropdown */}
                {showPresetDropdown && presetResults.length > 0 && (
                  <div className="relative z-30 max-h-56 overflow-y-auto bg-white border border-emerald-300 rounded-xl shadow-xl divide-y divide-gray-100">
                    <div className="px-3 py-1.5 bg-emerald-50 text-[10px] font-bold text-emerald-900 flex justify-between items-center">
                      <span>Resultados Encontrados ({presetResults.length}) — Haz clic para autocompletar:</span>
                      <button type="button" onClick={() => setShowPresetDropdown(false)} className="text-gray-400 hover:text-gray-700">✕</button>
                    </div>
                    {presetResults.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        className="w-full px-3.5 py-2 text-left hover:bg-emerald-50/70 flex items-center justify-between text-xs transition group"
                      >
                        <div>
                          <span className="font-bold text-gray-900 group-hover:text-[#2B5F4A] block">{p.name}</span>
                          <span className="text-[10px] text-emerald-800 font-semibold">{p.brand} · {p.concentration} · {p.gender}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">{p.measure}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Houses Quick Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  Seleccionar Casa de Perfume ({houseTab === "arabic" ? "Árabe" : "Diseñador"}):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {activeHouseList.map((h) => (
                    <button
                      key={h.name}
                      type="button"
                      onClick={() => {
                        setSelectedHouse(h.name);
                        setBrand(h.name);
                      }}
                      className={`px-2.5 py-1 text-[11px] rounded-lg border font-semibold transition ${
                        selectedHouse === h.name
                          ? "bg-[#2B5F4A] text-white border-[#2B5F4A] shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/40"
                      }`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Famous perfumes from the selected house */}
              {currentHouseData && (
                <div className="pt-2 border-t border-emerald-200/60 space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                    Perfumes más vendidos de {currentHouseData.name} (Clic para cargar datos):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {currentHouseData.famousPerfumes.map((perfume) => (
                      <button
                        key={perfume.name}
                        type="button"
                        onClick={() => handleSelectPreset(perfume)}
                        className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition shadow-2xs flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3 text-emerald-600 group-hover:text-white" />
                        <span>{perfume.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Product Specifications */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                2. Especificaciones del Producto ({currentCategory.name})
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Destino: /{selectedCatId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-700">Nombre del Producto *</label>
                  {selectedCatId === "perfumes" && (
                    <button
                      type="button"
                      disabled={searchingAi || (!name.trim() && !searchPresetQuery.trim())}
                      onClick={() => handleAiLookup(name || searchPresetQuery)}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 hover:bg-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                      {searchingAi ? "Consultando IA..." : "✨ Autocompletar con IA"}
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder={selectedCatId === "perfumes" ? "Ej. Oud Mood, Khamrah, Asad, Santal 33, Aventus..." : "Nombre descriptivo del producto"}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (!searchPresetQuery) setSearchPresetQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && selectedCatId === "perfumes" && name.trim()) {
                      e.preventDefault();
                      handleAiLookup(name);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] focus:border-transparent font-medium"
                />
                {aiSuccessToast && (
                  <p className="text-[11px] font-bold text-emerald-700 animate-fade-in flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {aiSuccessToast}
                  </p>
                )}
              </div>

              {/* Brand */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Marca / Casa</label>
                <input
                  type="text"
                  placeholder="Ej. Lattafa Perfumes, Armaf, Creed, Le Labo"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] focus:border-transparent"
                />
              </div>

              {/* Measure / Size */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Medida / Capacidad</label>
                <input
                  type="text"
                  placeholder="Ej. 100 ml / 3.4 fl oz, 50 ml, 1 Litro"
                  value={measure}
                  onChange={(e) => setMeasure(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] focus:border-transparent"
                />
              </div>

              {/* SKU / Barcode Scanner Input */}
              <div className="space-y-1 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-[#2B5F4A]" /> Código de Barra / SKU (Escanear con Pistola)
                  </label>
                  {justScanned ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-pulse flex items-center gap-1">
                      <Check className="w-3 h-3" /> ¡Código Escaneado con Pistola! ✓
                    </span>
                  ) : !sku ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <ScanLine className="w-3 h-3 text-amber-600 animate-pulse" /> 🎯 Apunta tu pistola para escanear
                    </span>
                  ) : (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <ScanLine className="w-3 h-3 text-[#2B5F4A]" /> Pistola lista para escanear
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={skuInputRef}
                      type="text"
                      placeholder="Apunta tu pistola y escanea el código de barras físico del perfume..."
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      onKeyDown={handleBarcodeKeyDown}
                      className={`w-full px-3.5 py-2.5 text-xs font-mono font-bold rounded-lg border transition ${
                        justScanned
                          ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400 text-emerald-950"
                          : !sku
                          ? "border-amber-300 bg-amber-50/30 focus:bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                          : "border-gray-300 bg-gray-50/60 focus:bg-white text-gray-950 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    title="Generar código automático si no tiene código de barra físico"
                    className="px-3 py-2 text-[11px] font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border border-gray-200 flex items-center gap-1.5 whitespace-nowrap transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Auto SKU
                  </button>
                </div>
                {!sku && (
                  <p className="text-[10px] text-gray-500">
                    Si el producto tiene código de barras físico en la caja, escanéalo con tu pistola. Si no tiene, presiona <strong>Auto SKU</strong>.
                  </p>
                )}
              </div>

              {/* Specific fields for Perfumes */}
              {selectedCatId === "perfumes" && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Concentración</label>
                    <select
                      value={concentration}
                      onChange={(e) => setConcentration(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] bg-white"
                    >
                      <option value="Eau de Parfum (EDP)">Eau de Parfum (EDP)</option>
                      <option value="Extrait de Parfum">Extrait de Parfum (Puro)</option>
                      <option value="Eau de Toilette (EDT)">Eau de Toilette (EDT)</option>
                      <option value="Perfume Oil / Attar">Perfume Oil / Attar</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Género</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] bg-white"
                    >
                      <option value="Unisex">Unisex</option>
                      <option value="Men">Men (Caballeros)</option>
                      <option value="Women">Women (Damas)</option>
                    </select>
                  </div>

                  {/* Inspiration / Dupe Profile Card */}
                  <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl sm:col-span-2 space-y-3">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Perfil de Inspiración / Dupe (Opcional)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-600">Inspirado en (Perfume original):</label>
                        <input
                          type="text"
                          placeholder="Ej. Santal 33, Baccarat Rouge 540, Sauvage"
                          value={inspiredBy}
                          onChange={(e) => setInspiredBy(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-600">Casa / Brand Original:</label>
                        <input
                          type="text"
                          placeholder="Ej. Le Labo, MFK, Dior, Creed"
                          value={originalBrand}
                          onChange={(e) => setOriginalBrand(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-600">Similitud Estimada:</label>
                        <input
                          type="text"
                          placeholder="Ej. ~90%, ~95%"
                          value={estimatedSimilarity}
                          onChange={(e) => setEstimatedSimilarity(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-600">Es 1 a 1:</label>
                        <select
                          value={isOneToOne}
                          onChange={(e) => setIsOneToOne(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="No">No</option>
                          <option value="Sí">Sí (1 a 1)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 4. Hard Drive Upload, Backblaze B2 & AI Photo Picker */}
              <div className="space-y-3 sm:col-span-2 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#2B5F4A]" /> Foto del Producto
                  </label>
                  <button
                    type="button"
                    disabled={searchingPhotos || (!name.trim() && !brand.trim())}
                    onClick={() => fetchAiPhotos(`${brand} ${name}`)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    {searchingPhotos ? "Buscando fotos..." : "🔍 Buscar Fotos con IA"}
                  </button>
                </div>

                {/* AI Found Photos Interactive Selection Grid */}
                {aiPhotoCandidates.length > 0 && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Fotos encontradas por la IA (Haz clic en la que más te guste):
                      </span>
                      <span className="text-[10px] text-gray-500 font-semibold">{aiPhotoCandidates.length} opciones</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {aiPhotoCandidates.map((imgSrc, idx) => {
                        const isSelected = imageUrl === imgSrc;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setImageUrl(imgSrc)}
                            className={`relative h-28 rounded-xl border-2 p-1.5 bg-white flex flex-col items-center justify-center overflow-hidden transition-all group ${
                              isSelected
                                ? "border-[#2B5F4A] ring-2 ring-[#2B5F4A]/30 shadow-md scale-102"
                                : "border-gray-200 hover:border-[#2B5F4A]/50 hover:shadow-xs"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgSrc}
                              alt={`Opción ${idx + 1}`}
                              className="w-full h-full object-contain transition-transform group-hover:scale-105"
                              onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }}
                            />
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 bg-[#2B5F4A] text-white p-0.5 rounded-full shadow-xs">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded backdrop-blur-2xs">
                              Opción {idx + 1}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload from Hard Drive or Custom URL */}
                <div className="flex flex-col sm:flex-row gap-3 items-center pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 hover:border-[#2B5F4A] rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    {uploadingImage ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#2B5F4A] border-t-transparent rounded-full animate-spin" />
                        <span>Subiendo a Backblaze B2...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 text-[#2B5F4A]" />
                        <span>Subir desde mi PC</span>
                      </>
                    )}
                  </button>

                  <div className="flex-1 w-full flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="O pega un enlace de imagen (URL) directo..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                    />
                    {imageUrl && (
                      <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center p-1 relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                        <button
                          type="button"
                          onClick={() => setImageUrl("")}
                          title="Eliminar foto"
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 4. Pricing & Accounting */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600 block">
              3. Precios & Contabilidad
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cost Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-500" /> Precio de Costo ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
                <p className="text-[10px] text-gray-400">Costo de compra referencial.</p>
              </div>

              {/* Selling Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Precio de Venta al Público ($ USD) *
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-bold text-emerald-950 rounded-lg border border-emerald-300 bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A]"
                />
                <p className="text-[10px] text-gray-400">Precio visible en el catálogo de la tienda.</p>
              </div>
            </div>

            {/* Inbound Notice */}
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-amber-900 leading-relaxed">
                <strong className="font-semibold">Control de Stock:</strong> El producto se registrará con <strong>0 unidades</strong>. El stock para la tienda se sumará al crear una <strong>Nota de Entrada</strong> con el proveedor a quien se le compró.
              </div>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Guardar Producto
                </>
              )}
            </button>
          </div>
        </form>

        {/* Barcode Pistol Scanner Popup Modal */}
        {showBarcodeScanPopup && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-[#2B5F4A] p-6 text-center space-y-5">
              
              {/* Header Icon */}
              <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2B5F4A] shadow-inner relative">
                <Barcode className="w-8 h-8" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>

              {/* Title & Product Name */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-950">
                  {popupScanSuccess ? "¡Código Escaneado con Éxito!" : "Escanear Código de Barra con Pistola"}
                </h3>
                <p className="text-xs text-gray-500">
                  Apunta tu lector al código de barras físico en la caja de <strong className="text-gray-900">{name || "este perfume"}</strong> y dispara.
                </p>
              </div>

              {/* Laser Scanner Viewfinder Box */}
              <div className={`p-4 rounded-xl border-2 transition-all ${
                popupScanSuccess 
                  ? "border-emerald-500 bg-emerald-50" 
                  : "border-[#2B5F4A] bg-gray-50/70"
              }`}>
                {popupScanSuccess ? (
                  <div className="py-3 flex flex-col items-center gap-1.5 text-emerald-700 animate-bounce">
                    <Check className="w-8 h-8" />
                    <span className="font-mono font-bold text-sm text-gray-950">{popupScannedCode}</span>
                    <span className="text-[11px] font-semibold">Guardado en el producto ✓</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        ref={popupBarcodeRef}
                        type="text"
                        autoFocus
                        placeholder="Esperando disparo de la pistola..."
                        value={popupScannedCode}
                        onChange={(e) => setPopupScannedCode(e.target.value)}
                        onKeyDown={handlePopupBarcodeKeyDown}
                        className="w-full px-4 py-3 text-center text-sm font-mono font-bold tracking-wider rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] text-gray-950 shadow-inner"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#2B5F4A]">
                      <ScanLine className="w-3.5 h-3.5 animate-pulse" /> Lector listo: presiona el gatillo
                    </div>
                  </div>
                )}
              </div>

              {/* Actions & Alternatives */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleGenerateSkuFromPopup}
                  className="flex-1 px-3 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center justify-center gap-1"
                >
                  <Wand2 className="w-3.5 h-3.5" /> Generar Auto-SKU
                </button>
                <button
                  type="button"
                  onClick={handleSkipScan}
                  className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition"
                >
                  Omitir / Poner luego
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
