"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
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
  ArrowLeft
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
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullNameStr.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <Package className="w-3.5 h-3.5" /> FULFILLMENT & PAYMENT OPERATIONS
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Customer Orders ({orders.length})
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Stripe verified payments, order fulfillment tracking, and buyer snapshots.
            </p>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order number, customer email, or recipient..."
              className="w-full bg-lab-950 border border-lab-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Fulfillment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-lab-950 border border-lab-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total Billed</th>
                <th className="p-3">Payment (Stripe)</th>
                <th className="p-3">Fulfillment</th>
                <th className="p-3">Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-800/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-lab-500">
                    No matching orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isPaid = order.paymentStatus === "paid";
                  return (
                    <tr key={order.id} className="hover:bg-lab-800/30 transition">
                      <td className="p-3 font-bold text-white">
                        {order.orderNumber}
                      </td>
                      <td className="p-3">
                        <div className="text-white">{order.shippingAddress?.fullName || order.shippingAddress?.name || "Customer"}</div>
                        <div className="text-[10px] text-lab-500">{order.customerEmail}</div>
                      </td>
                      <td className="p-3 text-lab-300">
                        {order.items.length} line(s) • {order.items.reduce((s, i) => s + i.quantity, 0)}u
                      </td>
                      <td className="p-3 font-bold text-amber-400">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block ${
                          isPaid ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="capitalize text-white font-medium">
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-3 text-lab-400 text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 rounded bg-lab-800 hover:bg-lab-700 text-white transition text-[11px] inline-flex items-center gap-1 border border-lab-700"
                        >
                          <Eye className="w-3 h-3" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="p-6 rounded-2xl border border-lab-700 bg-lab-950 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b border-lab-800 pb-4">
              <div>
                <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                  ORDER SPECIFICATION
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-lab-400">
                  Customer Email: <strong className="text-white">{selectedOrder.customerEmail}</strong> • ID: {selectedOrder.id}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="bg-lab-900 border border-lab-700 rounded-lg px-3 py-1.5 text-xs text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1.5 rounded-lg bg-lab-900 border border-lab-800 text-lab-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Purchased Supplies Snapshot
              </h3>
              <div className="divide-y divide-lab-800/60 border border-lab-800 rounded-xl bg-lab-900/30 p-4 text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{item.productName}</div>
                      <div className="text-[10px] text-lab-400">
                        SKU: {item.sku} • {item.quantity} units @ {formatUnitPrice(item.unitPrice)}/u
                      </div>
                    </div>
                    <div className="font-bold text-white">{formatCurrency(item.totalPrice)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals & Delivery Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/20 space-y-1">
                <span className="text-[10px] text-lab-500 uppercase block">Shipping Logistics Address</span>
                <div className="text-white font-bold">{selectedOrder.shippingAddress?.fullName || selectedOrder.shippingAddress?.name || "Customer"}</div>
                <div className="text-lab-300">
                  {selectedOrder.shippingAddress?.streetAddress || selectedOrder.shippingAddress?.street1 || ""}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-lab-800 bg-lab-900/20 space-y-1.5">
                <div className="flex justify-between text-lab-400">
                  <span>Subtotal:</span>
                  <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-lab-400">
                  <span>Shipping:</span>
                  <span className="text-white">{formatCurrency(selectedOrder.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-lab-800">
                  <span>Grand Total:</span>
                  <span className="text-amber-400">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
