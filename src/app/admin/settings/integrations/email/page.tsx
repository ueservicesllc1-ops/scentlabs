"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  FileText, 
  Layers 
} from "lucide-react";

export default function AdminEmailJsSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestEmailJs = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono space-y-8">
        <div className="border-b border-lab-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs text-amber-400 font-bold uppercase tracking-widest block mb-1">
              SYSTEM INTEGRATIONS & SETTINGS
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase">
              EmailJS Integration Status
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/admin/emails"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-amber-400 hover:text-white uppercase font-bold transition flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" /> Email Delivery Logs
            </Link>

            <Link
              href="/admin/settings/integrations"
              className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white uppercase font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> All Integrations
            </Link>
          </div>
        </div>

        {/* Configuration Summary Card */}
        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-6 shadow-2xl text-xs">
          <div className="flex items-center justify-between border-b border-lab-900 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase">EmailJS Transactional Service</h2>
                <span className="text-[10px] text-lab-400">Automated order confirmations & admin alerts</span>
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] uppercase inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Integration Ready
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-lab-900/60 border border-lab-800 space-y-1">
              <span className="text-[10px] text-lab-500 uppercase font-bold">Customer Confirmation Template</span>
              <div className="text-white font-bold font-mono text-sm">template_bnf8vrj</div>
              <span className="text-[10px] text-emerald-400">Fixed Production Template ID</span>
            </div>

            <div className="p-4 rounded-xl bg-lab-900/60 border border-lab-800 space-y-1">
              <span className="text-[10px] text-lab-500 uppercase font-bold">Admin Notification Template</span>
              <div className="text-white font-bold font-mono text-sm">template_771c56e</div>
              <span className="text-[10px] text-emerald-400">Fixed Production Template ID</span>
            </div>

            <div className="p-4 rounded-xl bg-lab-900/60 border border-lab-800 space-y-1">
              <span className="text-[10px] text-lab-500 uppercase font-bold">Admin Notification Recipient</span>
              <div className="text-white font-bold text-sm">ueservicesllc1@gmail.com</div>
              <span className="text-[10px] text-lab-400">Configured via EMAILJS_ADMIN_NOTIFICATION_EMAIL</span>
            </div>

            <div className="p-4 rounded-xl bg-lab-900/60 border border-lab-800 space-y-1">
              <span className="text-[10px] text-lab-500 uppercase font-bold">Security & Keys Architecture</span>
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Server-Side Isolated
              </div>
              <span className="text-[10px] text-lab-400">Private key is never exposed to browser</span>
            </div>
          </div>

          {/* Test Action */}
          <div className="pt-2 border-t border-lab-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-lab-400 text-[11px]">
              Dispatches a test payload using <code className="text-amber-400">template_771c56e</code> to verify end-to-end delivery.
            </div>

            <button
              type="button"
              disabled={testing}
              onClick={handleTestEmailJs}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase hover:brightness-110 transition flex items-center gap-2 shadow-lg shadow-amber-500/10 text-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              {testing ? "Testing Dispatch..." : "Test EmailJS Integration"}
            </button>
          </div>
        </div>

        {/* Test Result Output */}
        {testResult && (
          <div className={`p-5 rounded-2xl border ${
            testResult.success 
              ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/40 text-rose-300"
          } space-y-2 text-xs`}>
            <div className="flex items-center gap-2 font-bold uppercase text-sm">
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  EmailJS Test Passed Successfully
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  EmailJS Test Execution Failed
                </>
              )}
            </div>

            <div className="font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-white/10 break-all">
              <pre className="whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
