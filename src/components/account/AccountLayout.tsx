"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { customerRepository } from "@/lib/firestore/customer";
import { CustomerNotification } from "@/types/customer";
import { 
  User, 
  Package, 
  Tag, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight
} from "lucide-react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: "Overview", href: "/account", icon: User },
  { name: "Orders & Reorders", href: "/account/orders", icon: Package },
  { name: "Custom Labels", href: "/account/custom-labels", icon: Tag },
  { name: "Profile & Photo", href: "/account/profile", icon: User },
  { name: "Addresses", href: "/account/addresses", icon: MapPin },
  { name: "Security & Login", href: "/account/security", icon: ShieldCheck },
];

export function AccountLayout({ children }: AccountLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loginWithEmail, registerWithEmail, loginWithGoogle, logout } = useAuth();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user) {
      customerRepository.getNotifications(user.uid).then(setNotifications);
    }
  }, [user]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
    } catch (err: any) {
      setAuthError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Not logged in: Render Auth Form
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 font-mono space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-lab-800 to-lab-900 border border-lab-700 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Customer Portal
          </h1>
          <p className="text-xs text-lab-400">
            Sign in to manage your formulations, custom labels, address book, and order tracking.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-lab-800 bg-lab-950 space-y-5 shadow-2xl">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300">
              {authError}
            </div>
          )}

          {/* Google Quick Sign-In */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full py-3 rounded-xl bg-lab-900 border border-lab-700 hover:border-amber-500/50 hover:bg-lab-850 text-white font-bold text-xs uppercase transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[10px] text-lab-600 uppercase">
            <span className="flex-1 border-b border-lab-800" />
            <span>Or with email</span>
            <span className="flex-1 border-b border-lab-800" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                placeholder="formulator@scentlab.com"
              />
            </div>

            <div>
              <label className="text-lab-400 block mb-1 uppercase text-[10px]">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-lab-900 border border-lab-800 rounded-xl px-3.5 py-2.5 text-white placeholder-lab-600 focus:outline-none focus:border-amber-500"
                placeholder="••••••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-lab-950 font-bold uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
            >
              {authLoading ? "Authenticating..." : authMode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setAuthError(null);
              }}
              className="text-xs text-lab-400 hover:text-amber-400 transition"
            >
              {authMode === "login" ? "Need an account? Register here" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 font-mono">
      {/* Top Header Bar */}
      <div className="border-b border-lab-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> CUSTOMER FORMULATOR PORTAL
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Account Dashboard
          </h1>
          <p className="text-xs text-lab-400">
            Welcome back, <span className="text-white font-bold">{user.email}</span>
          </p>
        </div>

        {/* Notifications & Quick Logout */}
        <div className="flex items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-white relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-lab-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popup */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 rounded-2xl bg-lab-950 border border-lab-800 shadow-2xl p-4 z-50 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-white uppercase border-b border-lab-900 pb-2">
                <span>Account Notifications</span>
                <span className="text-amber-400 text-[10px]">{unreadCount} Unread</span>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-lab-500 text-center py-4">No notifications yet.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded-xl bg-lab-900/60 border border-lab-800/80 space-y-1 text-xs">
                      <div className="font-bold text-white uppercase text-[11px]">{n.title}</div>
                      <p className="text-[10px] text-lab-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => logout()}
            className="px-3.5 py-2 rounded-xl bg-lab-900 border border-lab-800 text-lab-400 hover:text-rose-400 hover:border-rose-500/40 text-xs font-bold uppercase transition flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="p-2 rounded-2xl border border-lab-800 bg-lab-950 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase transition ${
                    isActive
                      ? "bg-amber-500 text-lab-950 font-black shadow-md shadow-amber-500/10"
                      : "text-lab-400 hover:text-white hover:bg-lab-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-60" />
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Dynamic Content Stage */}
        <main className="lg:col-span-9">
          {children}
        </main>
      </div>
    </div>
  );
}
