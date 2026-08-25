import React from "react";
import Link from "next/link";
import { FlaskConical, ShieldCheck, Box, Sparkles, ArrowRight, CheckCircle2, Award, Truck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre SCENTLAB | Proveedor de Insumos y Esencias de Perfumería",
  description: "Conoce más sobre SCENTLAB: más de 1,390 esencias puras Grado A, frascos de laboratorio, suministros y etiquetas personalizadas para perfumistas y marcas.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      
      {/* ── Header Banner ── */}
      <div className="bg-white border-b border-gray-200 py-16 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#F0FDF4] text-[#166534] border border-[#BBF7D0]">
            <Sparkles className="w-3.5 h-3.5" /> Filosofía & Misión SCENTLAB
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-950">
            Todo lo que necesitas para crear, envasar y comercializar tus propios perfumes.
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl font-light leading-relaxed">
            SCENTLAB es una plataforma especializada en materias primas de perfumería fina, suministros de laboratorio y soluciones de empaque para perfumistas independientes, creadores y marcas de fragancias.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        
        {/* ── 3 Core Pillars ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 bg-white space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2B5F4A] flex items-center justify-center">
              <Box className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-950 text-base">Fraccionamiento a Medida</h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Adquirimos concentrados y botellas directamente de fabricantes en grandes volúmenes y los fraccionamos en presentaciones útiles desde 1 oz hasta 16 oz, sin requerir pedidos mínimos gigantescos.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2B5F4A] flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-950 text-base">Pureza Grado A Sin Cortar</h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Nuestros aceites son 100% concentrados puros sin diluir (uncut), formulados para ofrecer la máxima proyección, estela y fijación en perfumes Eau de Parfum y Extrait.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200 bg-white space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2B5F4A] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-950 text-base">Compatibilidad de Envases</h3>
            <p className="text-xs text-gray-600 font-light leading-relaxed">
              Cada botella y atomizador de nuestro catálogo ha sido probado en laboratorio contra alcoholes de perfumería y aceites para asegurar sellado hermético libre de fugas.
            </p>
          </div>
        </div>

        {/* ── Quality Standards Box ── */}
        <div className="p-8 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#166534] uppercase tracking-wider">
              <Award className="w-4 h-4 text-[#2B5F4A]" /> Estándares de Laboratorio
            </div>
            <h2 className="text-2xl font-bold text-gray-950 tracking-tight">
              Diseñado para Creadores y Nuevas Marcas de Perfumería
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed max-w-3xl">
              Eliminamos las barreras de entrada para quienes desean lanzar su propia línea de fragancias. En SCENTLAB encuentras en un solo lugar las esencias de más alta demanda, las botellas de vidrio más elegantes, etiquetas personalizadas con acabado foil y herramientas de medición precisas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-gray-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2B5F4A] shrink-0 mt-0.5" />
              <span>Más de 1,390 esencias puras organizadas por familias olfativas.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2B5F4A] shrink-0 mt-0.5" />
              <span>Envío gratis a todo Estados Unidos y Puerto Rico en compras desde $250.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2B5F4A] shrink-0 mt-0.5" />
              <span>Despacho rápido en 24 a 48 horas desde New Jersey.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#2B5F4A] shrink-0 mt-0.5" />
              <span>Asesoría en línea y soporte para formulación de mezclas.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4">
            <Link
              href="/fragrance"
              className="px-5 py-2.5 rounded-xl bg-[#2B5F4A] hover:bg-[#1E4233] text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center gap-2"
            >
              Explorar Esencias <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 font-semibold text-xs transition"
            >
              Contactar al Equipo
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
