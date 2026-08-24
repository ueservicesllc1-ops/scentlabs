import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Lock, Shield, EyeOff, Server, FileCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad y Protección de Datos | SCENTLAB",
  description: "Conoce cómo protegemos tu información personal, pagos cifrados con Stripe y cumplimiento estricto de privacidad en SCENTLAB.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* ── Header ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <Lock className="w-3.5 h-3.5" /> Seguridad & Privacidad de Datos
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Política de Privacidad
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Última actualización: Agosto 2026 &bull; SCENTLAB Formulations LLC
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-10 leading-relaxed text-sm text-gray-700">

        {/* ── Highlight Badges ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <EyeOff className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">No vendemos tus datos</h3>
            <p className="text-xs text-gray-600 font-light">
              Tu información personal y comercial nunca es compartida ni vendida a terceros para publicidad.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <Shield className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">Pagos Cifrados SSL/Stripe</h3>
            <p className="text-xs text-gray-600 font-light">
              Procesamiento de pagos con estándar bancario PCI-DSS Nivel 1. No almacenamos tarjetas de crédito.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <Server className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">Servidores Seguros</h3>
            <p className="text-xs text-gray-600 font-light">
              Infraestructura en la nube con cifrado de extremo a extremo y autenticación protegida.
            </p>
          </div>
        </div>

        {/* ── Section 1: Información que Recopilamos ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">1. Información que Recopilamos</h2>
          <p>
            Recopilamos la información estrictamente necesaria para procesar tus pedidos mayoristas, calcular envíos y brindarte asistencia personalizada:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
            <li><strong>Datos de contacto e identidad:</strong> Nombre, correo electrónico, número de teléfono y nombre de tu marca/empresa.</li>
            <li><strong>Dirección de envío y facturación:</strong> Calle, ciudad, estado, código postal y país para el despacho mediante USPS/UPS.</li>
            <li><strong>Historial de pedidos y compras:</strong> Productos adquiridos, cantidades, volúmenes de esencias y comprobantes de pago.</li>
          </ul>
        </section>

        {/* ── Section 2: Uso de la Información ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">2. Cómo Utilizamos tu Información</h2>
          <p>Utilizamos tus datos únicamente para los siguientes fines:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
            <li>Procesar, preparar y despachar tus pedidos de esencias, botellas y suministros.</li>
            <li>Enviarte actualizaciones automáticas con el número de rastreo de tu paquete.</li>
            <li>Atender tus consultas a través de nuestro equipo de soporte o Asistente de IA.</li>
            <li>Prevenir fraudes y asegurar el cumplimiento de normativas fiscales y comerciales.</li>
          </ul>
        </section>

        {/* ── Section 3: Seguridad de Pagos con Stripe ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">3. Seguridad de Pagos (Stripe Inc.)</h2>
          <p>
            Todas las transacciones con tarjeta de crédito o débito son procesadas directamente por <strong>Stripe Inc.</strong> bajo los más estrictos estándares internacionales de seguridad <strong>PCI-DSS Nivel 1</strong>. SCENTLAB jamás tiene acceso ni almacena los números completos de tu tarjeta de crédito o códigos CVV en nuestros servidores.
          </p>
        </section>

        {/* ── Section 4: Cookies ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">4. Uso de Cookies y Sesión</h2>
          <p>
            Utilizamos cookies técnicas y funcionales esenciales para mantener los artículos en tu carrito de compras mientras navegas, recordar tus preferencias de sesión e interactuar con nuestro Asistente Olfativo. Puedes desactivar las cookies en tu navegador, aunque algunas funciones de compra podrían verse limitadas.
          </p>
        </section>

        {/* ── Section 5: Tus Derechos ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">5. Tus Derechos sobre tus Datos</h2>
          <p>
            Tienes derecho en cualquier momento a solicitar el acceso, corrección o eliminación total de tus datos personales de nuestra base de datos. Para ejercer cualquiera de estos derechos, escríbenos a <a href="mailto:privacy@scentlab.com" className="text-[#2B5F4A] underline font-semibold">privacy@scentlab.com</a> y responderemos en un plazo máximo de 48 horas hábiles.
          </p>
        </section>

        {/* ── Contact Box ── */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-3 mt-12">
          <h3 className="font-bold text-gray-950 text-base">¿Tienes preguntas sobre la privacidad de tu cuenta?</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Estamos comprometidos con la total transparencia y seguridad de tus datos.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-semibold rounded-lg transition shadow-xs"
          >
            Contactar Oficial de Privacidad
          </Link>
        </div>

      </div>

    </div>
  );
}
