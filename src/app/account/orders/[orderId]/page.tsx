"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { orderRepository } from "@/lib/firestore/orders";
import { Order } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Clock, Truck, ShieldCheck, RotateCcw, Package } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { INITIAL_PRODUCTS } from "@/data/products";

interface OrderDetailPageProps {
  params: {
    orderId: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState("");
  const { addItem } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      const fetched = await orderRepository.getOrderById(params.orderId);
      setOrder(fetched);
      setLoading(false);
    };

    fetchOrder();
  }, [params.orderId]);

  const handleReorder = () => {
    if (!order) return;
    let addedCount = 0;

    for (const item of order.items) {
      const liveProduct = INITIAL_PRODUCTS.find((p) => p.id === item.productId);
      if (liveProduct && liveProduct.status === "active") {
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
        addedCount++;
      }
    }

    if (addedCount > 0) {
      setReorderMsg(`Se agregaron ${addedCount} artículos a tu carrito.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-8 h-8 rounded-full border-2 border-[#2B5F4A] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-10 font-sans text-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top bar */}
        <div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 mb-3 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a Mis Pedidos
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
                Pedido {order.orderNumber}
              </h1>
              <p className="text-xs text-gray-500 font-light mt-1">
                Registrado el {new Date(order.createdAt).toLocaleDateString()} a las {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            <button
              onClick={handleReorder}
              className="px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Comprar este Lote de Nuevo
            </button>
          </div>
        </div>

        {reorderMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center font-medium">
            <span>{reorderMsg}</span>
            <Link href="/cart" className="underline font-bold text-[#166534]">
              Ver Carrito &rarr;
            </Link>
          </div>
        )}

        {/* Status KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Estado de Pago</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 pt-0.5">
              {isPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-amber-600" />}
              <span className="capitalize">{order.paymentStatus === "paid" ? "Pagado con Éxito" : order.paymentStatus}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Despacho y Envío</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 pt-0.5">
              <Package className="w-4 h-4 text-[#2B5F4A]" />
              <span className="capitalize">{order.orderStatus === "delivered" ? "Entregado" : "En Proceso de Despacho"}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Facturado</span>
            <div className="text-base font-bold text-gray-950 font-mono">
              {formatCurrency(order.total)}
            </div>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-3">
            Artículos del Pedido ({order.items.length} productos)
          </h2>

          <div className="divide-y divide-gray-100 text-xs">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="font-bold text-gray-950">{item.productName}</div>
                  <div className="text-[11px] text-gray-500 font-light">
                    SKU: {item.sku} &bull; {item.quantity} unidades ({formatUnitPrice(item.unitPrice)}/u)
                  </div>
                  {item.customization && (
                    <div className="text-[11px] text-amber-700 font-medium">
                      Personalización: {item.customization.bottleName} ({item.customization.dimensions} - {item.customization.material})
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold text-gray-950 font-mono">
                  {formatCurrency(item.totalPrice)}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Calculation */}
          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="text-gray-950 font-mono font-medium">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Descuento por Volumen</span>
                <span className="font-mono">-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Costo de Envío ({order.shippingMethod || "Estándar"})</span>
              <span className="text-gray-950 font-mono font-medium">{formatCurrency(order.shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-950 pt-3 border-t border-gray-100">
              <span>Total General</span>
              <span className="text-lg font-mono text-[#2B5F4A]">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address Box */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-2 text-xs shadow-xs">
          <h3 className="font-bold text-gray-950 uppercase flex items-center gap-2 text-xs">
            <Truck className="w-4 h-4 text-[#2B5F4A]" /> Dirección de Entrega
          </h3>
          <div className="text-gray-900 font-bold">{order.shippingAddress.fullName || order.shippingAddress.name || "Cliente"}</div>
          <div className="text-gray-600 font-light leading-relaxed">
            {order.shippingAddress.streetAddress || order.shippingAddress.street1 || ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
          </div>
          <div className="text-gray-400 text-[11px] pt-1">
            Contacto del destinatario: {order.customerEmail}
          </div>
        </div>

      </div>
    </div>
  );
}
