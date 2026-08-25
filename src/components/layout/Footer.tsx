"use client";

import React from "react";
import Link from "next/link";
import { VisitorCounter } from "./VisitorCounter";

const shopLinks = [
  { label: "🚀 Kits Emprendedor", href: "/kits" },
  { label: "Fragrance Oils", href: "/fragrance" },
  { label: "Glass Bottles", href: "/bottles" },
  { label: "Custom Labels", href: "/custom-labels" },
  { label: "Packaging", href: "/packaging" },
  { label: "Testing Supplies", href: "/testing" },
];

const companyLinks = [
  { label: "🧪 Tutorial & Calculadora", href: "/tutorial" },
  { label: "About SCENTLAB", href: "/about" },
  { label: "Wholesale Catalog", href: "/shop" },
  { label: "Account & Orders", href: "/account" },
  { label: "Admin Portal", href: "/admin/login" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="footer-link"
      style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 300, display: "block" }}
    >
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer style={{ background: "#0E1A14", color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
      <style>{`
        .footer-link { transition: color 0.15s; }
        .footer-link:hover { color: white !important; }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "56px 40px 32px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo2.png" alt="SCENTLAB Supply" style={{ height: 50, width: "auto", objectFit: "contain" }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.7, maxWidth: 280, color: "rgba(255,255,255,0.45)", margin: "0 0 24px" }}>
            Wholesale fragrance oils, clinical-grade packaging, and custom labels for artisan perfumers and growing brands.
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
            © {new Date().getFullYear()} ScentLabs Supply. All rights reserved.
          </p>
        </div>

        {/* Shop */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5EAB85", display: "block", marginBottom: 16 }}>Shop</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {shopLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

        {/* Company */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5EAB85", display: "block", marginBottom: 16 }}>Company</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {companyLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

        {/* Support */}
        <div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#5EAB85", display: "block", marginBottom: 16 }}>Support</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {supportLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

      </div>

      {/* Real Traffic Counter Section */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px 24px", display: "flex", justifyContent: "flex-start", alignItems: "center" }}>
        <VisitorCounter />
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "16px 40px", maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Wholesale Only · B2B Platform
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", margin: 0 }}>
          Secure Checkout · Shippo · Stripe
        </p>
      </div>
    </footer>
  );
}
