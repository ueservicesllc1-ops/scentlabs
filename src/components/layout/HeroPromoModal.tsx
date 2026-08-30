"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight, Clock, ShoppingBag } from "lucide-react";

const DURATION_SECONDS = 15;

export function HeroPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(DURATION_SECONDS);

  useEffect(() => {
    // Always show on page load/refresh as requested
    const openTimer = setTimeout(() => {
      setIsOpen(true);
      setSecondsRemaining(DURATION_SECONDS);
    }, 400);

    return () => clearTimeout(openTimer);
  }, []);

  // 15-second auto close countdown
  useEffect(() => {
    if (!isOpen) return;

    if (secondsRemaining <= 0) {
      setIsOpen(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(5, 12, 8, 0.88)",
        backdropFilter: "blur(10px)",
        padding: "16px",
        animation: "fadeIn 0.25s ease-out",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 580,
          maxHeight: "92vh",
          backgroundColor: "#0B1510",
          border: "1px solid rgba(94, 171, 133, 0.4)",
          borderRadius: 18,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 70px -10px rgba(0, 0, 0, 0.9), 0 0 50px rgba(94, 171, 133, 0.25)",
          animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top 15-Second Animated Progress Bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            zIndex: 30,
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#5EAB85",
              width: `${(secondsRemaining / DURATION_SECONDS) * 100}%`,
              transition: "width 1s linear",
            }}
          />
        </div>

        {/* Close Button X (Prominent, High Contrast) */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            color: "#ffffff",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            transition: "all 0.2s ease",
          }}
          aria-label="Cerrar publicidad"
        >
          <X size={20} />
        </button>

        {/* Full Image Banner - No cropping, showing entire graphic */}
        <div
          style={{
            position: "relative",
            width: "100%",
            backgroundColor: "#060D09",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/heromodal.png"
            alt="Kits para Emprendedores — Scentlabs Supply"
            style={{
              width: "100%",
              height: "auto",
              maxHeight: "58vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        </div>

        {/* Bottom Bar with CTA and Countdown */}
        <div
          style={{
            padding: "16px 20px 20px",
            backgroundColor: "#0B1510",
            borderTop: "1px solid rgba(94, 171, 133, 0.25)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.6)" }}>
            <span style={{ fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#5EAB85" }}>
              🚀 Kits para Emprendedores · $49.99
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} color="#5EAB85" />
              Cierra en {secondsRemaining}s
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <Link
              href="/kits"
              onClick={() => setIsOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#2B5F4A] hover:bg-[#224b3b] text-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold tracking-wide uppercase no-underline shadow-lg transition"
            >
              <ShoppingBag size={16} />
              <span>Ver Kits y Elegir Fragancias</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white/80 rounded-xl text-xs font-semibold cursor-pointer transition text-center"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
