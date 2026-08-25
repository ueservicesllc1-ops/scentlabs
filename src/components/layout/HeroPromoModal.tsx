"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight, Clock, Rocket } from "lucide-react";

export function HeroPromoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(8);

  useEffect(() => {
    // Check if seen in current session
    if (typeof window !== "undefined") {
      const hasSeenModal = sessionStorage.getItem("scentlab_heromodal_seen");
      if (!hasSeenModal) {
        // Show after a slight delay for smooth page entrance
        const openTimer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem("scentlab_heromodal_seen", "true");
        }, 800);
        return () => clearTimeout(openTimer);
      }
    }
  }, []);

  // 8-second auto close countdown
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
        backgroundColor: "rgba(10, 20, 15, 0.85)",
        backdropFilter: "blur(8px)",
        padding: 16,
        animation: "fadeIn 0.3s ease-out",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 680,
          backgroundColor: "#0E1A14",
          border: "1px solid rgba(94, 171, 133, 0.35)",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(94, 171, 133, 0.2)",
          animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Progress Bar (8s Timer) */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "#5EAB85",
              width: `${(secondsRemaining / 8) * 100}%`,
              transition: "width 1s linear",
            }}
          />
        </div>

        {/* Close Button X */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#ffffff",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          aria-label="Cerrar publicidad"
        >
          <X size={18} />
        </button>

        {/* Modal Banner Graphic */}
        <div style={{ position: "relative", width: "100%", maxHeight: 300, overflow: "hidden", backgroundColor: "#060D09" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/heromodal.png"
            alt="Kits para Emprendedores ScentLabs"
            style={{
              width: "100%",
              height: "100%",
              maxHeight: 300,
              objectFit: "cover",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, #0E1A14 5%, transparent 60%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              backgroundColor: "rgba(14, 26, 20, 0.9)",
              border: "1px solid #5EAB85",
              borderRadius: 9999,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#5EAB85",
            }}
          >
            <Rocket size={12} />
            Lanzamiento Oficial
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px 32px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5EAB85" }}>
              NUEVA SECCIÓN DE LA TIENDA
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "rgba(255, 255, 255, 0.4)" }}>
              <Clock size={12} />
              Cierra en {secondsRemaining}s
            </span>
          </div>

          <h2
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#ffffff",
              margin: "0 0 10px",
              lineHeight: 1.2,
              fontFamily: "var(--font-bodoni), Georgia, serif",
            }}
          >
            🚀 Kits para Emprendedores
          </h2>

          <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, margin: "0 0 20px" }}>
            Todo lo necesario para comenzar tu negocio de perfumería. Prepara tus primeros{" "}
            <strong style={{ color: "#ffffff" }}>6 perfumes de 50 ml</strong> con botellas oficiales, 2 esencias a elegir, base alcohólica y herramientas.
          </p>

          {/* Pricing & Potential Callout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 12,
              padding: "12px 18px",
              marginBottom: 22,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255, 255, 255, 0.4)" }}>
                Inversión Inicial
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#5EAB85" }}>
                $49.99 <span style={{ fontSize: 12, fontWeight: 400, color: "rgba(255, 255, 255, 0.5)" }}>USD</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em", color: "#E0B354", fontWeight: 700 }}>
                Ventas Potenciales
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
                Hasta $120.00*
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link
              href="/kits"
              onClick={() => setIsOpen(false)}
              style={{
                flex: 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: "#2B5F4A",
                color: "#ffffff",
                padding: "14px 24px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                boxShadow: "0 4px 14px rgba(43, 95, 74, 0.5)",
                transition: "all 0.2s ease",
              }}
            >
              <span>Ver Kits Emprendedor</span>
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                padding: "14px 20px",
                backgroundColor: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "rgba(255, 255, 255, 0.6)",
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
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
          from { opacity: 0; transform: scale(0.94); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
