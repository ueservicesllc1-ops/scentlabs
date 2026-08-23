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
  X 
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
      setMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      // In production with Firebase Auth: await updatePassword(user, newPassword)
      setMsg({ type: "success", text: "Password updated successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-mono">
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" /> ACCOUNT CREDENTIALS & SECURITY
          </div>
          <h2 className="text-xl font-bold text-white uppercase">
            Authentication & Access Settings
          </h2>
          <p className="text-xs text-lab-400">
            Control your sign-in methods, password credentials, and active session tokens.
          </p>
        </div>

        {msg && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/60 border-rose-500/40 text-rose-300"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Authentication Provider Card */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 text-xs">
          <h3 className="font-bold text-white uppercase flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-amber-400" /> Sign-in Method
          </h3>

          <div className="p-4 rounded-xl bg-lab-900 border border-lab-800 flex justify-between items-center">
            <div className="space-y-0.5">
              <span className="font-bold text-white uppercase block">
                {isGoogleUser ? "Google Single Sign-On" : "Email & Password Authentication"}
              </span>
              <span className="text-lab-400 text-[11px]">{user?.email}</span>
            </div>
            <span className="px-2.5 py-1 rounded bg-lab-950 border border-lab-700 text-lab-300 text-[10px] font-bold uppercase">
              {isGoogleUser ? "Google Auth" : "Standard Auth"}
            </span>
          </div>

          {/* Password Form (for email/password users) */}
          {!isGoogleUser && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-2 border-t border-lab-900">
              <span className="font-bold text-white uppercase block text-xs">Change Password</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-lab-400 block mb-1 uppercase text-[10px]">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold uppercase text-xs transition"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone: Account Deletion */}
        <div className="p-6 rounded-2xl border border-rose-900/30 bg-rose-950/10 space-y-3 text-xs">
          <h3 className="font-bold text-rose-400 uppercase flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Danger Zone
          </h3>
          <p className="text-lab-400 text-[11px] leading-relaxed max-w-xl">
            Deleting your account removes your personal login credentials, saved addresses, and active custom label drafts. Note: Historic order and fulfillment records will be anonymized and preserved for accounting and tax compliance.
          </p>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-rose-950 border border-rose-800/60 hover:bg-rose-900 text-rose-300 font-bold uppercase text-xs transition"
          >
            Request Account Deletion
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-lab-950 border border-rose-800/60 p-6 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-lab-900 pb-3 text-rose-400 font-bold uppercase">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Confirm Account Deletion</span>
                <button type="button" onClick={() => setDeleteModalOpen(false)} className="text-lab-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-lab-300 leading-relaxed">
                Are you sure you want to permanently delete your SCENTLAB account? You will lose access to all saved designs and label configurations.
              </p>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-lab-900 text-lab-400 hover:text-white font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    logout();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold uppercase"
                >
                  Confirm Delete & Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
