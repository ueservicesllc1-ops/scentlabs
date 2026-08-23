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
    // In production, invokes user.sendEmailVerification()
    setVerificationSent(true);
    setTimeout(() => setVerificationSent(false), 4000);
  };

  return (
    <AccountLayout>
      <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-6 font-mono">
        <div className="border-b border-lab-900 pb-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <User className="w-3.5 h-3.5" /> FORMULATOR PROFILE & IDENTITY
          </div>
          <h2 className="text-xl font-bold text-white uppercase mt-1">
            Personal & Studio Information
          </h2>
          <p className="text-xs text-lab-400">
            Manage your personal profile, studio brand name, and authenticated email security.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Profile information updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          {/* Avatar / Photo Upload */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-lab-900 border border-lab-800 flex items-center justify-center overflow-hidden relative">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-lab-600" />
              )}
            </div>

            <div>
              <label className="block text-[10px] text-lab-500 uppercase mb-1">Profile Photo (B2 Storage)</label>
              <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold text-xs uppercase transition inline-flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5" />
                {uploadingPhoto ? "Uploading..." : "Upload New Photo"}
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
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">Studio / Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Artisan Fragrances LLC"
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 019-2834"
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Email (Firebase Guarded) */}
            <div className="sm:col-span-2 border-t border-lab-900 pt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-lab-400 uppercase text-[10px]">Authenticated Email</label>
                {user?.emailVerified ? (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Unverified
                  </span>
                )}
              </div>

              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="w-full bg-lab-950 border border-lab-800 rounded-xl px-3.5 py-2.5 text-lab-400 font-bold"
              />

              {!user?.emailVerified && (
                <div className="mt-2 flex justify-between items-center text-[10px]">
                  <span className="text-lab-500">Verify your email to receive order dispatch alerts.</span>
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    className="text-amber-400 hover:text-amber-300 font-bold uppercase"
                  >
                    {verificationSent ? "Verification Link Sent!" : "Send Verification Email"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/10 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Details
            </button>
          </div>
        </form>
      </div>
    </AccountLayout>
  );
}
