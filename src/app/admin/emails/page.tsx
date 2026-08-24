"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { emailLogRepository } from "@/lib/firestore/email-logs";
import { EmailLog } from "@/types/email";
import { 
  Mail, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Send, 
  ShieldAlert, 
  Clock, 
  Settings, 
  ArrowRight 
} from "lucide-react";

export default function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    const allLogs = await emailLogRepository.getAll(150);
    setLogs(allLogs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSent = logs.filter((l) => l.status === "sent").length;
  const totalFailed = logs.filter((l) => l.status === "failed").length;
  const deliveryRate = logs.length > 0 ? Math.round((totalSent / logs.length) * 100) : 100;

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      l.recipient.toLowerCase().includes(q) ||
      (l.orderNumber || "").toLowerCase().includes(q) ||
      l.orderId.toLowerCase().includes(q) ||
      l.templateId.toLowerCase().includes(q);

    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleResend = async (logId: string) => {
    setResendingId(logId);
    setActionMsg("");

    try {
      const res = await fetch("/api/admin/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });
      const data = await res.json();

      if (data.success) {
        setActionMsg("Email resent successfully!");
      } else {
        setActionMsg(`Resend failed: ${data.error || "Unknown error"}`);
      }
      await loadData();
    } catch (err: any) {
      setActionMsg(`Network error: ${err.message}`);
    } finally {
      setResendingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]";
      case "failed":
        return "bg-red-50 text-red-800 border-red-200";
      case "retrying":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <Mail className="w-3 h-3 text-gray-600" /> Transactional Email Dispatch Logs
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Email Notifications ({logs.length})
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Real-time audit log of customer order confirmations, custom label proof approvals, shipping tracking alerts, and inventory reorders.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-xs transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              href="/admin/settings/integrations/email"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition"
            >
              <Settings className="w-3.5 h-3.5" /> Email Settings
            </Link>
          </div>
        </div>

        {actionMsg && (
          <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-semibold">
            {actionMsg}
          </div>
        )}

        {/* ━━━━ KPI SUMMARY CARDS ━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Total Dispatched</span>
            <div className="text-2xl font-bold text-gray-950">{logs.length}</div>
            <span className="text-[11px] text-gray-500 block">Outbound transactional triggers</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Successful Deliveries</span>
            <div className="text-2xl font-bold text-[#166534]">{totalSent}</div>
            <span className="text-[11px] text-gray-500 block">{deliveryRate}% delivery success rate</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Failed Deliveries</span>
            <div className="text-2xl font-bold text-red-700">{totalFailed}</div>
            <span className="text-[11px] text-gray-500 block">Requires retry or template review</span>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs space-y-1">
            <span className="text-[11px] text-gray-500 uppercase block font-semibold">Active Templates</span>
            <div className="text-2xl font-bold text-gray-950">5 Templates</div>
            <span className="text-[11px] text-gray-500 block">Order, proof, shipped, reorder</span>
          </div>
        </div>

        {/* ━━━━ FILTER BAR ━━━━ */}
        <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-xs flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient email, order #, template..."
              className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 placeholder-gray-400 focus:border-[#2B5F4A] focus:outline-none focus:ring-1 focus:ring-[#2B5F4A]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by delivery status"
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:border-[#2B5F4A] focus:outline-none"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="sent">Sent Successfully</option>
            <option value="failed">Failed Delivery</option>
            <option value="retrying">Retrying</option>
          </select>
        </div>

        {/* ━━━━ LOGS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Recipient</th>
                  <th className="py-3.5 px-4">Template ID</th>
                  <th className="py-3.5 px-4">Order / Event</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No email dispatch logs found matching filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt || log.sentAt || Date.now()).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-950 font-mono">
                        {log.recipient}
                      </td>

                      <td className="py-3.5 px-4 text-gray-700">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-gray-100 text-gray-800 border border-gray-200">
                          {log.templateId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-700 font-mono text-[11px]">
                        {log.orderNumber ? `Order #${log.orderNumber}` : log.orderId || "System Trigger"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/emails/${log.id}`}
                            className="p-1.5 rounded-lg bg-white border border-gray-300 text-gray-600 hover:text-gray-950 hover:bg-gray-50"
                            title="Inspect Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          {log.status === "failed" && (
                            <button
                              onClick={() => handleResend(log.id)}
                              disabled={resendingId === log.id}
                              className="px-2 py-1 rounded-lg bg-[#2B5F4A] text-white hover:bg-[#1E4233] text-[10px] font-bold uppercase disabled:opacity-40"
                              title="Resend Email"
                            >
                              {resendingId === log.id ? "Sending..." : "Resend"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminGuard>
  );
}
