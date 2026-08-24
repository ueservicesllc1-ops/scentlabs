"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import { orderRepository } from "@/lib/firestore/orders";
import { Order } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { Package, ArrowRight, Clock, CheckCircle2, RotateCcw, AlertCircle, ExternalLink } from "lucide-react";
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
      setReorderMsg(`Added ${readdedCount} item(s) to active cart with live pricing.`);
    } else if (unavailableCount > 0) {
      setReorderMsg("Some items from this previous order are currently out of stock or inactive.");
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6 font-mono">
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Package className="w-3.5 h-3.5" /> ORDER HISTORY & DISPATCH ARCHIVE
            </div>
            <h2 className="text-xl font-bold text-white uppercase mt-1">
              Your Compounding Orders
            </h2>
            <p className="text-xs text-lab-400">
              Track fulfillment status, courier dispatch codes, and reorder past batches in 1 click.
            </p>
          </div>

          <Link
            href="/shop"
            className="px-4 py-2 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold text-xs uppercase"
          >
            Browse Catalog →
          </Link>
        </div>

        {reorderMsg && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between">
            <span>{reorderMsg}</span>
            <Link href="/cart" className="underline font-bold ml-2 text-white">
              View Cart
            </Link>
          </div>
        )}

        {loading ? (
          <div className="text-xs text-lab-500 py-10 text-center">Loading order history...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center border border-lab-800 rounded-2xl bg-lab-950/40 space-y-3 max-w-md mx-auto">
            <Package className="w-8 h-8 text-lab-600 mx-auto" />
            <h3 className="text-sm font-bold text-white uppercase">No Orders Found</h3>
            <p className="text-xs text-lab-400">
              You haven&apos;t placed any formulation or packaging orders yet.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase"
            >
              Start First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 hover:border-lab-700 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-lab-900 pb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-lab-500 uppercase block">Order Reference</span>
                    <span className="font-bold text-white uppercase">{order.orderNumber}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[10px] text-lab-500 uppercase block">Order Date</span>
                      <span className="text-lab-300">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-lab-500 uppercase block">Total</span>
                      <span className="font-bold text-amber-400">{formatCurrency(order.total)}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      (order.orderStatus || order.status) === "delivered"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                        : "bg-lab-900 text-amber-400 border border-amber-500/30"
                    }`}>
                      {order.orderStatus || order.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 text-xs text-lab-300">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>• {item.productName} ({item.quantity}u)</span>
                      <span className="text-lab-400 font-mono">{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-lab-900 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={() => handleReorder(order)}
                    className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 font-bold text-xs uppercase transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Buy Again (Reorder)
                  </button>

                  <Link
                    href={`/account/orders/${order.id}`}
                    className="text-xs text-lab-400 hover:text-white flex items-center gap-1 uppercase font-bold"
                  >
                    Order Details <ArrowRight className="w-3.5 h-3.5" />
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
