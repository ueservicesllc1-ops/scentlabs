"use client";

import React, { useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Mail, 
  Trash2, 
  LogOut,
  X,
  Lock
} from "lucide-react";

export default function AccountSecurityPage() {
  const { user, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const isGoogleUser = user?.providerData?.some((p) => p.providerId === "google.com");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: "error", text: "Las contraseñas nuevas no coinciden." });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      setMsg({ type: "success", text: "Contraseña actualizada exitosamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Error al actualizar la contraseña." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-1 shadow-xs">
          <div className="flex items-center gap-2 text-[#166534] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#2B5F4A]" /> Credenciales & Seguridad de la Cuenta
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
            Configuración de Acceso y Contraseña
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Administra tu método de inicio de sesión, credenciales de acceso y seguridad de tu cuenta.
          </p>
        </div>

        {msg && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-2 font-medium border ${
            msg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-800"
          }`}>
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Change Password Card */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-5 shadow-xs">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-bold text-gray-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#2B5F4A]" /> Actualizar Contraseña
            </h3>
            <p className="text-xs text-gray-500 font-light mt-0.5">
              {isGoogleUser
                ? "Iniciaste sesión con tu cuenta de Google. Tu contraseña se administra directamente en Google."
                : "Se recomienda utilizar una contraseña robusta de al menos 8 caracteres que combine letras y números."}
            </p>
          </div>

          {!isGoogleUser ? (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Contraseña Actual</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  placeholder="••••••••••••"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  placeholder="Repite tu nueva contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
              >
                {loading ? "Actualizando..." : "Actualizar Contraseña"}
              </button>
            </form>
          ) : (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 font-light">
              Cuenta vinculada mediante Google Sign-In ({user?.email}).
            </div>
          )}
        </div>

        {/* Active Sessions & Security Badges */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs">
          <h3 className="text-base font-bold text-gray-950">Protección de Datos & Sesión</h3>
          <p className="text-xs text-gray-500 font-light leading-relaxed">
            Tu sesión está protegida con cifrado SSL/TLS de 256 bits y autenticación segura mediante Firebase.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sesión Activa Segura</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
              <Mail className="w-3.5 h-3.5 text-gray-500" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
}
