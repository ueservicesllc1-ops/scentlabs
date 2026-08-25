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
    setFirstName(addr.firstName || "");
    setLastName(addr.lastName || "");
    setCompany(addr.company || "");
    setLine1(addr.line1 || "");
    setLine2(addr.line2 || "");
    setCity(addr.city || "");
    setState(addr.state || "");
    setPostalCode(addr.postalCode || "");
    setCountry(addr.country || "United States");
    setPhone(addr.phone || "");
    setIsDefault(addr.isDefault || false);
    setModalOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!user || !confirm("¿Estás seguro de que deseas eliminar esta dirección?")) return;
    await customerRepository.deleteAddress(addressId, user.uid);
    loadAddresses();
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;
    await customerRepository.setDefaultAddress(addressId, user.uid);
    loadAddresses();
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const addressToSave: CustomerAddress = {
      id: editingAddress ? editingAddress.id : `addr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
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
      createdAt: editingAddress ? editingAddress.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await customerRepository.saveAddress(addressToSave);

    setModalOpen(false);
    loadAddresses();
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#166534] text-xs font-bold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-[#2B5F4A]" /> Libreta de Direcciones & Despacho
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
              Direcciones de Envío Guardadas
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              Administra tus destinos de entrega para agilizar el pago y cálculo automático de envíos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase text-xs tracking-wider transition flex items-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" /> Agregar Dirección
          </button>
        </div>

        {/* Address Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl">
            Cargando direcciones...
          </div>
        ) : addresses.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 rounded-2xl bg-white space-y-3 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-950">No hay direcciones guardadas</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Agrega una dirección de entrega para completar tus pedidos en un solo clic.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
            >
              Agregar Primera Dirección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 rounded-2xl border bg-white space-y-3 flex flex-col justify-between shadow-xs transition ${
                  addr.isDefault ? "border-[#2B5F4A] ring-1 ring-[#2B5F4A]/20" : "border-gray-200"
                }`}
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-950 text-sm">
                      {addr.firstName} {addr.lastName}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] text-[10px] font-bold uppercase tracking-wider">
                        Principal
                      </span>
                    )}
                  </div>

                  {addr.company && (
                    <div className="text-xs font-semibold text-[#2B5F4A]">{addr.company}</div>
                  )}

                  <div className="text-gray-600 leading-relaxed font-light pt-1">
                    <div>{addr.line1}</div>
                    {addr.line2 && <div>{addr.line2}</div>}
                    <div>{addr.city}, {addr.state} {addr.postalCode}</div>
                    <div className="text-gray-400 text-[11px]">{addr.country}</div>
                  </div>

                  {addr.phone && (
                    <div className="text-[11px] text-gray-500 font-mono pt-1">
                      Tel: {addr.phone}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] text-[#2B5F4A] hover:underline font-semibold"
                    >
                      Establecer como principal
                    </button>
                  ) : <span />}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(addr)}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-gray-950 transition"
                      title="Editar dirección"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 transition"
                      title="Eliminar dirección"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ━━━━ MODAL EDIT / ADD ADDRESS ━━━━ */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-950">
                  {editingAddress ? "Editar Dirección" : "Nueva Dirección de Envío"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Nombre</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Apellido</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Compañía / Marca (Opcional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Dirección (Calle y Número)</label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="123 Industrial Parkway"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Apt, Suite, Unidad (Opcional)</label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Suite 400"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Ciudad</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Estado</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="FL"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Código Postal</label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="33122"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Teléfono de Entrega</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-[#2B5F4A] focus:ring-[#2B5F4A]"
                  />
                  <label htmlFor="isDefault" className="text-gray-700 font-medium text-xs">
                    Establecer como dirección principal de envío
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
                  >
                    Guardar Dirección
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
