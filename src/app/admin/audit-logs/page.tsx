"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { auditService, AdminAuditLog } from "@/lib/firestore/audit";
import { 
  ShieldCheck, 
  Clock, 
  FileText, 
  ArrowLeft, 
  RefreshCw, 
  AlertTriangle, 
  KeyRound, 
  SlidersHorizontal 
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const recent = await auditService.getRecentLogs(100);
    setLogs(recent);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionBadge = (action: string) => {
    switch (action) {
      case "admin_pin_success":
      case "admin_login":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "admin_pin_failed":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "admin_logout":
        return "bg-lab-800 text-lab-400 border-lab-700";
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
        {/* Header */}
        <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-widest font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURITY AUDIT TRAIL
            </div>
            <h1 className="text-3xl font-black text-white uppercase">
              Administrative Audit Logs
            </h1>
            <p className="text-xs text-lab-400 mt-1">
              Immutable ledger of administrative authentications, 2FA PIN verifications, and system modifications.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg bg-lab-900 border border-lab-800 text-lab-300 hover:text-white text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Catalog
            </Link>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-lab-800 bg-lab-900/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-lab-950 border-b border-lab-800 text-lab-400 uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Admin Email</th>
                <th className="p-3">Event Action</th>
                <th className="p-3">Entity Type / ID</th>
                <th className="p-3">Client IP</th>
                <th className="p-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-lab-800/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-lab-500">
                    No audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-lab-800/30 transition">
                    <td className="p-3 text-lab-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {log.adminEmail}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-block border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-lab-300">
                      {log.entityType ? `${log.entityType} (${log.entityId || "N/A"})` : "—"}
                    </td>
                    <td className="p-3 text-lab-500 font-mono text-[11px]">
                      {log.ip || "127.0.0.1"}
                    </td>
                    <td className="p-3 text-right text-lab-400 text-[11px]">
                      {log.details ? JSON.stringify(log.details) : "—"}
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
