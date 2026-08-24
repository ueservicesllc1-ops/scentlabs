"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, X, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPinModal({ isOpen, onClose }: AdminPinModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("ueservicesllc1@gmail.com");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError("");
      setSuccess(false);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError("");

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // If 4 digits entered, automatically submit
    if (index === 3 && value) {
      const fullPin = newPin.join("");
      if (fullPin.length === 4) {
        submitVerification(email, fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const submitVerification = async (adminEmail: string, fullPin: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail.trim(), pin: fullPin }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "PIN incorrecto o usuario no autorizado.");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.push("/admin");
      }, 700);
    } catch (err: any) {
      setError(err.message || "Error al verificar credenciales.");
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullPin = pin.join("");
    if (fullPin.length !== 4) {
      setError("Por favor ingresa los 4 dígitos del PIN.");
      return;
    }
    submitVerification(email, fullPin);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden font-sans">
        
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#1E4233] to-[#2B5F4A] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="absolute top-4 right-4 text-white/70 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-inner">
            <Shield className="w-6 h-6 text-emerald-300" />
          </div>
          
          <h2 className="text-lg font-bold tracking-tight">Acceso Administrador</h2>
          <p className="text-xs text-emerald-100/80 mt-0.5">SCENTLAB Master Control</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* User / Email verification */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Usuario Autorizado
            </label>
            <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 font-medium">
              <span className="truncate">{email}</span>
            </div>
          </div>

          {/* PIN Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex justify-between items-center">
              <span>PIN de Seguridad (4 dígitos)</span>
              <Lock className="w-3 h-3 text-gray-400" />
            </label>

            <div className="flex justify-between gap-2.5">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  ref={inputRefs[idx]}
                  type="password"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  disabled={loading || success}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2B5F4A] focus:border-transparent transition shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-shake">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Acceso autorizado. Redirigiendo...</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success || pin.join("").length < 4}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white flex items-center justify-center gap-2 shadow-sm transition ${
              loading || success || pin.join("").length < 4
                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                : "bg-[#2B5F4A] hover:bg-[#1E4233] active:scale-[0.99]"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verificando...
              </span>
            ) : success ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Autorizado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Entrar al Admin <ArrowRight className="w-3.5 h-3.5" />
              </span>
            )}
          </button>
        </form>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-[10px] text-gray-400">
            Acceso restringido · Uso exclusivo de administración
          </p>
        </div>
      </div>
    </div>
  );
}
