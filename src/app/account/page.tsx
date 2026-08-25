"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { orderRepository } from "@/lib/firestore/orders";
import { customLabelRepository } from "@/lib/firestore/custom-labels";
import { Order } from "@/types/order";
import { CustomLabelConfiguration } from "@/types/custom-label";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Tag, 
  Droplet, 
  Box, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  ShoppingBag,
  ExternalLink,
  Layers,
  FlaskConical,
  Truck
} from "lucide-react";

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [labels, setLabels] = useState<CustomLabelConfiguration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        orderRepository.getOrdersByCustomer(user.uid),
        customLabelRepository.getConfigurationsByCustomer(user.uid),
      ]).then(([ord, lbl]) => {
        setOrders(ord.slice(0, 3));
        setLabels(lbl.slice(0, 3));
        setLoading(false);
      });
    }
  }, [user]);

  return (
    <AccountLayout>
      <div className="space-y-6 font-sans">
        
        {/* ━━━━ QUICK STUDIO ACTIONS BANNER ━━━━ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs text-[#166534] font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#2B5F4A]" /> Acciones Rápidas del Estudio
          </div>
          
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
              Formular, Empacar o Reordenar
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-2xl">
              Accede a nuestro catálogo de aceites puros Grado A sin cortar, suministros de laboratorio, botellas o diseña etiquetas personalizadas para tu marca.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/fragrance"
              className="px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
            >
              <Droplet className="w-3.5 h-3.5 text-amber-300" /> Explorar Esencias Puras
            </Link>

            <Link
              href="/bottles"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold uppercase tracking-wider transition flex items-center gap-2 shadow-2xs"
            >
              <Box className="w-3.5 h-3.5 text-[#2B5F4A]" /> Botellas y Empaques
            </Link>

            <Link
              href="/custom-labels"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold uppercase tracking-wider transition flex items-center gap-2 shadow-2xs"
            >
              <Tag className="w-3.5 h-3.5 text-amber-600" /> Crear Etiquetas Foil
            </Link>
          </div>
        </div>

        {/* ━━━━ KPI METRICS ROW ━━━━ */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total de Pedidos</span>
            <div className="text-2xl font-bold text-gray-950 font-mono">{orders.length}</div>
            <p className="text-[11px] text-gray-500 font-light">Órdenes registradas</p>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Proyectos de Etiquetas</span>
            <div className="text-2xl font-bold text-gray-950 font-mono">{labels.length}</div>
            <p className="text-[11px] text-gray-500 font-light">Diseños guardados</p>
          </div>

          <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#166534]">Envío Gratis</span>
            <div className="text-2xl font-bold text-[#166534] font-mono">$250+</div>
            <p className="text-[11px] text-gray-500 font-light">Califican a todo EE. UU. y PR</p>
          </div>
        </div>

        {/* ━━━━ RECENT ORDERS SECTION ━━━━ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-950 tracking-tight flex items-center gap-2">
              <Package className="w-4 h-4 text-[#2B5F4A]" /> Pedidos Recientes & Estado de Entrega
            </h3>
            <Link
              href="/account/orders"
              className="text-xs text-[#2B5F4A] hover:underline font-bold flex items-center gap-1"
            >
              Ver Todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-gray-400 py-8 text-center">Cargando pedidos recientes...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-600 font-light">Aún no has realizado pedidos en SCENTLAB.</p>
              <Link
                href="/fragrance"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
              >
                Comenzar a Comprar <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-gray-950">{order.orderNumber}</div>
                    <div className="text-[11px] text-gray-500 font-light">
                      {new Date(order.createdAt).toLocaleDateString()} &bull; {order.items.length} artículos
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-950 font-mono text-sm">
                      {formatCurrency(order.total)}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      (order.orderStatus || order.status) === "delivered"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-gray-100 text-gray-700 border-gray-200"
                    }`}>
                      {order.orderStatus || order.status || "En proceso"}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-950 transition"
                      title="Ver detalles"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ━━━━ CUSTOM LABELS SECTION ━━━━ */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-4 shadow-xs">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-950 tracking-tight flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-600" /> Proyectos de Etiquetas Guardadas
            </h3>
            <Link
              href="/account/custom-labels"
              className="text-xs text-[#2B5F4A] hover:underline font-bold flex items-center gap-1"
            >
              Ver Todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-gray-400 py-8 text-center">Cargando proyectos de etiquetas...</div>
          ) : labels.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-gray-600 font-light">No tienes diseños de etiquetas personalizados guardados.</p>
              <Link
                href="/custom-labels"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs uppercase tracking-wider transition shadow-2xs"
              >
                Diseñar Nueva Etiqueta <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {labels.map((label) => (
                <div key={label.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-gray-950">{label.brandName || "Etiqueta Personalizada"}</div>
                    <div className="text-[11px] text-gray-500 font-light">{label.fragranceName || label.labelSizeName} &bull; {label.materialName}</div>
                  </div>
                  <Link
                    href={`/custom-labels?configId=${label.id}`}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-800"
                  >
                    Editar Diseño
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AccountLayout>
  );
}
