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
  ExternalLink 
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
      <div className="space-y-8 font-mono">
        {/* Quick Action Banner */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> QUICK STUDIO ACTIONS
          </div>
          <h2 className="text-xl font-bold text-white uppercase">
            Formulate, Package, or Reorder
          </h2>
          <p className="text-xs text-lab-400 leading-relaxed max-w-2xl">
            Access our direct fractioning catalog, design personalized metallic foil labels, or reorder past recipes with current volume tiers.
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <Link
              href="/fragrance"
              className="px-4 py-2.5 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold uppercase transition flex items-center gap-1.5"
            >
              <Droplet className="w-3.5 h-3.5 text-amber-400" /> Shop Fragrance Oils
            </Link>

            <Link
              href="/packaging"
              className="px-4 py-2.5 rounded-xl bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-white font-bold uppercase transition flex items-center gap-1.5"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" /> Shop Packaging
            </Link>

            <Link
              href="/custom-labels"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase transition flex items-center gap-1.5 shadow"
            >
              <Tag className="w-3.5 h-3.5" /> Create Custom Label
            </Link>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4">
          <div className="flex justify-between items-center border-b border-lab-900 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" /> Recent Orders & Fulfillment
            </h3>
            <Link href="/account/orders" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-lab-500 py-6 text-center">Loading recent orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-lab-400">You haven&apos;t placed any orders yet.</p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lab-900 border border-lab-800 text-white font-bold text-xs uppercase hover:border-amber-500/40"
              >
                Start Shopping <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-lab-900">
              {orders.map((order) => (
                <div key={order.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white uppercase">{order.orderNumber}</div>
                    <div className="text-[10px] text-lab-500">{new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-400 font-mono">{formatCurrency(order.total)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      (order.orderStatus || order.status) === "delivered" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30" : "bg-lab-900 text-lab-300 border border-lab-800"
                    }`}>
                      {order.orderStatus || order.status || "pending"}
                    </span>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Custom Labels Section */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4">
          <div className="flex justify-between items-center border-b border-lab-900 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" /> Saved Custom Labels & Projects
            </h3>
            <Link href="/account/custom-labels" className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-xs text-lab-500 py-6 text-center">Loading label projects...</div>
          ) : labels.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-lab-400">You haven&apos;t created any custom labels yet.</p>
              <Link
                href="/custom-labels"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold text-xs uppercase hover:brightness-110 shadow"
              >
                Create Your Label <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-lab-900">
              {labels.map((lbl) => (
                <div key={lbl.id} className="py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white uppercase">{lbl.brandName || "Custom Label"} - {lbl.fragranceName}</div>
                    <div className="text-[10px] text-lab-500">Size: {lbl.labelSizeName} • Material: {lbl.materialName} • {lbl.quantity} units</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-lab-900 text-amber-400 border border-amber-500/30">
                      {lbl.status}
                    </span>
                    <Link
                      href={`/account/custom-labels/${lbl.id}`}
                      className="p-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
