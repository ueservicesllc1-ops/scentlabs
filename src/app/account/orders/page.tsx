"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { orderRepository } from "@/lib/firestore/orders";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Package, ArrowRight, Clock, CheckCircle2, RotateCcw, AlertCircle, ExternalLink, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { INITIAL_PRODUCTS } from "@/data/products";

export default function CustomerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const fetchOrders = async () => {
      if (user) {
        const fetched = await orderRepository.getOrdersByCustomer(user.uid);
        setOrders(fetched);
      } else {
        const all = await orderRepository.getAllOrders();
        setOrders(all);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, authLoading]);

  const handleReorder = (order: Order) => {
    let readdedCount = 0;
    let unavailableCount = 0;

    for (const item of order.items) {
      const liveProduct = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      const stockAvailable = liveProduct?.inventory
        ? (liveProduct.inventory.availableQuantity ?? liveProduct.inventory.quantityInStock ?? 0)
        : 999;
      if (liveProduct && liveProduct.status === "active" && stockAvailable >= item.quantity) {
        const pkg =
          liveProduct.packageOptions?.find((p) => p.quantity === item.selectedOptions?.packageQuantity) ||
          liveProduct.packageOptions?.[0] || {
            id: "pkg_default",
            name: "Standard Pack",
            quantity: 1,
            price: liveProduct.basePrice,
            unitPrice: liveProduct.basePrice,
          };
        
        addItem(liveProduct, pkg, item.selectedOptions?.packageCount || 1);
        readdedCount++;
      } else {
        unavailableCount++;
      }
    }

    if (readdedCount > 0) {
      setReorderMsg(`Se agregaron ${readdedCount} producto(s) a tu carrito actual.`);
    } else if (unavailableCount > 0) {
      setReorderMsg("Algunos artículos de este pedido anterior están actualmente agotados.");
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-sans">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#166534] text-xs font-bold uppercase tracking-wider">
              <Package className="w-4 h-4 text-[#2B5F4A]" /> Historial de Pedidos & Despachos
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
              Tus Compras y Formulaciones
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              Rastrea el estado de tus envíos, guías de despacho y repite pedidos anteriores con un solo clic.
            </p>
          </div>

          <Link
            href="/fragrance"
            className="px-4 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs shrink-0"
          >
            Explorar Catálogo &rarr;
          </Link>
        </div>

        {reorderMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between font-medium">
            <span>{reorderMsg}</span>
            <Link href="/cart" className="underline font-bold ml-2 text-[#166534]">
              Ver Carrito
            </Link>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400 bg-white border border-gray-200 rounded-2xl">
            Cargando historial de pedidos...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center border border-gray-200 rounded-2xl bg-white space-y-3 max-w-md mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-950">No hay pedidos registrados</h3>
            <p className="text-xs text-gray-500 font-light leading-relaxed">
              Aún no has realizado pedidos de esencias, botellas o suministros de laboratorio.
            </p>
            <Link
              href="/fragrance"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs"
            >
              Comenzar a Comprar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl border border-gray-200 bg-white space-y-4 hover:border-gray-300 transition shadow-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Número de Pedido</span>
                    <span className="font-bold text-gray-950 text-sm">{order.orderNumber}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fecha</span>
                      <span className="text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total</span>
                      <span className="font-bold text-gray-950 font-mono text-sm">{formatCurrency(order.total)}</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      (order.orderStatus || order.status) === "delivered"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}>
                      {order.orderStatus || order.status || "En proceso"}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs text-gray-600 font-light">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>• {item.productName} ({item.quantity}u)</span>
                      <span className="text-gray-900 font-mono font-medium">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#2B5F4A]" /> Comprar de Nuevo
                  </button>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-xs text-[#2B5F4A] hover:underline flex items-center gap-1 font-bold"
                  >
                    Ver Detalles <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </AccountLayout>
  );
}
