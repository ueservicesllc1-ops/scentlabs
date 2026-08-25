"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Search, ShoppingBag, User, Menu, X, Shield } from "lucide-react";
import { AdminPinModal } from "@/components/auth/AdminPinModal";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { user } = useAuth();
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
    { name: "Kits Emprendedor", href: "/kits" },
    { name: "Tutorial & Calculadora", href: "/tutorial" },
    { name: "Fragrances", href: "/fragrance" },
    { name: "Perfumes", href: "/perfumes" },
    { name: "Packaging & Boxes", href: "/packaging" },
    { name: "Bottles", href: "/bottles" },
    { name: "Custom Labels", href: "/custom-labels" },
    { name: "Supplies", href: "/testing" },
    { name: "Catalog", href: "/shop" },
  ];

  return (
    <>
      {/* ── Top Announcement Bar ── */}
      <div style={{ background: "#2B5F4A", color: "rgba(255,255,255,0.95)", padding: "7px 16px", textAlign: "center" }}>
        <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          Free Shipping on Orders Over $250 &nbsp;·&nbsp; Wholesale Perfume Compounding & Supplies
        </span>
      </div>

      {/* ── Main Top Navbar ── */}
      <header style={{ background: "rgba(255,255,255,0.98)", backdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 50, borderBottom: "1px solid #EEEEEE" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1280px", margin: "0 auto", padding: "8px 24px" }}>
          
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            className="shrink-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png?v=10"
              alt="Logo"
              style={{ height: "40px", width: "auto", objectFit: "contain" }}
            />
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  style={{
                    fontSize: "11px",
                    fontWeight: isActive ? 700 : 500,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: isActive ? "#2B5F4A" : "#666666",
                    textDecoration: "none",
                    borderBottom: isActive ? "2px solid #2B5F4A" : "2px solid transparent",
                    paddingBottom: "3px",
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

          {/* Actions: Search, Account, Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            {/* Search Button */}
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#333333", padding: "4px" }}
            >
              <Search style={{ width: 18, height: 18 }} />
            </button>

            {/* Admin Shield Access */}
            <button
              type="button"
              aria-label="Admin Shield Access"
              title="Panel de Administración (PIN 1619)"
              onClick={() => setAdminPinModalOpen(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#2B5F4A", padding: "4px", display: "inline-flex", alignItems: "center" }}
              className="hover:opacity-80 transition"
            >
              <Shield style={{ width: 18, height: 18 }} />
            </button>

            {/* Customer Account */}
            <Link
              href="/account"
              aria-label="Customer Account"
              style={{ color: "#333333", padding: "4px", display: "inline-flex" }}
            >
              <User style={{ width: 18, height: 18 }} />
            </Link>

            {/* Shopping Cart */}
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              style={{ color: "#333333", padding: "4px", position: "relative", display: "inline-flex", alignItems: "center" }}
            >
              <ShoppingBag style={{ width: 18, height: 18 }} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
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
              className="md:hidden"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#333333", padding: "4px" }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X style={{ width: 22, height: 22 }} /> : <Menu style={{ width: 22, height: 22 }} />}
            </button>
          </div>

        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div style={{ borderTop: "1px solid #EEEEEE", background: "#FAFAFA", padding: "12px 24px" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
              <form onSubmit={handleSearchSubmit} style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search style={{ position: "absolute", left: 12, width: 16, height: 16, color: "#888888" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search fragrance oils, glass bottles, packaging boxes, custom labels..."
                  style={{
                    width: "100%",
                    fontSize: "12px",
                    padding: "9px 36px 9px 36px",
                    background: "white",
                    border: "1px solid #DDDDDD",
                    color: "#111111",
                    outline: "none",
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", color: "#888888" }}
                >
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{ borderTop: "1px solid #EEEEEE", background: "white", padding: "20px 24px" }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#222222",
                    padding: "8px 0",
                    textDecoration: "none",
                    borderBottom: "1px solid #F0F0F0",
                  }}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#2B5F4A",
                  padding: "8px 0",
                  textDecoration: "none",
                }}
              >
                Mi Cuenta / Portal
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
