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
        return "bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]";
      case "admin_pin_failed":
        return "bg-red-50 text-red-800 border-red-200";
      case "admin_logout":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-amber-50 text-amber-800 border-amber-200";
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-8 font-sans">
        
        {/* ━━━━ HEADER ━━━━ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 border border-gray-300 mb-2">
              <ShieldCheck className="w-3 h-3 text-gray-600" /> Security & Session Audit Trail
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Administrative Audit Logs
            </h1>
            <p className="text-xs text-gray-600 mt-1 max-w-2xl leading-relaxed">
              Immutable ledger of administrative authentications, 2FA PIN verifications, and system modifications.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Logs
          </button>
        </div>

        {/* ━━━━ LOGS TABLE ━━━━ */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-[10px] text-gray-600 uppercase font-bold border-b border-gray-200">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Entity Type / ID</th>
                  <th className="py-3 px-4">Client IP</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-950 font-mono">
                        {log.adminEmail}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadge(
                            log.action
                          )}`}
                        >
                          {log.action.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-700 font-mono text-[11px]">
                        {log.entityType ? `${log.entityType} (${log.entityId || "N/A"})` : "System"}
                      </td>

                      <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                        {log.ip || "Direct Session"}
                      </td>

                      <td className="py-3 px-4 text-right text-gray-500 text-[10px] font-mono truncate max-w-xs">
                        {log.details ? JSON.stringify(log.details) : "—"}
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
