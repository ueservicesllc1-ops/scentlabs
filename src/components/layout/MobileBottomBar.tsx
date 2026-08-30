"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, Package, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export function MobileBottomBar() {
  const pathname = usePathname();
  const { itemCount, setIsCartDrawerOpen } = useCart();
  const { t } = useLanguage();

  // Navigation items for the mobile bottom bar
  const navItems = [
    {
      label: t.bottomBar.home,
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: t.bottomBar.catalog,
      href: "/shop",
      icon: Package,
      isActive: pathname === "/shop" || pathname?.startsWith("/product") || pathname === "/bottles" || pathname === "/packaging",
    },
    {
      label: t.bottomBar.kits,
      href: "/kits",
      icon: Sparkles,
      isActive: pathname === "/kits",
      badge: t.bottomBar.promoBadge,
    },
    {
      label: t.bottomBar.fragrances,
      href: "/fragrance",
      icon: Search,
      isActive: pathname?.startsWith("/fragrance"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1 relative no-underline transition-colors ${
                item.isActive ? "text-[#2B5F4A]" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {item.badge && (
                <span className="absolute -top-1 right-1/2 translate-x-4 px-1 py-0.2 bg-[#C8963E] text-white text-[8px] font-bold rounded-full uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
              <Icon className={`w-5 h-5 transition-transform ${item.isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"}`} />
              <span className={`text-[10px] tracking-wide mt-1 font-medium ${item.isActive ? "font-bold text-[#2B5F4A]" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Cart Item - Opens Cart Drawer directly */}
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative text-gray-500 hover:text-gray-900 transition-colors ${
            itemCount > 0 ? "text-[#2B5F4A]" : ""
          }`}
          aria-label="Abrir carrito de compras"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#2B5F4A] text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-xs">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-wide mt-1 font-medium ${itemCount > 0 ? "font-bold text-[#2B5F4A]" : ""}`}>
            {t.bottomBar.cart}
          </span>
        </button>
      </div>
    </nav>
  );
}
