"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { parseCsvContent, validateImportRows, commitImportBatch, ImportPreviewItem, transformAfricaFragrance } from "@/lib/fragrance/importer";
import { fetchFullAfricaImportsCatalog, RawAfricaFragrance } from "@/lib/fragrance/africa-imports-scraper";
import { formatCurrency } from "@/lib/utils";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Eye,
  Check,
  Globe,
  Database,
  ShieldCheck,
  Boxes
} from "lucide-react";

export default function AdminImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "completed">("upload");
  const [loading, setLoading] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [progressStatus, setProgressStatus] = useState("");
  const [resultSummary, setResultSummary] = useState<{ successful: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError("");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(selectedFile);
  };

  const handleFetchLiveCatalog = async () => {
    setFetchingLive(true);
    setError("");
    setProgressStatus("Connecting to Africa Imports GraphQL endpoint...");

    try {
      const rawCatalog = await fetchFullAfricaImportsCatalog((count, total) => {
        setProgressStatus(`Streaming products from Africa Imports: ${count} of ~${total}...`);
      });

      if (rawCatalog.length === 0) {
        throw new Error("No products found from Africa Imports live endpoint.");
      }

      setProgressStatus(`Formatting ${rawCatalog.length} products with SCENTLAB pricing & variants...`);

      const convertedRows = rawCatalog.map((raw) => ({
        name: raw.name,
        supplierProductId: raw.sku,
        supplierUrl: `https://africaimports.com${raw.path}`,
        category: "fragrance_oils",
        scentFamily: "Woody",
        gender: raw.gender.toLowerCase(),
        sourceSize: raw.sourceSize,
        sourceUnit: raw.sourceUnit,
        sourceCost: raw.sourcePrice,
        description: raw.plainTextDescription || "",
      }));

      const validated = await validateImportRows(convertedRows, "sup_africa_imports", "Africa Imports");
      setPreviewItems(validated);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to fetch live catalog from Africa Imports.");
    } finally {
      setFetchingLive(false);
      setProgressStatus("");
    }
  };

  const handleParseAndValidateCsv = async () => {
    if (!csvContent) {
      setError("Please select a valid CSV file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const parsedRows = parseCsvContent(csvContent);
      if (parsedRows.length === 0) {
        throw new Error("No valid data rows found in CSV. Please verify column headers.");
      }

      const validated = await validateImportRows(parsedRows, "sup_africa_imports", "Africa Imports");
      setPreviewItems(validated);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to process CSV file.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommitImport = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await commitImportBatch(previewItems);
      setResultSummary(result);
      setStep("completed");
    } catch (err: any) {
      setError(err.message || "Failed to commit import batch.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemAction = (index: number, action: "create" | "update" | "skip") => {
    const updated = [...previewItems];
    updated[index].action = action;
    setPreviewItems(updated);
  };

  const newProductsCount = previewItems.filter((i) => i.action === "create").length;
  const duplicateProductsCount = previewItems.filter((i) => i.action === "update").length;
  const invalidProductsCount = previewItems.filter((i) => !i.isValid).length;

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-body-md">
        {/* Header */}
        <div className="border-b border-outline-variant pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/fragrance"
              className="inline-flex items-center gap-1 text-xs text-secondary hover:text-primary mb-2 transition font-label-caps uppercase"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Fragrance Dashboard
            </Link>
            <h1 className="font-display-hero text-3xl text-primary uppercase">
              Fragrance Catalog Ingestion Engine
            </h1>
            <p className="font-body-md text-secondary text-sm mt-1 font-light">
              Ingest real wholesale fragrance oils from Africa Imports with automated 25% target margin pricing, repackaging variants, and 20-unit initial inventory.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="px-4 py-2 rounded-sm border border-outline-variant bg-surface text-primary hover:border-primary text-xs font-label-caps uppercase transition"
            >
              View Products
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-sm bg-surface-container-low border border-red-400 text-xs text-red-700 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CHOOSE IMPORT METHOD */}
        {step === "upload" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Live Ingestion Card */}
            <div className="p-8 rounded-sm border-2 border-primary bg-surface space-y-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-sm bg-primary text-on-primary flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>

                <div>
                  <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest block">Direct API Synchronization</span>
                  <h2 className="font-display-hero text-xl text-primary uppercase mt-1">Live Africa Imports Catalog (1,632 Items)</h2>
                  <p className="font-body-md text-secondary text-xs mt-2 leading-relaxed font-light">
                    Directly queries the live Africa Imports catalog. Ingests all available fragrances, extracts classifications (Women, Men, Unisex, Designer Type), calculates SCENTLAB repackaging pricing, and initializes 20 units of inventory.
                  </p>
                </div>

                <div className="p-4 rounded-sm bg-surface-container-low border border-outline-variant space-y-2 text-xs text-secondary font-light">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" /> SCENTLAB Pricing Formula:
                  </div>
                  <div className="font-mono text-[11px] text-primary">Selling Price = Total Cost ÷ 0.75 (25% margin)</div>
                  <div className="flex items-center gap-2 pt-1">
                    <Boxes className="w-4 h-4 text-primary" /> Initial Inventory: <strong>20 units / variant</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFetchLiveCatalog}
                disabled={fetchingLive}
                className="w-full py-3.5 rounded-sm flat-btn text-xs font-label-caps uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
              >
                {fetchingLive ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> {progressStatus || "Fetching Live Catalog..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Fetch & Ingest Live Catalog
                  </>
                )}
              </button>
            </div>

            {/* Custom CSV / File Ingestion */}
            <div className="p-8 rounded-sm border border-outline-variant bg-surface space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-sm bg-surface-container-low border border-outline-variant text-primary flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>

                <div>
                  <span className="font-label-caps text-[10px] text-secondary uppercase tracking-widest block">Spreadsheet Ingestion</span>
                  <h2 className="font-display-hero text-xl text-primary uppercase mt-1">Upload CSV / JSON Wholesale Sheet</h2>
                  <p className="font-body-md text-secondary text-xs mt-2 leading-relaxed font-light">
                    Upload a custom supplier price sheet or exported Africa Imports file. Accepted columns: <code>name</code>, <code>supplierProductId</code>, <code>sourceSize</code>, <code>sourceUnit</code>, <code>sourceCost</code>.
                  </p>
                </div>

                <div className="p-6 rounded-sm border border-dashed border-outline-variant bg-surface-container-low text-center space-y-2">
                  <UploadCloud className="w-8 h-8 text-secondary mx-auto" />
                  <span className="text-xs font-label-caps uppercase text-primary block">
                    {file ? file.name : "Choose CSV File"}
                  </span>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-label-caps file:uppercase file:bg-primary file:text-on-primary hover:file:opacity-90 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleParseAndValidateCsv}
                disabled={!file || loading}
                className="w-full py-3.5 rounded-sm border border-outline-variant bg-surface text-primary hover:border-primary text-xs font-label-caps uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Validate & Preview CSV
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: PREVIEW & CONFIRMATION */}
        {step === "preview" && (
          <div className="space-y-6">
            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 border border-outline-variant bg-surface rounded-sm">
                <span className="font-label-caps text-[10px] text-secondary uppercase block">Total Found</span>
                <span className="font-display-hero text-2xl text-primary">{previewItems.length}</span>
              </div>
              <div className="p-4 border border-outline-variant bg-surface rounded-sm">
                <span className="font-label-caps text-[10px] text-secondary uppercase block">New Products</span>
                <span className="font-display-hero text-2xl text-emerald-700">{newProductsCount}</span>
              </div>
              <div className="p-4 border border-outline-variant bg-surface rounded-sm">
                <span className="font-label-caps text-[10px] text-secondary uppercase block">Existing / Updates</span>
                <span className="font-display-hero text-2xl text-primary">{duplicateProductsCount}</span>
              </div>
              <div className="p-4 border border-outline-variant bg-surface rounded-sm">
                <span className="font-label-caps text-[10px] text-secondary uppercase block">Initial Stock / Variant</span>
                <span className="font-display-hero text-2xl text-primary">20 Units</span>
              </div>
            </div>

            {/* Ingestion Confirmation Actions */}
            <div className="p-6 border border-outline-variant bg-surface-container-low rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-label-caps text-label-caps text-primary uppercase">Ready to Ingest Fragrance Catalog</h3>
                <p className="font-caption text-caption text-secondary font-light">
                  Products will be saved in <strong>Draft</strong> status for Admin review and photograph uploading.
                </p>
              </div>

              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-sm border border-outline-variant bg-surface text-primary text-xs font-label-caps uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={loading}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-sm flat-btn text-xs font-label-caps uppercase flex items-center justify-center gap-2 shadow-xs"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Products...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Import {previewItems.length} Products
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-outline-variant bg-surface rounded-sm overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                <span className="font-label-caps text-label-caps text-primary uppercase">Catalog Preview (Showing first 25 items)</span>
                <span className="font-mono text-xs text-secondary">Showing 25 of {previewItems.length}</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low border-b border-outline-variant font-label-caps text-[10px] text-secondary uppercase">
                    <tr>
                      <th className="p-3">Source SKU</th>
                      <th className="p-3">Fragrance Name</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Source Cost</th>
                      <th className="p-3">Cost / Oz</th>
                      <th className="p-3">1 oz Price (25% Marg.)</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant font-light">
                    {previewItems.slice(0, 25).map((item, idx) => {
                      const costPerOz = item.data.costPerOz || 2.0;
                      const rawCost = Math.round((costPerOz * 1 + 0.55 + 0.15 + 0.15) * 100) / 100;
                      const samplePrice = Math.round((rawCost / 0.75) * 100) / 100;

                      return (
                        <tr key={idx} className="hover:bg-surface-container-low/50">
                          <td className="p-3 font-mono font-medium text-primary">{item.data.supplierProductId || "N/A"}</td>
                          <td className="p-3 font-medium text-primary">{item.data.name}</td>
                          <td className="p-3 font-label-caps uppercase">{item.data.gender}</td>
                          <td className="p-3 font-mono">${Number(item.data.sourceCost || 0).toFixed(2)}</td>
                          <td className="p-3 font-mono">${costPerOz.toFixed(2)}</td>
                          <td className="p-3 font-mono font-semibold text-primary">${samplePrice.toFixed(2)}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-sm bg-surface-container border border-outline-variant font-label-caps text-[9px] uppercase text-secondary">
                              Draft
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => toggleItemAction(idx, item.action === "skip" ? "create" : "skip")}
                              className={`px-2 py-1 rounded-sm text-[10px] font-label-caps uppercase transition ${
                                item.action === "skip"
                                  ? "bg-surface-container-low text-secondary border border-outline-variant"
                                  : "bg-primary text-on-primary"
                              }`}
                            >
                              {item.action === "skip" ? "Skipped" : "Include"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED */}
        {step === "completed" && (
          <div className="max-w-xl mx-auto p-8 rounded-sm border border-outline-variant bg-surface text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display-hero text-2xl text-primary uppercase">Catalog Ingestion Completed</h2>
              <p className="font-body-md text-secondary text-sm leading-relaxed font-light">
                Successfully ingested <strong>{resultSummary?.successful || previewItems.length}</strong> products into SCENTLAB.
              </p>
            </div>

            <div className="p-4 rounded-sm bg-surface-container-low border border-outline-variant text-left text-xs space-y-2 font-light">
              <div className="flex justify-between">
                <span>Products Ingested:</span>
                <strong className="font-mono text-primary">{resultSummary?.successful || previewItems.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Total Repackaging Variants:</span>
                <strong className="font-mono text-primary">{(resultSummary?.successful || previewItems.length) * 6}</strong>
              </div>
              <div className="flex justify-between">
                <span>Initial Inventory:</span>
                <strong className="font-mono text-primary">20 Units / Variant</strong>
              </div>
              <div className="flex justify-between">
                <span>Initial Product Status:</span>
                <strong className="font-label-caps text-secondary uppercase">Draft (Pending Photo Upload)</strong>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <Link
                href="/admin/products"
                className="px-6 py-3 rounded-sm flat-btn text-xs font-label-caps uppercase"
              >
                Go to Product Management
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
