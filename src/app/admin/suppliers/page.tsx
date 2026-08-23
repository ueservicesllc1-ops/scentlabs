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
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.email || "").toLowerCase().includes(search.toLowerCase());
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              RAW MATERIALS & VENDOR MANAGEMENT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Suppliers & Vendors
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow-lg shadow-amber-500/10"
            >
              <Plus className="w-4 h-4" /> Add New Supplier
            </button>

            <Link
              href="/admin/purchases"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <Boxes className="w-3.5 h-3.5 text-amber-400" /> Purchase Orders
            </Link>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Suppliers</span>
            <div className="text-2xl font-black text-white">{suppliers.length}</div>
            <span className="text-[10px] text-lab-400">Africa Imports, Amazon, Nature's Oil</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Active Suppliers</span>
            <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
            <span className="text-[10px] text-lab-400">Approved for PO creation</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Purchases Volume</span>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(totalPurchasesVolume)}
            </div>
            <span className="text-[10px] text-lab-400">Historical procurement spend</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Mapped SKUs</span>
            <div className="text-2xl font-black text-white">{supplierProducts.length}</div>
            <span className="text-[10px] text-lab-400">Vendor product mappings</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vendor name, contact person, or email..."
              className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Vendors</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">Supplier Name</th>
                <th className="p-3.5">Category / Channel</th>
                <th className="p-3.5">Contact / Email</th>
                <th className="p-3.5 text-center">Mapped SKUs</th>
                <th className="p-3.5 text-right">Total Spend</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-lab-500">Loading vendor records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-lab-500">No suppliers found.</td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const mappedCount = supplierProducts.filter((sp) => sp.supplierId === s.id).length;
                  return (
                    <tr key={s.id} className="hover:bg-lab-900/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white uppercase text-[11px] leading-tight">
                          {s.name}
                        </div>
                        {s.website && (
                          <a
                            href={s.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-amber-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                          >
                            <Globe className="w-2.5 h-2.5" /> {s.website.replace(/^https?:\/\//, "")}
                          </a>
                        )}
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-lab-900 text-lab-300 border border-lab-800 uppercase text-[10px]">
                          {(s.sourceType || "Vendor").replace("_", " ")}
                        </span>
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <div className="text-white font-bold">{s.contactName || "—"}</div>
                        <div className="text-[10px] text-lab-500">{s.email || s.phone || "—"}</div>
                      </td>

                      <td className="p-3.5 text-center font-bold text-white font-mono">
                        {mappedCount}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(s.totalPurchasesAmount || 0)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          s.active
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-950 text-rose-400 border border-rose-500/30"
                        }`}>
                          {s.active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Link
                            href={`/admin/suppliers/${s.id}`}
                            className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-lab-300 hover:text-white text-[11px] font-bold uppercase transition"
                          >
                            Overview
                          </Link>
                          <Link
                            href={`/admin/suppliers/${s.id}/products`}
                            className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 hover:text-white text-[11px] font-bold uppercase transition"
                          >
                            Products
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Add Supplier Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-lab-950 border border-lab-800 p-6 space-y-4 shadow-2xl font-mono text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3">
                <h3 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" /> Register Supplier / Vendor
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-lab-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSupplier} className="space-y-3">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Company Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Africa Imports / Bulk Apothecary"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Website URL</label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://africaimports.com"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Channel Type</label>
                    <select
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="importer">Direct Importer</option>
                      <option value="domestic_manufacturer">Domestic Manufacturer</option>
                      <option value="amazon">Amazon Vendor / ASIN</option>
                      <option value="craft_direct">Craft / Die-Cut Supply</option>
                      <option value="specialty_distributor">Specialty Distributor</option>
                      <option value="aliexpress">AliExpress Direct</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Contact Person</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Wholesale Accounts"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="orders@supplier.com"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (800) 000-0000"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Physical Address / Dock</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, State"
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Procurement Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Terms, minimum orders, discount codes, shipping accounts..."
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white placeholder-lab-600 focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase"
                  >
                    {saving ? "Saving..." : "Save Supplier"}
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
