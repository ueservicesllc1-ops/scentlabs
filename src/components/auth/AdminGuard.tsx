"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldAlert, 
  ShieldCheck, 
  LogOut, 
  SlidersHorizontal, 
  Package, 
  Tag, 
  Layers, 
  DollarSign, 
  Droplet,
  Box,
  FlaskConical,
  Sparkles,
  Truck,
  Building2,
  Mail,
  ExternalLink 
} from "lucide-react";

const AUTHORIZED_ADMIN_EMAIL = "ueservicesllc1@gmail.com";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    // If on the login page itself, do not block
    if (pathname === "/admin/login") {
      setSessionVerified(true);
      return;
    }

    const checkServerSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session");
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated && data.adminEmail?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
            setSessionVerified(true);
            setAdminEmail(data.adminEmail);
            return;
          }
        }
        // Not authenticated with valid PIN session
        setSessionVerified(false);
        router.push("/admin/login");
      } catch {
        setSessionVerified(false);
        router.push("/admin/login");
      }
    };

    checkServerSession();
  }, [pathname, router, user]);

  const handleAdminLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      await logout();
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  // Loading state
  if (sessionVerified === null) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-xs text-lab-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span className="uppercase tracking-widest text-[11px] text-amber-400">
            Validating 2FA Admin Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Not authorized
  if (sessionVerified === false) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-2xl border border-red-900/40 bg-lab-950 text-center space-y-4 font-mono">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white uppercase">403 — Access Denied</h2>
        <p className="text-xs text-lab-400 leading-relaxed">
          Administrator session is missing or has expired. Please authenticate via the secure portal.
        </p>
        <div className="pt-2">
          <Link
            href="/admin/login"
            className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold uppercase bg-amber-500 text-lab-950 hover:brightness-110 shadow"
          >
            Admin Login
          </Link>
        </div>
      </div>
    );
  }

  // Authorized Admin View
  return (
    <div className="space-y-6">
      {/* Top Admin Status Header */}
      <div className="bg-lab-950 border-b border-lab-800/80 px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-mono flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2 text-lab-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-white font-bold uppercase tracking-wider">SCENTLAB ADMIN</span>
          <span className="text-lab-600">•</span>
          <span className="text-lab-400">
            Admin: <strong className="text-amber-400 font-bold">{adminEmail || AUTHORIZED_ADMIN_EMAIL}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/admin"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname === "/admin" ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" /> Products & Catalog
          </Link>

          <Link
            href="/admin/products"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/products") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Package className="w-3 h-3 text-amber-400" /> Products
          </Link>

          <Link
            href="/admin/fragrance"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/fragrance") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Droplet className="w-3 h-3 text-amber-400" /> Fragrance Oils
          </Link>

          <Link
            href="/admin/perfume-making"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/perfume-making") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" /> Perfume Making
          </Link>

          <Link
            href="/admin/inventory"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/inventory") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Layers className="w-3 h-3 text-amber-400" /> Inventory
          </Link>

          <Link
            href="/admin/purchases"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/purchases") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Package className="w-3 h-3 text-amber-400" /> Purchases
          </Link>

          <Link
            href="/admin/suppliers"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/suppliers") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Building2 className="w-3 h-3 text-amber-400" /> Suppliers
          </Link>

          <Link
            href="/admin/orders"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname === "/admin/orders" ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Package className="w-3 h-3" /> Orders
          </Link>

          <Link
            href="/admin/emails"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/emails") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Mail className="w-3 h-3 text-amber-400" /> Emails
          </Link>

          <Link
            href="/admin/packaging"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/packaging") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Box className="w-3 h-3 text-amber-400" /> Packaging & Boxes
          </Link>

          <Link
            href="/admin/testing"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/testing") ? "text-indigo-400 font-bold" : "text-lab-400"
            }`}
          >
            <FlaskConical className="w-3 h-3 text-indigo-400" /> Testing Supplies
          </Link>

          <Link
            href="/admin/custom-labels"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/custom-labels") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Tag className="w-3 h-3" /> Custom Labels
          </Link>

          <Link
            href="/admin/settings/shipping"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/settings/shipping") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <Truck className="w-3 h-3 text-amber-400" /> Shipping Origin
          </Link>

          <Link
            href="/admin/settings/integrations"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname.includes("/admin/settings/integrations") ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Integrations
          </Link>

          <Link
            href="/admin/audit-logs"
            className={`hover:text-white transition flex items-center gap-1 ${
              pathname === "/admin/audit-logs" ? "text-amber-400 font-bold" : "text-lab-400"
            }`}
          >
            <ShieldCheck className="w-3 h-3" /> Audit Logs
          </Link>

          <button
            onClick={handleAdminLogout}
            className="px-2.5 py-1 rounded bg-lab-900 border border-lab-700 text-lab-400 hover:text-red-400 hover:border-red-500/40 transition flex items-center gap-1 text-[11px]"
          >
            <LogOut className="w-3 h-3" /> Logout
          </button>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

export default AdminGuard;
