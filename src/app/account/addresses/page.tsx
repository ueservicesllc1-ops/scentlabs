"use client";

import React, { useEffect, useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { customerRepository } from "@/lib/firestore/customer";
import { CustomerAddress } from "@/types/customer";
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Building,
  Phone,
  ShieldCheck 
} from "lucide-react";

export default function AccountAddressesPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const loadAddresses = async () => {
    if (!user) return;
    const all = await customerRepository.getAddresses(user.uid);
    setAddresses(all);
    setLoading(false);
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFirstName("");
    setLastName("");
    setCompany("");
    setLine1("");
    setLine2("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("United States");
    setPhone("");
    setIsDefault(addresses.length === 0);
    setModalOpen(true);
  };

  const handleOpenEdit = (addr: CustomerAddress) => {
    setEditingAddress(addr);
    setFirstName(addr.firstName || addr.name || "");
    setLastName(addr.lastName || "");
    setCompany(addr.company || "");
    setLine1(addr.line1 || addr.street1 || addr.streetAddress || "");
    setLine2(addr.line2 || addr.street2 || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    setPhone(addr.phone || "");
    setIsDefault(addr.isDefault || false);
    setModalOpen(true);
  };

  const handleDelete = async (addrId: string) => {
    if (!user) return;
    await customerRepository.deleteAddress(addrId, user.uid);
    await loadAddresses();
  };

  const handleSetDefault = async (addrId: string) => {
    if (!user) return;
    await customerRepository.setDefaultAddress(addrId, user.uid);
    await loadAddresses();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newAddr: CustomerAddress = {
      id: editingAddress?.id || `addr_${Date.now()}`,
      customerId: user.uid,
      firstName,
      lastName,
      company,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      phone,
      isDefault,
      createdAt: editingAddress?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await customerRepository.saveAddress(newAddr);
    setModalOpen(false);
    await loadAddresses();
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-mono">
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" /> ADDRESS BOOK & DISPATCH LOCATIONS
            </div>
            <h2 className="text-xl font-bold text-white uppercase mt-1">
              Shipping & Lab Addresses
            </h2>
            <p className="text-xs text-lab-400">
              Manage your delivery addresses for seamless checkout and automatic shipping calculation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> Add New Address
          </button>
        </div>

        {/* Address Cards Grid */}
        {loading ? (
          <div className="text-xs text-lab-500 py-10 text-center">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="p-12 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
            <MapPin className="w-8 h-8 text-lab-600 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">No Saved Addresses</h3>
            <p className="text-xs text-lab-400">
              Add a shipping address to expedite checkout on future formulation orders.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold text-xs uppercase"
            >
              Add First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border bg-lab-950 space-y-3 flex flex-col justify-between ${
                  addr.isDefault ? "border-amber-500/60 shadow-lg shadow-amber-500/5" : "border-lab-800"
                }`}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white uppercase">
                      {addr.firstName} {addr.lastName}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  {addr.company && (
                    <div className="text-[11px] text-lab-400 font-bold">{addr.company}</div>
                  )}

                  <div className="text-lab-300 leading-relaxed">
                    {addr.line1}
                    {addr.line2 && <div>{addr.line2}</div>}
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div className="text-lab-500">{addr.country}</div>
                  </div>

                  {addr.phone && (
                    <div className="text-[11px] text-lab-400 font-mono pt-1">
                      Phone: {addr.phone}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-lab-900 flex justify-between items-center text-xs">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[10px] text-lab-400 hover:text-amber-400 uppercase font-bold"
                    >
                      Set as Default
                    </button>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white"
                      title="Edit Address"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-rose-400"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-lab-950 border border-lab-800 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3">
                <h3 className="text-sm font-bold text-white uppercase">
                  {editingAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-lab-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Company (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Address Line 1</label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="123 Formulator Way"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Suite / Apt / Unit</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Suite 400"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">State</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">ZIP Code</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Country</label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-lab-400 block mb-1 uppercase text-[10px]">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-lab-800 text-amber-500"
                  />
                  <label htmlFor="isDefault" className="text-lab-300 text-xs cursor-pointer">
                    Set as default shipping address
                  </label>
                </div>

                <div className="pt-3 border-t border-lab-900 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
