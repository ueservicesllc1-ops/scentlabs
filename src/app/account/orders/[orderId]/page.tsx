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
      setReorderMsg(`Added ${addedCount} items to your cart with current catalog pricing.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      <div>
        <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-xs text-lab-400 hover:text-white mb-2 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h1 className="text-3xl font-black text-white uppercase">
              Order {order.orderNumber}
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Historical Snapshot • Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleReorder}
            className="px-4 py-2 rounded-lg bg-amber-500 text-lab-950 font-bold text-xs uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reorder This Batch
          </button>
        </div>
      </div>

      {reorderMsg && (
        <div className="p-3 rounded bg-emerald-950/50 border border-emerald-500/40 text-xs text-emerald-300 flex justify-between items-center">
          <span>{reorderMsg}</span>
          <Link href="/cart" className="underline font-bold">
            View Cart →
          </Link>
        </div>
      )}

      {/* Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
          <span className="text-[10px] text-lab-500 uppercase block">Payment Status</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            {isPaid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
            <span className="capitalize">{order.paymentStatus}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
          <span className="text-[10px] text-lab-500 uppercase block">Order Fulfillment</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Package className="w-4 h-4 text-amber-400" />
            <span className="capitalize">{order.orderStatus}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/40 space-y-1">
          <span className="text-[10px] text-lab-500 uppercase block">Total Billed</span>
          <div className="text-sm font-bold text-amber-400">
            {formatCurrency(order.total)}
          </div>
        </div>
      </div>

      {/* Purchased Line Items Snapshot */}
      <div className="rounded-2xl border border-lab-800 bg-lab-950 p-6 space-y-4 shadow-xl">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-lab-800 pb-3">
          Historical Purchase Snapshot ({order.items.length} lines)
        </h2>

        <div className="divide-y divide-lab-800/60 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start">
              <div className="space-y-0.5">
                <div className="font-bold text-white">{item.productName}</div>
                <div className="text-[11px] text-lab-400">
                  SKU: {item.sku} • {item.quantity} units ({formatUnitPrice(item.unitPrice)}/u)
                </div>
                {item.customization && (
                  <div className="text-[10px] text-amber-400">
                    Custom Specs: {item.customization.bottleName} ({item.customization.dimensions} - {item.customization.material})
                  </div>
                )}
              </div>
              <div className="text-sm font-bold text-white">
                {formatCurrency(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Calculation Snapshot */}
        <div className="border-t border-lab-800 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-lab-400">
            <span>Subtotal</span>
            <span className="text-white">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Volume Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lab-400">
            <span>Shipping ({order.shippingMethod})</span>
            <span className="text-white">{formatCurrency(order.shipping)}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-lab-800">
            <span>Grand Total</span>
            <span className="text-amber-400 text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="rounded-xl border border-lab-800 bg-lab-900/40 p-5 space-y-2 text-xs">
        <h3 className="font-bold text-white uppercase flex items-center gap-2 text-[11px]">
          <Truck className="w-4 h-4 text-amber-400" /> Delivery Address
        </h3>
        <div className="text-white font-medium">{order.shippingAddress.fullName || order.shippingAddress.name || "Customer"}</div>
        <div className="text-lab-400">
          {order.shippingAddress.streetAddress || order.shippingAddress.street1 || ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </div>
        <div className="text-lab-500 text-[11px] pt-1">
          Recipient Contact: {order.customerEmail}
        </div>
      </div>
    </div>
  );
}
