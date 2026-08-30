"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Search, ShoppingBag, User, Menu, X, Shield, Globe } from "lucide-react";
import { AdminPinModal } from "@/components/auth/AdminPinModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { name: t.nav.kits, href: "/kits" },
    { name: t.nav.fragrances, href: "/fragrance" },
    { name: t.nav.perfumes, href: "/perfumes" },
    { name: t.nav.bottles, href: "/bottles" },
    { name: t.nav.packaging, href: "/packaging" },
    { name: t.nav.labels, href: "/custom-labels" },
    { name: t.nav.tutorial, href: "/tutorial" },
    { name: t.nav.catalog, href: "/shop" },
  ];

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div className="bg-[#2B5F4A] text-white/95 py-1.5 px-3 sm:px-4 text-center">
        <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.12em] sm:tracking-[0.2em] uppercase m-0 line-clamp-1">
          {t.common.announcement}
        </p>
      </div>

      {/* ── Main Top Navbar ── */}
      <header className="bg-white/98 backdrop-blur-md sticky top-0 z-50 border-b border-[#EEEEEE]">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 gap-3 sm:gap-5">
          
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center no-underline shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=12"
              alt="SCENTLABS Supply"
              className="h-10 sm:h-12 w-auto object-contain block"
            />
          </Link>
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 flex-nowrap whitespace-nowrap">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: isActive ? "#2B5F4A" : "#666666",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #2B5F4A" : "2px solid transparent",
                    paddingBottom: "3px",
                    whiteSpace: "nowrap",
                    transition: "color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.target as HTMLElement).style.color = "#111111";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.target as HTMLElement).style.color = "#666666";
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions: Language Switch, Search, Account, Cart */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-gray-100/90 rounded-full p-0.5 border border-gray-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setLanguage("es")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                  language === "es"
                    ? "bg-[#2B5F4A] text-white shadow-xs"
                    : "text-gray-600 hover:text-black"
                }`}
                aria-label="Cambiar a Español"
              >
                ES
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-all ${
                  language === "en"
                    ? "bg-[#2B5F4A] text-white shadow-xs"
                    : "text-gray-600 hover:text-black"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
            </div>

            {/* Search Button */}
            <button
              type="button"
              aria-label={t.common.search}
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-700 hover:text-black transition"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Admin Shield Access */}
            <button
              type="button"
              aria-label="Admin Shield Access"
              title={t.common.adminPin}
              onClick={() => setAdminPinModalOpen(true)}
              className="p-2 text-[#2B5F4A] hover:opacity-80 transition"
            >
              <Shield className="w-[18px] h-[18px]" />
            </button>

            {/* Customer Account */}
            <Link
              href="/account"
              aria-label={t.common.account}
              className="p-2 text-gray-700 hover:text-black transition"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              aria-label={t.common.cart}
              className="p-2 text-gray-700 hover:text-black relative inline-flex items-center transition"
            >
              <ShoppingBag className="w-[18px] h-[18px]" />
              {itemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 0,
                    background: "#2B5F4A",
                    color: "white",
                    fontSize: "9px",
                    fontWeight: 700,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-800 hover:text-black transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="border-t border-[#EEEEEE] bg-[#FAFAFA] px-4 py-3 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.common.searchPlaceholder}
                  className="w-full text-xs pl-9 pr-8 py-2 bg-white border border-gray-300 text-gray-900 rounded-md outline-none focus:border-[#2B5F4A]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2.5 p-1 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EEEEEE] bg-white px-5 py-4 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {/* Language Selection Row in Mobile Drawer */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#2B5F4A]" /> {t.common.language}
              </span>
              <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setLanguage("es")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    language === "es" ? "bg-[#2B5F4A] text-white shadow-xs" : "text-gray-600 hover:text-black"
                  }`}
                >
                  Español
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                    language === "en" ? "bg-[#2B5F4A] text-white shadow-xs" : "text-gray-600 hover:text-black"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wider py-3 border-b border-gray-100 ${
                      isActive ? "text-[#2B5F4A] font-bold" : "text-gray-800 hover:text-black"
                    }`}
                  >
                    <span>{link.name}</span>
                    <span className="text-gray-400 text-sm">›</span>
                  </Link>
                );
              })}
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2B5F4A] py-3.5 pt-4"
              >
                <span>{t.common.myAccount}</span>
                <span>›</span>
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Admin Quick PIN Access Modal */}
      <AdminPinModal
        isOpen={adminPinModalOpen}
        onClose={() => setAdminPinModalOpen(false)}
      />
    </>
  );
}
