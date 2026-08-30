"use client";

import React from "react";
import Link from "next/link";
import { VisitorCounter } from "./VisitorCounter";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  const shopLinks = [
    { label: t.footer.kitsTitle, href: "/kits" },
    { label: t.footer.allFragrances, href: "/fragrance" },
    { label: t.footer.glassBottles, href: "/bottles" },
    { label: t.footer.customLabels, href: "/custom-labels" },
    { label: t.footer.customBoxes, href: "/packaging" },
  ];

  const companyLinks = [
    { label: t.footer.tutorialTitle, href: "/tutorial" },
    { label: t.common.myAccount, href: "/account" },
    { label: t.nav.catalog, href: "/shop" },
    { label: "Admin Portal", href: "/admin/login" },
  ];

  const supportLinks = [
    { label: t.footer.contactSupport, href: "/contact" },
    { label: t.footer.shippingInfo, href: "/shipping" },
    { label: t.footer.termsConditions, href: "/terms" },
    { label: t.footer.privacyPolicy, href: "/privacy" },
  ];

  return (
    <footer className="bg-[#0E1A14] text-white/60 font-sans border-t border-white/10">
      <style>{`
        .footer-link { transition: color 0.15s; }
        .footer-link:hover { color: white !important; }
      `}</style>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

        {/* Brand */}
        <div className="sm:col-span-2">
          <div className="mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo2.png" alt="SCENTLAB Supply" className="h-10 sm:h-12 w-auto object-contain" />
          </div>
          <p className="text-xs font-light leading-relaxed max-w-sm text-white/50 mb-6">
            {t.footer.brandTagline}
          </p>
          <p className="text-[11px] text-white/30">
            © {new Date().getFullYear()} ScentLabs Supply. {t.footer.allRightsReserved}
          </p>
        </div>

        {/* Shop */}
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5EAB85] block mb-3.5">{t.footer.catalogCol}</span>
          <div className="flex flex-col gap-2.5">
            {shopLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

        {/* Company */}
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5EAB85] block mb-3.5">{t.footer.companyCol}</span>
          <div className="flex flex-col gap-2.5">
            {companyLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

        {/* Support */}
        <div>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#5EAB85] block mb-3.5">{t.footer.supportCol}</span>
          <div className="flex flex-col gap-2.5">
            {supportLinks.map((l) => <FooterLink key={l.href} {...l} />)}
          </div>
        </div>

      </div>

      {/* Real Traffic Counter Section */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-6 flex justify-start items-center">
        <VisitorCounter />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 px-5 sm:px-8 lg:px-12 py-4 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-[10px] text-white/30 m-0 tracking-wider uppercase">
          Wholesale Only · B2B Platform
        </p>
        <p className="text-[10px] text-white/30 m-0">
          Secure Checkout · Shippo · Stripe
        </p>
      </div>
    </footer>
  );
}
