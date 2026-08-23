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
    const matchSearch =
      l.recipient.toLowerCase().includes(search.toLowerCase()) ||
      (l.orderNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      l.orderId.toLowerCase().includes(search.toLowerCase()) ||
      l.templateId.toLowerCase().includes(search.toLowerCase());

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
        return "bg-emerald-950 text-emerald-400 border border-emerald-500/30";
      case "failed":
        return "bg-rose-950 text-rose-400 border border-rose-500/30";
      case "retrying":
        return "bg-amber-950 text-amber-400 border border-amber-500/30";
      default:
        return "bg-lab-900 text-lab-400 border border-lab-700";
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              EMAILJS TRANSACTIONAL ENGINE
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Email Delivery Logs
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/admin/settings/integrations/email"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-amber-400 hover:text-white uppercase font-bold transition flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" /> EmailJS Settings & Test
            </Link>

            <button
              type="button"
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-xl bg-lab-900 border border-lab-800 text-xs text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Total Emails Triggered</span>
            <div className="text-2xl font-black text-white">{logs.length}</div>
            <span className="text-[10px] text-lab-400">Order confirmations & admin alerts</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Delivered (Sent)</span>
            <div className="text-2xl font-black text-emerald-400">{totalSent}</div>
            <span className="text-[10px] text-lab-400">Successfully accepted by EmailJS</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Delivery Rate</span>
            <div className="text-2xl font-black text-amber-400">{deliveryRate}%</div>
            <span className="text-[10px] text-lab-400">Overall success ratio</span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase block font-bold">Failed Dispatches</span>
            <div className="text-2xl font-black text-rose-400">{totalFailed}</div>
            <span className="text-[10px] text-lab-400">Requires retry / review</span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="p-4 rounded-2xl border border-lab-800 bg-lab-950 flex flex-col md:flex-row justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-lab-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by recipient email, order number, or template ID..."
              className="w-full bg-lab-900 border border-lab-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-lab-900 border border-lab-800 rounded-xl px-3 py-2 text-white"
            >
              <option value="all">All Delivery Statuses</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="retrying">Retrying</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-lab-800 bg-lab-950 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-lab-900/80 text-[10px] text-lab-400 uppercase border-b border-lab-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5">Order Ref</th>
                <th className="p-3.5">Template ID</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-900 text-lab-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-lab-500">Loading email transaction records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-lab-500">
                    No email logs found. Orders with confirmed payment will appear here.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-lab-900/40 transition">
                    <td className="p-3.5 text-[10px] text-lab-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-lab-900 text-lab-300 border border-lab-800 uppercase text-[10px] font-bold">
                        {log.type === "order_confirmation" ? "Customer Confirmation" : "Admin Alert"}
                      </span>
                    </td>

                    <td className="p-3.5 text-white font-bold">
                      {log.recipient}
                    </td>

                    <td className="p-3.5 font-mono text-amber-400 text-[11px]">
                      {log.orderNumber || log.orderId}
                    </td>

                    <td className="p-3.5 font-mono text-lab-400 text-[11px]">
                      {log.templateId}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/admin/emails/${log.id}`}
                          className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-lab-300 hover:text-white text-[11px] font-bold uppercase transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> View
                        </Link>

                        <button
                          type="button"
                          disabled={resendingId === log.id}
                          onClick={() => handleResend(log.id)}
                          className="px-2.5 py-1 rounded-lg bg-lab-900 border border-lab-800 hover:border-amber-500/40 text-amber-400 hover:text-white text-[11px] font-bold uppercase transition inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          {resendingId === log.id ? "Sending..." : "Resend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
