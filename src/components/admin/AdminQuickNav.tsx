"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Users, Inbox, LayoutDashboard, Settings } from "lucide-react";

export function AdminQuickNav() {
  const pathname = usePathname();

  const links = [
    { label: "Compras / Pedidos", href: "/admin/orders", icon: ShoppingCart },
    { label: "Usuarios Registrados", href: "/admin/users", icon: Users },
    { label: "Mensajes de Contacto", href: "/admin/messages", icon: Inbox },
    { label: "Catálogo & Operaciones", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-2.5 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-[#2B5F4A] text-white shadow-xs"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-950 border border-gray-200/80"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-500"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center gap-2 text-[11px] text-gray-500 font-medium px-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Panel Principal ScentLabs Admin</span>
      </div>
    </div>
  );
}
