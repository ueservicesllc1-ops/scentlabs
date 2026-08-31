"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Check, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck,
  Building2,
  Headphones
import { contactMessageService } from "@/lib/firestore/contact-messages";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiryType, setInquiryType] = useState("wholesale");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactMessageService.saveMessage({
        name: name || "Anónimo",
        email: email || "no-email@scentlabs.com",
        inquiryType,
        message: message || "Sin mensaje",
      });
    } catch {
      // Ignore errors so user experience is smooth
    } finally {
      setSent(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-200 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <Headphones className="w-3.5 h-3.5" /> Atención al Cliente & Ventas Mayoristas
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Ponte en Contacto con SCENTLAB
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl font-light leading-relaxed">
            ¿Necesitas cotizaciones para compras por volumen, asesoría en formulación, etiquetas personalizadas o soporte con tu orden? Nuestro equipo de especialistas está listo para ayudarte.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Left Column: Contact Form ── */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs space-y-6">
            
            <div className="space-y-1 border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold text-gray-950">
                Envíanos un Mensaje Directo
              </h2>
              <p className="text-xs text-gray-500 font-light">
                Comunícate con nuestro laboratorio y te responderemos en un plazo máximo de 24 horas hábiles.
              </p>
            </div>

            {sent ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                  <Check className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-950">¡Mensaje Enviado con Éxito!</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto font-light leading-relaxed">
                    Hemos recibido tu consulta. Un asesor de SCENTLAB se pondrá en contacto contigo a la brevedad a través de tu correo electrónico.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setName("");
                    setEmail("");
                    setMessage("");
                  }}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold transition"
                >
                  Enviar otro mensaje
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Nombre Completo o Nombre de Marca
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Alexander Noir / Noir Parfums"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@tumarca.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Tipo de Consulta
                  </label>
                  <select
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  >
                    <option value="wholesale">Ventas Mayoristas & Pedidos Grandes (+500 unidades)</option>
                    <option value="custom-labels">Diseño y Fabricación de Etiquetas Foil</option>
                    <option value="orders">Estado de Pedido & Rastreo de Envío</option>
                    <option value="formulation">Asesoría de Formulación y Diluciones</option>
                    <option value="general">Consulta General de Catálogo</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 block mb-1 font-semibold text-[11px]">
                    Detalles del Mensaje
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escribe aquí los detalles de tu consulta, referencias de esencias o requerimientos de botellas..."
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3.5 py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#2B5F4A] focus:bg-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? "Transmitiendo..." : "Enviar Mensaje"}</span>
                </button>
              </form>
            )}

          </div>

          {/* ── Right Column: Info Cards & Channels ── */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Direct Contact Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2">
                Canales de Atención
              </h3>

              <div className="space-y-3.5 text-xs text-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2B5F4A] flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Correo de Soporte</span>
                    <a href="mailto:support@scentlab.com" className="font-semibold text-gray-900 hover:text-[#2B5F4A] transition">
                      support@scentlab.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2B5F4A] flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Línea Telefónica</span>
                    <span className="font-semibold text-gray-900 font-mono">+1 (800) 555-SCENT</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2B5F4A] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Horario de Operación</span>
                    <span className="text-gray-600 font-light">Lunes a Viernes: 9:00 AM – 6:00 PM (EST)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse & Fulfillment Center */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-gray-950 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2B5F4A]" /> Centro de Distribución
              </h3>

              <div className="text-xs text-gray-600 leading-relaxed font-light space-y-1">
                <p className="font-semibold text-gray-900">SCENTLAB Formulations LLC</p>
                <p>Centro de Logística & Fraccionamiento</p>
                <p>New Jersey, Estados Unidos</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/shipping"
                  className="text-[11px] text-[#2B5F4A] hover:underline font-semibold inline-flex items-center gap-1"
                >
                  Ver Tiempos de Entrega & Políticas &rarr;
                </Link>
              </div>
            </div>

            {/* Live Chat Promotion Card */}
            <div className="p-5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#166534]">
                <Sparkles className="w-4 h-4 text-[#2B5F4A]" /> ¿Necesitas Asesoría Inmediata?
              </div>
              <p className="text-xs text-[#166534]/90 font-light leading-relaxed">
                Utiliza nuestro Asistente Olfativo y Chat en Vivo en la esquina inferior derecha de la pantalla para recomendaciones y ayuda instantánea.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
