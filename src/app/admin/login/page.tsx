"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail,
  signOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  AlertCircle, 
  Mail, 
  FlaskConical, 
  CheckCircle2,
  RefreshCw 
} from "lucide-react";

const AUTHORIZED_ADMIN_EMAIL = "ueservicesllc1@gmail.com";

export default function AdminLoginPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Authentication Stage: 1 = Firebase Auth (Google or Email/Password), 2 = Server PIN Verification
  const [stage, setStage] = useState<1 | 2>(1);
  const [authenticatedEmail, setAuthenticatedEmail] = useState("");

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // If user is already logged in with Firebase Auth, check if they are the authorized admin
  useEffect(() => {
    if (user?.email) {
      const userEmail = user.email.trim().toLowerCase();
      if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setAuthenticatedEmail(userEmail);
        setStage(2);
      } else {
        // Logged in as normal customer: deny access immediately
        setError("Access denied.");
        setStage(1);
      }
    }
  }, [user]);

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    if (!auth) {
      setError("Authentication service unavailable.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email?.trim().toLowerCase() || "";

      if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setAuthenticatedEmail(userEmail);
        setStage(2);
      } else {
        // Any other email gets generic Access Denied
        await signOut(auth);
        setError("Access denied.");
        setStage(1);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Email + Password Sign-In
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userEmail = result.user.email?.trim().toLowerCase() || "";

      if (userEmail === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setAuthenticatedEmail(userEmail);
        setStage(2);
      } else {
        await signOut(auth);
        setError("Access denied.");
        setStage(1);
      }
    } catch (err: any) {
      setError("Access denied.");
    } finally {
      setLoading(false);
    }
  };

  // Handle PIN Verification (Step 2)
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authenticatedEmail,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Incorrect PIN.");
      }

      // Success: redirect to Admin Dashboard
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Incorrect PIN.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async () => {
    if (!email.trim() || !auth) {
      setError("Please enter your admin email above first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    }
  };

  const handleSwitchAccount = async () => {
    if (auth) await signOut(auth);
    setStage(1);
    setPin("");
    setError("");
    setAuthenticatedEmail("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 font-mono">
      <div className="w-full max-w-md p-8 rounded-2xl border border-lab-800 bg-lab-950 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            {stage === 1 ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6 text-amber-400" />}
          </div>

          <div className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
            RESTRICTED ACCESS
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            SCENTLAB Admin Access
          </h1>
          <p className="text-xs text-lab-400 leading-relaxed">
            {stage === 1
              ? "Industrial compounding, supplier costs, and margin operations."
              : `Security Layer 2: Enter authorized administrator PIN for ${authenticatedEmail}.`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Password reset instructions sent to your email.</span>
          </div>
        )}

        {/* STAGE 1: FIREBASE AUTH (Google or Email/Password) */}
        {stage === 1 && (
          <div className="space-y-4">
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl border border-lab-700 bg-lab-900 hover:bg-lab-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-2 text-lab-700 text-[10px] uppercase">
              <div className="flex-1 h-[1px] bg-lab-800" />
              <span>or sign in with password</span>
              <div className="flex-1 h-[1px] bg-lab-800" />
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handleEmailSignIn} className="space-y-3 text-xs">
              <div>
                <label className="text-lab-400 block mb-1 text-[10px] uppercase">Administrator Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ueservicesllc1@gmail.com"
                  className="w-full bg-lab-900 border border-lab-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-lab-400 text-[10px] uppercase">Master Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] text-amber-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-lab-900 border border-lab-800 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-lab-950 border-t-transparent animate-spin" />
                ) : (
                  <>
                    Sign In to Admin <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STAGE 2: 4-DIGIT ADMIN PIN INPUT (MASKED PASSWORD TYPE) */}
        {stage === 2 && (
          <form onSubmit={handleVerifyPin} className="space-y-5 text-xs">
            <div className="p-3 rounded-xl bg-lab-900/60 border border-lab-800 flex justify-between items-center text-[11px]">
              <span className="text-lab-400">Authenticated: <strong className="text-white">{authenticatedEmail}</strong></span>
              <button
                type="button"
                onClick={handleSwitchAccount}
                className="text-amber-400 hover:underline text-[10px]"
              >
                Switch
              </button>
            </div>

            <div className="space-y-2 text-center">
              <label className="text-xs font-bold text-white uppercase tracking-wider block">
                Enter 4-Digit Administrator PIN
              </label>
              
              <div className="flex justify-center">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  required
                  autoFocus
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-44 text-center tracking-[1em] text-2xl font-black bg-lab-900 border-2 border-amber-500/80 rounded-xl py-3 text-amber-400 focus:outline-none focus:border-amber-400 shadow-inner"
                />
              </div>
              <span className="text-[10px] text-lab-500 block">
                Masked server-verified authorization code
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || pin.length !== 4}
              className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 hover:brightness-110 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-lab-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Authorize Admin Session
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-lab-800/80">
          <Link href="/" className="text-[11px] text-lab-500 hover:text-white transition">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
