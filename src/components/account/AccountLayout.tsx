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
  Lock,
  Mail,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Layers,
  HelpCircle
} from "lucide-react";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { name: "Resumen de Cuenta", href: "/account", icon: Layers, exact: true },
  { name: "Mis Pedidos & Facturación", href: "/account/orders", icon: Package },
  { name: "Etiquetas & Proyectos", href: "/account/custom-labels", icon: Tag },
  { name: "Perfil de Cliente", href: "/account/profile", icon: User },
  { name: "Libreta de Direcciones", href: "/account/addresses", icon: MapPin },
  { name: "Seguridad & Contraseña", href: "/account/security", icon: ShieldCheck },
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
      setAuthError(err?.message || "Error al iniciar sesión. Por favor verifica tus credenciales.");
    } finally {
      setAuthLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ━━━━ NOT LOGGED IN: MODERN LUXURY AUTH FORM ━━━━
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4 py-16 font-sans">
        <div className="max-w-md w-full space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#2B5F4A] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-5 h-5 text-amber-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Portal de Clientes SCENTLAB
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed">
              Inicia sesión para gestionar tus pedidos mayoristas, fórmulas, etiquetas y rastreo de envíos.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl border border-gray-200 bg-white space-y-5 shadow-xs">
            {authError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {authError}
              </div>
            )}

            {/* Google Quick Sign-In */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold text-xs transition flex items-center justify-center gap-2.5 shadow-2xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase font-bold tracking-wider">
              <span className="flex-1 border-b border-gray-200" />
              <span>O con correo electrónico</span>
              <span className="flex-1 border-b border-gray-200" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  placeholder="tu-correo@empresa.com"
                />
              </div>

              <div>
                <label className="text-gray-700 block mb-1 font-semibold text-[11px]">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center justify-center gap-1.5"
              >
                {authLoading ? "Validando..." : authMode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError(null);
                }}
                className="text-xs text-[#2B5F4A] hover:underline font-semibold transition"
              >
                {authMode === "login" ? "¿No tienes cuenta? Regístrate aquí" : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ━━━━ LOGGED IN: LUXURY CUSTOMER DASHBOARD LAYOUT ━━━━
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      
      {/* ── Top Header Banner ── */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
              <Sparkles className="w-3 h-3 text-[#166534]" /> Portal de Clientes y Formuladores
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Panel de Cuenta
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-light">
              Bienvenido de nuevo, <span className="font-semibold text-gray-900">{user.email}</span>
            </p>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 relative">
            
            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-950 hover:bg-gray-100 transition relative"
              title="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 rounded-2xl bg-white border border-gray-200 shadow-xl p-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex justify-between items-center text-xs font-bold text-gray-950 border-b border-gray-100 pb-2">
                  <span>Notificaciones de Cuenta</span>
                  <span className="text-[#2B5F4A] text-[10px] font-semibold">{unreadCount} Sin leer</span>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No tienes notificaciones pendientes.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1 text-xs">
                        <div className="font-bold text-gray-900 text-[11px]">{n.title}</div>
                        <p className="text-[10px] text-gray-600 leading-relaxed font-light">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sign Out Button */}
            <button
              type="button"
              onClick={() => logout()}
              className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-red-700 hover:border-red-200 hover:bg-red-50 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── Main Layout Body ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="p-2 rounded-2xl border border-gray-200 bg-white space-y-1 shadow-xs">
              {NAV_ITEMS.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition ${
                      isActive
                        ? "bg-[#F0FDF4] text-[#166534] font-bold border border-[#BBF7D0] shadow-2xs"
                        : "text-gray-700 hover:text-gray-950 hover:bg-gray-50 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#166534]" : "text-gray-400"}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-[#166534]" : "opacity-40"}`} />
                  </Link>
                );
              })}
            </div>

            {/* Help & Fast Contact Box */}
            <div className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2 shadow-xs text-xs">
              <div className="font-bold text-gray-950 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#2B5F4A]" /> ¿Necesitas Asesoría?
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed font-light">
                Puedes consultar con nuestro Asistente Olfativo en vivo en la esquina inferior derecha o contactar a soporte.
              </p>
              <Link
                href="/contact"
                className="inline-block text-[11px] font-bold text-[#2B5F4A] hover:underline pt-1"
              >
                Contactar Soporte &rarr;
              </Link>
            </div>
          </aside>

          {/* Dynamic Content Stage */}
          <main className="lg:col-span-9 min-w-0">
            {children}
          </main>

        </div>
      </div>

    </div>
  );
}
