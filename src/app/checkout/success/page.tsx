"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { Order } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { CheckCircle2, Clock, ArrowRight, Package } from "lucide-react";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");
  const isMock = searchParams.get("mock") === "true";

  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear the client cart after successful checkout session initialization
    clearCart();

    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (e) {
        console.error("Failed to fetch order status", e);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
    // Poll once more after 3 seconds in case webhook is completing in background
    const timer = setTimeout(fetchOrderStatus, 3000);
    return () => clearTimeout(timer);
  }, [orderId, clearCart]);

  const isPaid = order?.paymentStatus === "paid" || isMock;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 font-mono">
      {/* Status Hero */}
      <div className="text-center space-y-3">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
          isPaid
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
            : "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
        }`}>
          {isPaid ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
        </div>

        <span className="text-xs text-amber-400 uppercase tracking-widest font-bold block">
          {isPaid ? "PAYMENT CONFIRMED" : "PAYMENT PROCESSING"}
        </span>

        <h1 className="text-3xl font-black text-white uppercase">
          {isPaid ? "Thank You for Your Order" : "Awaiting Stripe Webhook Confirmation"}
        </h1>

        <p className="text-xs text-lab-300 max-w-md mx-auto leading-relaxed">
          {isPaid
            ? `Your order ${order?.orderNumber || ""} has been recorded. Our compounding and fulfillment team is preparing your supplies batch.`
            : "Your payment was submitted to Stripe. Firestore order status will update as soon as the secure webhook is confirmed."}
        </p>
      </div>

      {/* Order Card */}
      {order && (
        <div className="rounded-2xl border border-lab-800 bg-lab-950 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-lab-800 pb-4 gap-2">
            <div>
              <span className="text-[10px] text-lab-500 uppercase block">Order Number</span>
              <span className="text-base font-bold text-white">{order.orderNumber}</span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-lab-500 uppercase block">Payment Status</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase inline-block ${
                isPaid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              }`}>
                {isPaid ? "Paid via Stripe" : order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Line Items Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Purchased Items Snapshot ({order.items.length} lines)
            </h3>
            <div className="divide-y divide-lab-800/60 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">{item.productName}</div>
                    <div className="text-[10px] text-lab-400">
                      SKU: {item.sku} • {item.quantity} units ({formatUnitPrice(item.unitPrice)}/u)
                    </div>
                  </div>
                  <div className="font-bold text-white">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
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
              <span>Total Paid</span>
              <span className="text-amber-400 text-lg">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Shipping Destination */}
          <div className="border-t border-lab-800 pt-4 space-y-1 text-xs">
            <span className="text-[10px] text-lab-500 uppercase block">Shipping Destination</span>
            <div className="text-white font-medium">{order.shippingAddress.fullName || order.shippingAddress.name || "Customer"}</div>
            <div className="text-lab-400">
              {order.shippingAddress.streetAddress || order.shippingAddress.street1 || ""}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <Link
          href="/shop"
          className="px-6 py-3 rounded-lg text-xs font-bold uppercase bg-amber-500 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          Return to Catalog <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/account/orders"
          className="px-6 py-3 rounded-lg text-xs font-bold uppercase bg-lab-900 border border-lab-800 text-white hover:bg-lab-800 transition flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4" /> View My Orders
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center font-mono text-xs text-lab-400">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
          Loading order confirmation...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
