"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShoppingBag, 
  Layers, 
  Sparkles, 
  FlaskConical, 
  Box, 
  Droplet, 
  Search, 
  Shield,
  Menu,
  X,
  User,
  PackageCheck
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const MAIN_NAVIGATION = [
  { name: "Shop", href: "/shop", icon: Layers },
  { name: "Fragrance Oils", href: "/fragrance", icon: Droplet },
  { name: "Perfume Making", href: "/perfume-making", icon: Sparkles },
  { name: "Packaging", href: "/packaging", icon: Box },
  { name: "Testing", href: "/testing", icon: FlaskConical },
  { name: "Custom Labels", href: "/custom-labels", icon: TagIcon, highlight: true },
];

function TagIcon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-lab-800/80 bg-lab-950/90 backdrop-blur-md">
      {/* Top Notification Bar */}
      <div className="bg-lab-900 border-b border-lab-800 text-[11px] py-1 px-4 text-lab-400 flex justify-between items-center tracking-wide font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SCENTLAB DIRECT FRACTIONING & FORMULATION SUPPLY</span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-lab-300">
          <span>VOLUME PRICING ENABLED</span>
          <span className="text-lab-600">•</span>
          <span>DISPATCH FROM US WAREHOUSE</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lab-800 to-lab-900 border border-lab-700 flex items-center justify-center text-amber-400 group-hover:border-amber-500/50 transition shadow">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-1.5">
                SCENTLAB
                <span className="text-[10px] uppercase px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-normal tracking-widest">
                  PRO
                </span>
              </span>
              <span className="text-[9px] text-lab-400 tracking-wider uppercase font-mono">
                Fragrance Supplies
              </span>
            </div>
          </Link>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 font-mono">
            {MAIN_NAVIGATION.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-lab-800 text-white border border-lab-700"
                      : item.highlight
                      ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                      : "text-lab-300 hover:text-white hover:bg-lab-900"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? "text-amber-400" : "text-lab-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="p-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white hover:border-lab-700 transition"
              title="Search Catalog"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Customer Account */}
            <Link
              href="/account"
              className="p-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white hover:border-lab-700 transition"
              title="Customer Account"
              aria-label="Customer Account"
            >
              <User className="w-4 h-4" />
            </Link>

            {/* Discreet Shield Icon (Admin Access) */}
            <Link
              href="/admin/login"
              className="p-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-500 hover:text-amber-400 hover:border-amber-500/40 transition group"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <Shield className="w-4 h-4 transition-transform group-hover:scale-105" />
            </Link>

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white hover:border-lab-700 transition"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-lab-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-lab-800 bg-lab-950 px-4 pt-2 pb-6 space-y-2 font-mono">
          {MAIN_NAVIGATION.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold ${
                  isActive ? "bg-lab-800 text-white" : "text-lab-300 hover:bg-lab-900"
                }`}
              >
                <Icon className="w-4 h-4 text-amber-400" />
                {item.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-lab-900 space-y-1">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs text-lab-400 hover:text-white"
            >
              <Search className="w-4 h-4" /> Search Catalog
            </Link>
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs text-lab-400 hover:text-white"
            >
              <User className="w-4 h-4" /> Customer Account
            </Link>
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-xs text-amber-400/80 hover:text-amber-400"
            >
              <Shield className="w-4 h-4" /> Admin Secure Access
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
