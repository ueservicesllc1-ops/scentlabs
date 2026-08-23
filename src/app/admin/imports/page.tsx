"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { parseCsvContent, validateImportRows, commitImportBatch, ImportPreviewItem } from "@/lib/fragrance/importer";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
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
  Check
} from "lucide-react";

export default function AdminImportsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState("");
  const [previewItems, setPreviewItems] = useState<ImportPreviewItem[]>([]);
  const [step, setStep] = useState<"upload" | "preview" | "completed">("upload");
  const [loading, setLoading] = useState(false);
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

  const handleParseAndValidate = async () => {
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

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link
              href="/admin/fragrance"
              className="inline-flex items-center gap-1 text-xs text-lab-400 hover:text-white mb-2 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Fragrance Dashboard
            </Link>
            <h1 className="text-3xl font-black text-white uppercase">
              Bulk Catalog Import & Ingestion
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Ingest fragrance oil wholesale sheets from Africa Imports with duplicate detection and automated variant generation.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/admin/fragrance"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs"
            >
              Cancel
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: UPLOAD */}
        {step === "upload" && (
          <div className="max-w-xl mx-auto p-8 rounded-2xl border border-lab-800 bg-lab-950 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white uppercase">Upload Africa Imports CSV</h2>
              <p className="text-xs text-lab-400 leading-relaxed">
                Accepted columns: <code>name</code>, <code>supplierProductId</code>, <code>sourceSize</code>, <code>sourceUnit</code>, <code>sourceCost</code>, <code>scentFamily</code>.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-dashed border-lab-700 bg-lab-900/40 space-y-3">
              <FileText className="w-8 h-8 text-lab-500 mx-auto" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {file ? file.name : "Select CSV / JSON File"}
                </span>
                <span className="text-[10px] text-lab-500">Spreadsheet file (Max 10MB)</span>
              </div>

              <label className="inline-block px-4 py-2 rounded bg-lab-800 hover:bg-lab-700 text-white cursor-pointer text-xs font-bold transition">
                Browse Files
                <input type="file" accept=".csv,.json,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            <button
              type="button"
              onClick={handleParseAndValidate}
              disabled={loading || !file}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Preview & Validate Records
            </button>
          </div>
        )}

        {/* STEP 2: PREVIEW & DUPLICATE RESOLUTION */}
        {step === "preview" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-lab-950 p-4 rounded-xl border border-lab-800 text-xs">
              <div>
                <span className="text-white font-bold">{previewItems.length} records parsed from CSV</span>
                <span className="text-lab-400 block text-[11px]">
                  Duplicates automatically flagged. Review action per row before writing to database.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="px-3 py-2 rounded bg-lab-900 border border-lab-800 text-lab-400 hover:text-white"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleCommitImport}
                  disabled={loading}
                  className="px-5 py-2 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 flex items-center gap-1.5 shadow"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Confirm & Ingest Batch
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Row</th>
                    <th className="p-3">Fragrance Name</th>
                    <th className="p-3">Supplier Item #</th>
                    <th className="p-3">Source Purchase</th>
                    <th className="p-3">Calculated Cost / Oz</th>
                    <th className="p-3">Duplicate Match</th>
                    <th className="p-3 text-right">Import Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-lab-800/60">
                  {previewItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-lab-800/30 transition">
                      <td className="p-3 text-lab-500 font-mono">#{item.row}</td>
                      <td className="p-3 font-bold text-white uppercase">{item.data.name}</td>
                      <td className="p-3 text-lab-300">{item.data.supplierProductId || "—"}</td>
                      <td className="p-3 text-lab-300">
                        {item.data.sourceSize} {item.data.sourceUnit} ({formatCurrency(item.data.sourceCost || 0)})
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {formatUnitPrice(item.data.costPerOz || 0)}/oz
                      </td>
                      <td className="p-3">
                        {item.duplicateMatch ? (
                          <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400 text-[10px] font-bold">
                            Matches {item.duplicateMatch.name}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-400">New Product</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <select
                          value={item.action}
                          onChange={(e) => toggleItemAction(idx, e.target.value as any)}
                          className="bg-lab-900 border border-lab-700 rounded px-2 py-1 text-white text-[11px]"
                        >
                          <option value="create">Create New</option>
                          <option value="update">Update Existing</option>
                          <option value="skip">Skip</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETED */}
        {step === "completed" && resultSummary && (
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-lab-800 bg-lab-950 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase">Batch Ingestion Successful</h2>
            <p className="text-xs text-lab-300 leading-relaxed">
              <strong>{resultSummary.successful}</strong> fragrance oil formulations and automated repackaging size variants have been registered in SCENTLAB.
            </p>

            <div className="pt-4 flex gap-3 justify-center">
              <Link
                href="/admin/fragrance"
                className="px-5 py-2.5 rounded-lg bg-amber-500 text-lab-950 font-bold text-xs uppercase hover:brightness-110"
              >
                View Fragrance Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
