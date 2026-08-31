"use client";

import React, { useEffect, useState } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminQuickNav } from "@/components/admin/AdminQuickNav";
import { customerRepository } from "@/lib/firestore/customer";
import { Customer } from "@/types/customer";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  UserCheck,
  RefreshCw,
  ExternalLink
} from "lucide-react";

export default function AdminUsersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await customerRepository.getAllCustomers();
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = customers.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
    return (
      fullName.includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.company && user.company.toLowerCase().includes(q)) ||
      user.id.toLowerCase().includes(q)
    );
  });

  return (
    <AdminGuard>
      <div className="space-y-6 font-sans">
        
        {/* Quick Nav Header */}
        <AdminQuickNav />

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Registro de Usuarios & Portal Mayorista
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Usuarios Registrados ({customers.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Listado completo de clientes registrados, cuentas mayoristas y perfiles almacenados en Firestore.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 rounded-2xl border border-gray-200 bg-white shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, correo, empresa o ID..."
              className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <div className="text-xs text-gray-500">
            Mostrando <strong className="text-gray-950 font-bold">{filteredUsers.length}</strong> usuarios
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#2B5F4A] border-t-transparent animate-spin mx-auto" />
              <p>Cargando lista de usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <UserCheck className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-900">No se encontraron usuarios registrados</p>
              <p className="text-gray-500 text-[11px]">Intenta realizar una nueva búsqueda o registrar usuarios desde la tienda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                    <th className="py-3.5 px-4">Usuario / Nombre</th>
                    <th className="py-3.5 px-4">Correo Electrónico</th>
                    <th className="py-3.5 px-4">Empresa / Negocio</th>
                    <th className="py-3.5 px-4">Teléfono</th>
                    <th className="py-3.5 px-4">Fecha de Registro</th>
                    <th className="py-3.5 px-4 text-right">ID de Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => {
                    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Cliente Registrado";
                    const formattedDate = user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Reciente";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition">
                        {/* Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#2B5F4A]/10 text-[#2B5F4A] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {user.firstName ? user.firstName[0] : user.email[0]}
                            </div>
                            <div>
                              <div className="font-bold text-gray-950">{fullName}</div>
                              <div className="text-[10px] text-emerald-700 font-medium inline-flex items-center gap-1 mt-0.5">
                                <ShieldCheck className="w-3 h-3" /> Verificado
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4">
                          <a
                            href={`mailto:${user.email}`}
                            className="font-medium text-gray-900 hover:text-[#2B5F4A] inline-flex items-center gap-1.5 transition"
                          >
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span>{user.email}</span>
                          </a>
                        </td>

                        {/* Company */}
                        <td className="py-3.5 px-4 text-gray-700">
                          {user.company ? (
                            <span className="inline-flex items-center gap-1 font-medium text-gray-900">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              {user.company}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">Particular</span>
                          )}
                        </td>

                        {/* Phone */}
                        <td className="py-3.5 px-4 text-gray-600">
                          {user.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {user.phone}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-gray-600">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {formattedDate}
                          </span>
                        </td>

                        {/* User ID */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-mono text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                            {user.id}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminGuard>
  );
}
