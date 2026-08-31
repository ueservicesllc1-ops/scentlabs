"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { AdminQuickNav } from "@/components/admin/AdminQuickNav";
import { orderRepository } from "@/lib/firestore/orders";
import { Order, OrderStatus, PaymentStatus } from "@/types";
import { formatCurrency, formatUnitPrice } from "@/lib/utils";
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  SlidersHorizontal, 
  CheckCircle2, 
  Clock, 
  Truck, 
  XCircle,
  ArrowLeft,
  ShoppingCart,
  X
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const all = await orderRepository.getAllOrders();
    setOrders(all);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const fullNameStr = o.shippingAddress?.fullName || o.shippingAddress?.name || "";
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      fullNameStr.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === "all" || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = async (orderId: string, orderStatus: OrderStatus) => {
    await orderRepository.updateOrderStatus(orderId, { orderStatus });
    fetchOrders();
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus });
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6 font-sans">
        
        {/* Quick Nav Bar */}
        <AdminQuickNav />

        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <ShoppingCart className="w-3 h-3 text-gray-600" /> Fulfillment & Payment Operations
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Customer Orders ({orders.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Stripe verified commercial transactions, order fulfillment tracking, and buyer address snapshots.
            </p>
          </div>
        </div>

        {/* ━━━━ FILTERS AND SEARCH BAR ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, customer email, or recipient..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by order status"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing / Compounding</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              aria-label="Filter by payment status"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:border-[#2B5F4A]"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid (Stripe Confirmed)</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* ━━━━ ORDERS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Recipient & City</th>
                  <th className="py-3.5 px-4 text-right">Items</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-center">Payment</th>
                  <th className="py-3.5 px-4 text-center">Fulfillment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-500">
                      No customer orders found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const recipient = o.shippingAddress?.fullName || o.shippingAddress?.name || "Customer";
                    const cityState = o.shippingAddress?.city
                      ? `${o.shippingAddress.city}, ${o.shippingAddress.state || ""}`
                      : "US";

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/80 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-950">
                          {o.orderNumber}
                        </td>

                        <td className="py-3.5 px-4 text-gray-800">
                          <div className="font-medium text-gray-900">{o.customerEmail}</div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-gray-900 font-medium">{recipient}</div>
                          <div className="text-[10px] text-gray-500">{cityState}</div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                          {o.items?.length || 0} line items
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-gray-950">
                          ${(o.total || 0).toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              o.paymentStatus === "paid"
                                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                : o.paymentStatus === "refunded"
                                ? "bg-purple-50 border-purple-200 text-purple-800"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              o.orderStatus === "delivered" || o.orderStatus === "shipped"
                                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                                : o.orderStatus === "processing"
                                ? "bg-blue-50 border-blue-200 text-blue-800"
                                : "bg-gray-100 border-gray-200 text-gray-700"
                            }`}
                          >
                            {o.orderStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-semibold inline-flex items-center gap-1 shadow-xs transition"
                          >
                            <Eye className="w-3 h-3 text-gray-500" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ━━━━ ORDER DETAILS MODAL ━━━━ */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl w-full space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                <div>
                  <span className="font-bold text-gray-950 text-base">
                    Order {selectedOrder.orderNumber}
                  </span>
                  <p className="text-[11px] text-gray-500">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-gray-500 hover:text-gray-950 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider block">
                  Purchased Items:
                </span>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">{item.productName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">
                          SKU: {item.sku} • Qty: {item.quantity} units
                        </div>
                      </div>
                      <div className="font-mono font-bold text-gray-950">
                        ${(item.totalPrice || 0).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Shipping Destination:
                </span>
                <div className="text-gray-900 font-semibold">
                  {selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.name}
                </div>
                <div className="text-gray-600">
                  {selectedOrder.shippingAddress?.street1} {selectedOrder.shippingAddress?.street2 || ""}
                </div>
                <div className="text-gray-600">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </div>
              </div>

              {/* Fulfillment Status Controls */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  Update Fulfillment Status:
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                        selectedOrder.orderStatus === st
                          ? "bg-[#2B5F4A] text-white shadow-xs"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminGuard>
  );
}
