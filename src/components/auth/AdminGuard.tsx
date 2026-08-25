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
  Droplet,
  Box,
  FlaskConical,
  Sparkles,
  Truck,
  Building2,
  Mail,
  ExternalLink,
  Menu,
  X,
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  FileText,
  MessageSquare
} from "lucide-react";

const AUTHORIZED_ADMIN_EMAIL = "ueservicesllc1@gmail.com";

interface NavGroup {
  label: string;
  items: {
    title: string;
    href: string;
    icon: React.ElementType;
    exact?: boolean;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { title: "Operations Hub", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "All Products", href: "/admin/products", icon: Package },
      { title: "Fragrance Oils", href: "/admin/fragrance", icon: Droplet },
      { title: "Packaging & Boxes", href: "/admin/packaging", icon: Box },
      { title: "Custom Labels", href: "/admin/custom-labels", icon: Tag, exact: true },
      { title: "Testing Supplies", href: "/admin/testing", icon: FlaskConical },
      { title: "Perfume Making", href: "/admin/perfume-making", icon: Sparkles },
    ],
  },
  {
    label: "Inventory & Supply",
    items: [
      { title: "Stock Inventory", href: "/admin/inventory", icon: Layers, exact: true },
      { title: "Notas de Entrada", href: "/admin/inbound-notes", icon: FileText },
      { title: "Low Stock Audit", href: "/admin/inventory/audit", icon: AlertTriangle },
      { title: "Purchases", href: "/admin/purchases", icon: Package },
      { title: "Suppliers", href: "/admin/suppliers", icon: Building2 },
    ],
  },
  {
    label: "Orders & Live Support",
    items: [
      { title: "Live Chat & Soporte", href: "/admin/chat", icon: MessageSquare },
      { title: "Orders Management", href: "/admin/orders", icon: ShoppingCart },
      { title: "Shipping Origin", href: "/admin/settings/shipping", icon: Truck },
    ],
  },
  {
    label: "Marketing & System",
    items: [
      { title: "Label Pricing Matrix", href: "/admin/custom-labels/pricing", icon: DollarSign },
      { title: "Email System Logs", href: "/admin/emails", icon: Mail },
      { title: "API Integrations", href: "/admin/settings/integrations", icon: ShieldCheck },
      { title: "System Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
    ],
  },
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [sessionVerified, setSessionVerified] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Close mobile drawer upon navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center font-sans text-xs text-gray-600">
        <div className="flex flex-col items-center gap-3 p-8 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="w-8 h-8 rounded-full border-3 border-[#2B5F4A] border-t-transparent animate-spin" />
          <span className="uppercase tracking-wider font-semibold text-gray-900 text-xs">
            Validating Administrator Session...
          </span>
        </div>
      </div>
    );
  }

  // Not authorized
  if (sessionVerified === false) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full p-8 rounded-xl border border-red-200 bg-white text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">403 — Access Denied</h2>
          <p className="text-xs text-gray-600 leading-relaxed">
            Administrator session is missing or has expired. Please authenticate via the secure PIN portal.
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-block px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#2B5F4A] text-white hover:bg-[#1E4233] transition shadow-xs"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isNavActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  // Authorized Admin Layout
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-gray-900">
      
      {/* ━━━━ TOP ADMIN HEADER ━━━━ */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/admin" className="flex items-center gap-2 text-decoration-none">
              <span className="text-base font-black tracking-tight text-gray-950">SCENTLAB</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-800 border border-gray-300">
                ADMIN
              </span>
            </Link>
          </div>

          {/* User Status & Action Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-500 font-medium">Logged in:</span>
              <span className="font-semibold text-gray-900">{adminEmail || AUTHORIZED_ADMIN_EMAIL}</span>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-950 transition"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </Link>

            <button
              onClick={handleAdminLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:text-red-700 hover:border-red-300 hover:bg-red-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ━━━━ MAIN BODY: SIDEBAR + CONTENT ━━━━ */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
        
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] py-6 px-4">
          <nav className="space-y-6">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  {group.label}
                </span>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        active
                          ? "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0] shadow-xs"
                          : "text-gray-700 hover:text-gray-950 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#166534]" : "text-gray-400"}`} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-full bg-white h-full shadow-2xl flex flex-col py-6 px-4 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                <span className="text-sm font-bold text-gray-900">Admin Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-6">
                {NAV_GROUPS.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                      {group.label}
                    </span>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isNavActive(item.href, item.exact);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                            active
                              ? "bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]"
                              : "text-gray-700 hover:text-gray-950 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-[#166534]" : "text-gray-400"}`} />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10">
          {children}
        </main>

      </div>
    </div>
  );
}

export default AdminGuard;
