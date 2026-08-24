import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, PackageCheck, AlertCircle, Sparkles, MapPin, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Políticas de Envío y Devoluciones | SCENTLAB",
  description: "Información sobre envíos gratis a partir de $250, tiempos de entrega de 24-48h desde Miami, empaque hermético y garantías de satisfacción.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* ── Header Banner ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <Truck className="w-3.5 h-3.5" /> Logística & Fulfillment SCENTLAB
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Políticas de Envío y Devoluciones
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl font-light leading-relaxed">
            Envíos rápidos y seguros a todo Estados Unidos y Puerto Rico desde nuestro centro de formulación y distribución en Miami, Florida.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-12 leading-relaxed text-sm text-gray-700">

        {/* ── Free Shipping Highlight ── */}
        <div className="p-6 sm:p-8 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#166534] font-bold text-base sm:text-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
              ¡ENVÍO GRATIS EN ÓRDENES DESDE $250!
            </div>
            <p className="text-xs sm:text-sm text-[#166534]/90 font-light max-w-xl">
              Todas las compras que alcancen o superen los <strong>$250.00 USD</strong> (subtotal antes de impuestos) califican automáticamente para envío estándar gratuito a los 50 estados de EE. UU. y Puerto Rico.
            </p>
          </div>
          <Link
            href="/fragrance"
            className="px-5 py-2.5 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs shrink-0 inline-flex items-center gap-1.5"
          >
            Explorar Catálogo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Key Highlights Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <Clock className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">Despacho en 24-48h</h3>
            <p className="text-xs text-gray-600 font-light">
              Procesamos y fraccionamos tu pedido de lunes a viernes en nuestro laboratorio en Miami.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <PackageCheck className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">Empaque Antifugas</h3>
            <p className="text-xs text-gray-600 font-light">
              Botellas de plástico transparente con tapa de seguridad hermética y protección térmica.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
            <MapPin className="w-6 h-6 text-[#2B5F4A]" />
            <h3 className="font-bold text-gray-950 text-sm">Rastreo en Tiempo Real</h3>
            <p className="text-xs text-gray-600 font-light">
              Recibes un número de tracking de USPS o UPS en tu email apenas tu paquete sale del almacén.
            </p>
          </div>
        </div>

        {/* ── Section 1: Tiempos y Transportistas ── */}
        <section className="space-y-4 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
            1. Tiempos de Procesamiento y Tránsito
          </h2>
          <p>
            Todos los pedidos son fraccionados, etiquetados y embalados con altos estándares de control de calidad.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm text-gray-600">
            <li>
              <strong>Tiempo de preparación (Fulfillment):</strong> 1 a 2 días hábiles posteriores a la confirmación del pago.
            </li>
            <li>
              <strong>Tiempo de entrega (Tránsito):</strong>
              <ul className="list-circle pl-5 mt-1 space-y-1 text-gray-600">
                <li><strong>USPS Ground Advantage / UPS Ground:</strong> 2 a 5 días hábiles (según el estado de destino).</li>
                <li><strong>USPS Priority Mail / Express:</strong> 1 a 3 días hábiles.</li>
              </ul>
            </li>
            <li>
              <strong>Destinos cubiertos:</strong> Enviamos a todos los estados de EE. UU., bases militares APO/FPO y Puerto Rico.
            </li>
          </ul>
        </section>

        {/* ── Section 2: Tarifas y Cálculo ── */}
        <section className="space-y-4 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-950">
            2. Costos de Flete para Órdenes Menores a $250
          </h2>
          <p>
            Para órdenes menores a $250, el costo de envío se calcula automáticamente en la pantalla de pago (Checkout) mediante nuestra integración oficial con <strong>Shippo</strong>, obteniendo las tarifas mayoristas más económicas y competitivas del mercado en tiempo real según el peso exacto de tu paquete y tu código postal.
          </p>
        </section>

        {/* ── Section 3: Empaque y Conservación ── */}
        <section className="space-y-4 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-950">
            3. Estándar de Empaque de Esencias
          </h2>
          <p>
            Las esencias puras Grado A de SCENTLAB se despachan en <strong>botellas de plástico transparente de alta densidad química</strong> con tapa de seguridad hermética (sellada antifugas) en presentaciones de 1 oz, 2 oz, 4 oz, 8 oz y 16 oz, protegidas con plástico de burbuja y material absorbente para garantizar que lleguen intactas.
          </p>
        </section>

        {/* ── Section 4: Devoluciones y Garantía de Daños ── */}
        <section className="space-y-4 border-t border-gray-100 pt-8">
          <h2 className="text-xl font-bold text-gray-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#2B5F4A]" /> 4. Garantía de Entrega y Política de Devoluciones
          </h2>
          <div className="space-y-3">
            <p>
              Debido a que nuestros aceites de fragancia son materias primas químicas de uso cosmético y perfumería pura, <strong>no aceptamos devoluciones de botellas abiertas o deselladas</strong> por motivos de seguridad sanitaria y pureza del producto.
            </p>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-900 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700" /> ¿Tu paquete sufrió algún daño en tránsito o faltó un artículo?
              </div>
              <p>
                Si recibes un producto con derrame o daño atribuible al transporte, simplemente envíanos una foto clara dentro de los <strong>primeros 5 días hábiles</strong> de haber recibido tu paquete a <a href="mailto:support@scentlab.com" className="underline font-semibold">support@scentlab.com</a> o por WhatsApp/contacto. <strong>Te enviaremos un reemplazo inmediato sin costo adicional o te acreditaremos el valor.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── Contact Footer Box ── */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-3">
          <h3 className="font-bold text-gray-950 text-base">¿Tienes preguntas sobre el estado de tu envío?</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Nuestro equipo de logística y atención al cliente está a tu disposición para ayudarte con cualquier consulta.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/contact"
              className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition"
            >
              Contactar Soporte
            </Link>
            <Link
              href="/account"
              className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-semibold rounded-lg transition"
            >
              Ver Mis Pedidos
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
