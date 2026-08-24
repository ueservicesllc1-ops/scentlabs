"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { supplierRepository } from "@/lib/firestore/suppliers";
import { supplierProductRepository } from "@/lib/firestore/supplier-products";
import { Supplier, SupplierProduct } from "@/types/supplier";
import { formatCurrency } from "@/lib/utils";
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Boxes, 
  ArrowRight, 
  DollarSign, 
  Layers, 
  X, 
  Phone, 
  Mail, 
  Globe 
} from "lucide-react";

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // New Supplier Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [address, setAddress] = useState("");
  const [sourceType, setSourceType] = useState<any>("domestic_manufacturer");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    const [allSuppliers, allProducts] = await Promise.all([
      supplierRepository.getAllSuppliers(),
      supplierProductRepository.getAll(),
    ]);
    setSuppliers(allSuppliers);
    setSupplierProducts(allProducts);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPurchasesVolume = suppliers.reduce((acc, s) => acc + (s.totalPurchasesAmount || 0), 0);
  const activeCount = suppliers.filter((s) => s.active).length;

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      (s.contactName || "").toLowerCase().includes(q) ||
      (s.email || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? s.active : !s.active);
    return matchSearch && matchStatus;
  });

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const id = `supp_${name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    const newSupplier: Supplier = {
      id,
      name,
      website,
      email,
      phone,
      contactName,
      address,
      sourceType,
      notes,
      active: true,
      totalPurchasesCount: 0,
      totalPurchasesAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await supplierRepository.saveSupplier(newSupplier);
    setIsModalOpen(false);
    setSaving(false);
    setName("");
    setWebsite("");
    setEmail("");
    setPhone("");
    setContactName("");
    setAddress("");
    setNotes("");
    await loadData();
  };

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Building2 className="w-3 h-3 text-gray-600" /> Vendor Directory & Supply Chain Directory
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Suppliers Directory ({suppliers.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Maintain domestic and international vendors (Africa Imports, Amazon ASINs, AliExpress containers, packaging cardstock).
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider text-xs rounded-lg shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Add New Supplier
          </button>
        </div>

        {/* ━━━━ KPI CARDS ━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Total Suppliers</span>
            <div className="text-2xl font-bold text-gray-950">{suppliers.length}</div>
            <span className="text-[11px] text-gray-500 block">Registered source accounts</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Active Suppliers</span>
            <div className="text-2xl font-bold text-[#166534]">{activeCount}</div>
            <span className="text-[11px] text-gray-500 block">Active purchasing channels</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Mapped Sourcing SKUs</span>
            <div className="text-2xl font-bold text-gray-950">{supplierProducts.length}</div>
            <span className="text-[11px] text-gray-500 block">Linked source catalog items</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-gray-500 uppercase block">Lifetime PO Volume</span>
            <div className="text-2xl font-bold text-[#2B5F4A] font-mono">
              {formatCurrency(totalPurchasesVolume)}
            </div>
            <span className="text-[11px] text-gray-500 block">Completed raw materials</span>
          </div>
        </div>

        {/* ━━━━ SEARCH & FILTER ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier name, contact, or email..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by vendor status"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
          >
            <option value="all">All Vendors</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* ━━━━ SUPPLIERS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Supplier Name</th>
                  <th className="py-3.5 px-4">Source Channel</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-right">Linked SKUs</th>
                  <th className="py-3.5 px-4 text-right">Total Purchases</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => {
                  const linkedCount = supplierProducts.filter((sp) => sp.supplierId === s.id).length;

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-950 text-xs">{s.name}</div>
                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#2B5F4A] hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            <span>{s.website.replace(/^https?:\/\//, "")}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-200">
                          {s.sourceType?.replace("_", " ") || "Manufacturer"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-700">
                        {s.contactName && <div className="font-medium text-gray-900">{s.contactName}</div>}
                        {s.email && <div className="text-[11px] text-gray-500">{s.email}</div>}
                        {s.phone && <div className="text-[10px] text-gray-500 font-mono">{s.phone}</div>}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        {linkedCount} SKUs
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#2B5F4A]">
                        {formatCurrency(s.totalPurchasesAmount || 0)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            s.active
                              ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                              : "bg-gray-100 border-gray-200 text-gray-700"
                          }`}
                        >
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/suppliers/${s.id}`}
                          className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                        >
                          View Vendor →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━ ADD SUPPLIER MODAL ━━━━ */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-lg w-full space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <span className="font-bold text-gray-950 text-base">Add New Supply Vendor</span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-4">
                <div>
                  <label className="text-gray-700 font-semibold block mb-1">Company / Supplier Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Africa Imports, Amazon Wholesale, Uline..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Vendor Type</label>
                    <select
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                    >
                      <option value="domestic_manufacturer">Domestic Manufacturer</option>
                      <option value="wholesaler_distributor">Wholesaler / Distributor</option>
                      <option value="international_supplier">International Supplier</option>
                      <option value="retail_arbitrage">Retail / Amazon ASIN</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 font-semibold block mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:border-[#2B5F4A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider transition shadow-xs disabled:opacity-50"
                  >
                    {saving ? "Creating..." : "Save Supplier"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
