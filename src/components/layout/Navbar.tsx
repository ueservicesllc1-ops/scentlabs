"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User, 
  Sparkles,
  Droplet,
  Box,
  FlaskConical,
  Tag,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const MAIN_NAVIGATION = [
  { name: "All Products", href: "/shop", icon: Layers },
  { name: "Fragrance Oils", href: "/fragrance", icon: Droplet },
  { name: "Perfume Making", href: "/perfume-making", icon: Sparkles },
  { name: "Glassware & Bottles", href: "/bottles", icon: FlaskConical },
  { name: "Packaging & Boxes", href: "/packaging", icon: Box },
  { name: "Custom Labels", href: "/custom-labels", icon: Tag, highlight: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#eae6df] shadow-sm">
      {/* Top Banner */}
      <div className="bg-[#1c1917] text-white text-[11px] py-1.5 px-4 flex justify-between items-center tracking-wider">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-medium text-stone-200">
              COMMERCIAL GRADE PERFUMERY &bull; PURE OILS &bull; FRACTIONED WHOLESALE
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-stone-400 text-[10px] uppercase font-medium">
            <span>Volume Tier Discounts Active</span>
            <span>&bull;</span>
            <span>Same-Day US Dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#fbf9f4] border border-[#e5dfd5] flex items-center justify-center text-amber-700 shadow-sm group-hover:border-amber-600 transition">
              <FlaskConical className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-[0.15em] text-[#1c1917] uppercase">
                SCENTLAB
              </span>
              <span className="text-[9px] text-[#8c827a] tracking-[0.25em] uppercase -mt-0.5">
                Formulation &bull; Atelier
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrance oils, amber bottles, perfumer base..."
              className="w-full text-xs pl-10 pr-4 py-2 bg-[#f6f5f0] border border-[#e5e0d8] rounded-full text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-all"
            />
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Account Link */}
            <Link
              href={user ? "/account" : "/account/profile"}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-amber-800 rounded-full hover:bg-stone-100 transition"
            >
              <User className="w-4 h-4 text-stone-600" />
              <span>{user ? "My Account" : "Sign In"}</span>
            </Link>

            {/* Shopping Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-[#fbf9f4] border border-[#e5dfd5] text-stone-800 hover:border-amber-600 hover:bg-white transition flex items-center gap-2 shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5 text-stone-800 stroke-[1.75]" />
              {itemCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-700 text-white text-[11px] font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-700 hover:bg-stone-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Category Menu (Desktop) */}
        <nav className="hidden lg:flex items-center justify-between border-t border-[#f0ece5] py-2.5 text-xs font-medium text-stone-700">
          <div className="flex items-center gap-6">
            {MAIN_NAVIGATION.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1 tracking-wide transition flex items-center gap-1.5 ${
                    isActive
                      ? "text-amber-800 font-bold border-b-2 border-amber-700"
                      : item.highlight
                      ? "text-amber-700 hover:text-amber-900 font-semibold"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {item.name}
                  {item.highlight && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                      Custom
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <Link
            href="/admin"
            className="text-[11px] font-semibold text-stone-500 hover:text-amber-800 flex items-center gap-1"
          >
            <Shield className="w-3 h-3 text-amber-600" /> Admin Portal
          </Link>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-[#eae6df] px-4 py-6 space-y-4 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full text-xs pl-10 pr-4 py-2.5 bg-[#f6f5f0] border border-[#e5e0d8] rounded-xl text-stone-800"
            />
          </form>

          <div className="space-y-1">
            {MAIN_NAVIGATION.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-medium text-stone-800 hover:bg-[#f6f5f0]"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-amber-700" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#eae6df] space-y-2">
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-xl border border-[#d6d0c4] text-xs font-bold text-stone-800"
            >
              My Customer Account
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
