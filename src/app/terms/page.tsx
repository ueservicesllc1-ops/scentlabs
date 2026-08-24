import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, Scale, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones de Servicio | SCENTLAB",
  description: "Términos y condiciones legales, directrices de uso, pureza Grado A, exención de responsabilidad de marcas registradas y políticas comerciales de SCENTLAB.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      
      {/* ── Header ── */}
      <div className="bg-gray-50 border-b border-gray-200 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-200/80 text-gray-800 border border-gray-300">
            <Scale className="w-3.5 h-3.5" /> Términos Legales & Comerciales
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Términos y Condiciones de Servicio
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-light">
            Última actualización: Agosto 2026 &bull; SCENTLAB Formulations LLC
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12 space-y-10 leading-relaxed text-sm text-gray-700">

        {/* ── Overview ── */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-950">1. Aceptación de los Términos</h2>
          <p>
            Al acceder, navegar o realizar compras en el sitio web de <strong>SCENTLAB</strong> (<span className="text-[#2B5F4A] font-semibold">scentlabs.com</span>), usted acepta regirse por los presentes Términos y Condiciones, así como por nuestra <Link href="/privacy" className="text-[#2B5F4A] underline font-semibold">Política de Privacidad</Link> y <Link href="/shipping" className="text-[#2B5F4A] underline font-semibold">Políticas de Envío</Link>. Si no está de acuerdo con alguna parte de estos términos, le solicitamos abstenerse de utilizar nuestros servicios.
          </p>
        </section>

        {/* ── Section 2: Naturaleza de los Productos y Pureza ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">2. Calidad de los Productos y Pureza Grado A</h2>
          <p>
            SCENTLAB comercializa aceites de fragancia puros concentrados (Grado A, sin diluir/uncut), botellas de vidrio, suministros de laboratorio y etiquetas personalizadas destinados a la formulación artesanal, comercial o personal de perfumería, cosmética, velas y difusores.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
            <li>Nuestros aceites son materias primas de grado cosmético de alta concentración.</li>
            <li>No deben ser ingeridos ni aplicados directamente en ojos o mucosas sin la dilución adecuada.</li>
            <li>El usuario es responsable de realizar pruebas de compatibilidad y parche cutáneo antes de la comercialización o uso masivo.</li>
          </ul>
        </section>

        {/* ── Section 3: Deslinde de Marcas Registradas (Inspiraciones / Types) ── */}
        <section className="space-y-4 border-t border-gray-100 pt-8">
          <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
            <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-700" /> 3. Descargo de Responsabilidad de Marcas Registradas (Fragancias &quot;Type&quot;)
            </h2>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-light">
              Los nombres de marcas comerciales, diseñadores y perfumes famosos (como por ejemplo <em>Tom Ford, Creed, Dior, Chanel, Maison Francis Kurkdjian, Baccarat Rouge, Le Labo, Kilian, Xerjoff, Yves Saint Laurent</em>, etc.) mencionados en este sitio web son marcas comerciales registradas y propiedad exclusiva de sus respectivos fabricantes y diseñadores.
            </p>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-light">
              <strong>SCENTLAB NO tiene afiliación, patrocinio, respaldo ni conexión comercial con dichas marcas.</strong> Cualquier mención se hace únicamente con fines de <strong>referencia y comparación olfativa</strong> bajo la doctrina legal de <em>uso legítimo nominativo (Nominative Fair Use)</em> para describir al cliente el perfil de notas aromáticas de nuestras formulaciones tipo.
            </p>
          </div>
        </section>

        {/* ── Section 4: Precios y Pagos ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">4. Precios, Pagos y Facturación</h2>
          <p>
            Todos los precios están expresados en Dólares Estadounidenses (USD). Los pagos se procesan de forma cifrada y segura a través de <strong>Stripe</strong>. Nos reservamos el derecho de modificar precios o corregir errores tipográficos involuntarios en cualquier momento sin previo aviso.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
            <li>Las órdenes son confirmadas una vez que el emisor de la tarjeta aprueba la transacción.</li>
            <li>Las compras a partir de <strong>$250.00 USD</strong> califican automáticamente para <strong>Envío Gratis</strong> a EE. UU. y Puerto Rico.</li>
          </ul>
        </section>

        {/* ── Section 5: Envíos y Reemplazos ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">5. Envíos y Reemplazos por Daño</h2>
          <p>
            Los despachos se realizan en 24-48 horas hábiles desde Miami, Florida mediante USPS o UPS. En caso de recibir artículos dañados en tránsito o derrames, el cliente debe reportarlo dentro de los primeros 5 días hábiles a <a href="mailto:support@scentlab.com" className="text-[#2B5F4A] underline font-semibold">support@scentlab.com</a> con fotos de respaldo para recibir un reemplazo sin costo. Consulte los detalles completos en nuestras <Link href="/shipping" className="text-[#2B5F4A] underline font-semibold">Políticas de Envío</Link>.
          </p>
        </section>

        {/* ── Section 6: Limitación de Responsabilidad ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">6. Limitación de Responsabilidad</h2>
          <p>
            En la máxima medida permitida por la ley aplicable, SCENTLAB Formulations LLC no será responsable por daños indirectos, incidentales, punitivos o consecuentes derivados del mal uso, almacenamiento inadecuado o formulaciones defectuosas realizadas por terceros con los productos adquiridos.
          </p>
        </section>

        {/* ── Section 7: Ley Aplicable ── */}
        <section className="space-y-3 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-bold text-gray-950">7. Ley Aplicable y Jurisdicción</h2>
          <p>
            Estos términos se rigen e interpretan de acuerdo con las leyes del Estado de Florida, Estados Unidos, sin perjuicio de sus disposiciones sobre conflicto de leyes.
          </p>
        </section>

        {/* ── Contact Box ── */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-3 mt-12">
          <h3 className="font-bold text-gray-950 text-base">¿Dudas sobre nuestros términos y condiciones?</h3>
          <p className="text-xs text-gray-600 max-w-md mx-auto">
            Comunícate con nuestro equipo legal y de atención al cliente para cualquier consulta.
          </p>
          <Link
            href="/contact"
            className="inline-block px-5 py-2 bg-[#2B5F4A] hover:bg-[#1E4233] text-white text-xs font-semibold rounded-lg transition shadow-xs"
          >
            Formulario de Contacto
          </Link>
        </div>

      </div>

    </div>
  );
}
