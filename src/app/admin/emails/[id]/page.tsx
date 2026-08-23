"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { emailLogRepository } from "@/lib/firestore/email-logs";
import { EmailLog } from "@/types/email";
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Clock, 
  Layers, 
  FileText, 
  ExternalLink 
} from "lucide-react";

export default function AdminEmailLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [log, setLog] = useState<EmailLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const loadData = async () => {
    if (!id) return;
    const l = await emailLogRepository.getById(id);
    setLog(l);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleResend = async () => {
    if (!log) return;
    setResending(true);
    setActionMsg("");

    try {
      const res = await fetch("/api/admin/email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: log.id }),
      });
      const data = await res.json();

      if (data.success) {
        setActionMsg("Email resent successfully via EmailJS!");
      } else {
        setActionMsg(`Resend failed: ${data.error || "Unknown error"}`);
      }
      await loadData();
    } catch (err: any) {
      setActionMsg(`Network error: ${err.message}`);
    } finally {
      setResending(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="p-12 text-center text-xs font-mono text-lab-500">Loading email transaction log...</div>
      </AdminGuard>
    );
  }

  if (!log) {
    return (
      <AdminGuard>
        <div className="max-w-md mx-auto my-20 p-8 text-center border border-lab-800 rounded-2xl bg-lab-950 font-mono text-xs space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h2 className="text-white font-bold uppercase">Email Log Not Found</h2>
          <Link href="/admin/emails" className="text-amber-400 font-bold uppercase underline">
            Back to Email Logs
          </Link>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              EMAIL TRANSACTION AUDIT
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              Email Log #{log.id}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" /> {resending ? "Dispatching..." : "Resend Email"}
            </button>

            <Link
              href="/admin/emails"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Logs
            </Link>
          </div>
        </div>

        {actionMsg && (
          <div className="p-4 rounded-xl bg-lab-900 border border-lab-800 text-xs text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Metadata Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Delivery Status</span>
            <div>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                log.status === "sent"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                  : log.status === "failed"
                  ? "bg-rose-950 text-rose-400 border border-rose-500/30"
                  : "bg-amber-950 text-amber-400 border border-amber-500/30"
              }`}>
                {log.status}
              </span>
            </div>
            <span className="text-[10px] text-lab-400">
              {log.retryCount ? `${log.retryCount} retry attempt(s)` : "Initial delivery"}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Recipient</span>
            <div className="text-white font-bold text-sm truncate">{log.recipient}</div>
            <span className="text-[10px] text-lab-400 uppercase font-bold">
              {log.type === "order_confirmation" ? "Customer" : "Admin Desk"}
            </span>
          </div>

          <div className="p-5 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            <span className="text-[10px] text-lab-500 uppercase font-bold">Order Reference</span>
            <div className="text-amber-400 font-mono font-bold text-sm">
              <Link href={`/admin/orders/${log.orderId}`} className="hover:underline flex items-center gap-1">
                {log.orderNumber || log.orderId} <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <span className="text-[10px] text-lab-400">Linked SCENTLAB Order</span>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-4 shadow-xl text-xs">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-lab-900 pb-3">
            <Mail className="w-4 h-4 text-amber-400" /> Transaction Parameters
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-lab-500 uppercase text-[10px] block">Template ID</span>
              <div className="text-white font-mono font-bold text-sm">{log.templateId}</div>
            </div>

            <div>
              <span className="text-lab-500 uppercase text-[10px] block">Email Provider</span>
              <div className="text-white uppercase font-bold text-sm">{log.provider}</div>
            </div>

            <div>
              <span className="text-lab-500 uppercase text-[10px] block">Created At</span>
              <div className="text-white font-mono">{new Date(log.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <span className="text-lab-500 uppercase text-[10px] block">Sent / Attempted At</span>
              <div className="text-white font-mono">{log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}</div>
            </div>
          </div>

          {log.error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-1">
              <span className="text-[10px] text-rose-400 uppercase font-bold block flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Technical Error Diagnostic:
              </span>
              <div className="text-rose-200 font-mono text-xs break-all">{log.error}</div>
            </div>
          )}

          {log.messageId && (
            <div>
              <span className="text-lab-500 uppercase text-[10px] block">Provider Message Reference</span>
              <div className="text-lab-300 font-mono text-[11px]">{log.messageId}</div>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
