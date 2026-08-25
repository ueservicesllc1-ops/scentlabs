"use client";

import React, { useEffect, useState } from "react";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { customerRepository } from "@/lib/firestore/customer";
import { Customer } from "@/types/customer";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  ShieldCheck 
} from "lucide-react";

export default function AccountProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Customer | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      customerRepository.getProfile(user.uid).then((prof) => {
        if (prof) {
          setProfile(prof);
          setFirstName(prof.firstName || "");
          setLastName(prof.lastName || "");
          setPhone(prof.phone || "");
          setBusinessName(prof.businessName || "");
          setPhotoUrl(prof.photoUrl || "");
        } else {
          // Initialize profile
          const newProf: Customer = {
            id: user.uid,
            firebaseUid: user.uid,
            email: user.email || "",
            role: "customer",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setProfile(newProf);
        }
        setLoading(false);
      });
    }
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `customers/${user.uid}/profile`);

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setPhotoUrl(data.url || URL.createObjectURL(file));
      }
    } catch (err) {
      console.error("Failed to upload profile photo", err);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    const updated: Customer = {
      ...profile,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`.trim(),
      phone,
      businessName,
      photoUrl,
      updatedAt: new Date().toISOString(),
    };

    await customerRepository.saveProfile(updated);
    setProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSendVerification = async () => {
    setVerificationSent(true);
    setTimeout(() => setVerificationSent(false), 4000);
  };

  return (
    <AccountLayout>
      <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-6 font-sans shadow-xs">
        
        <div className="border-b border-gray-100 pb-4">
          <div className="flex items-center gap-2 text-[#166534] text-xs font-bold uppercase tracking-wider">
            <User className="w-4 h-4 text-[#2B5F4A]" /> Perfil del Cliente & Marca
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight mt-1">
            Información Personal y del Estudio
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Gestiona tus datos de contacto, nombre de marca comercial y configuración de cuenta.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Perfil actualizado exitosamente.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          
          {/* Avatar / Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative shadow-2xs">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-gray-400" />
              )}
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-gray-700 mb-1">Foto de Perfil</span>
              <label className="cursor-pointer px-3.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold text-xs transition inline-flex items-center gap-1.5 shadow-2xs">
                <UploadCloud className="w-3.5 h-3.5 text-[#2B5F4A]" />
                {uploadingPhoto ? "Subiendo..." : "Cambiar Foto"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
          </div>

          {/* Grid fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Teléfono de Contacto</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Nombre de Marca o Estudio</label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: Noir Fragrances Lab"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Email Verification Box */}
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Correo Electrónico de la Cuenta</span>
                <span className="font-semibold text-gray-900 text-xs">{user?.email}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autenticado</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Cambios</span>
          </button>
        </form>

      </div>
    </AccountLayout>
  );
}
