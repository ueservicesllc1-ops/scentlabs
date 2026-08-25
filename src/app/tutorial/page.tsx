"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calculator,
  Droplets,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShoppingBag,
  HelpCircle,
  Clock,
  FlaskConical,
  Layers,
  Thermometer,
  Eye,
  ShieldCheck,
  Check,
  Copy
} from "lucide-react";

interface ConcentrationPreset {
  id: string;
  name: string;
  shortName: string;
  percentage: number;
  description: string;
  duration: string;
  recommendedFor: string;
  badge?: string;
  color: string;
}

const CONCENTRATION_PRESETS: ConcentrationPreset[] = [
  {
    id: "edc",
    name: "Eau de Cologne (EDC)",
    shortName: "EDC (5%)",
    percentage: 5,
    description: "Ligera, ultra refrescante y cítrica. Ideal para después del baño o climas muy calurosos.",
    duration: "1 a 2 horas",
    recommendedFor: "Colonias de baño, body splash y frescura ligera.",
    color: "#5B9279",
  },
  {
    id: "edt",
    name: "Eau de Toilette (EDT)",
    shortName: "EDT (12%)",
    percentage: 12,
    description: "Fresca y versátil con proyección moderada. Ideal para uso diario y días cálidos.",
    duration: "3 a 4 horas",
    recommendedFor: "Uso diario, oficina y fragancias frescas.",
    color: "#4A6E8C",
  },
  {
    id: "edp",
    name: "Eau de Parfum (EDP)",
    shortName: "EDP (20%)",
    percentage: 20,
    description: "El estándar de la alta perfumería de diseñador. Excelente estela y duración prolongada.",
    duration: "6 a 8 horas",
    recommendedFor: "Eventos, noche y perfumes de diseñador.",
    color: "#2B5F4A",
  },
  {
    id: "parfum",
    name: "Extrait de Parfum / Parfum",
    shortName: "Extrait (30%)",
    percentage: 30,
    description: "Concentración oficial Scentlabs Supply. Nivel nicho, máxima fijación, densidad y presencia olfativa.",
    duration: "10 a 14+ horas",
    recommendedFor: "Líneas de nicho, alta gama y máxima duración.",
    badge: "⭐ ESTÁNDAR SCENTLABS",
    color: "#1E4735",
  },
  {
    id: "elixir",
    name: "Elixir / Ultra Concentré",
    shortName: "Elixir (38%)",
    percentage: 38,
    description: "Intensidad titánica con notas amaderadas y ambaradas oscuras. Proyección atómica.",
    duration: "14 a 24 horas",
    recommendedFor: "Ediciones especiales, clima frío y potencia extrema.",
    badge: "MÁXIMA POTENCIA",
    color: "#6D2B75",
  },
];

export default function PerfumeTutorialPage() {
  // Calculator State
  const [selectedPresetId, setSelectedPresetId] = useState<string>("parfum");
  const [customPercentage, setCustomPercentage] = useState<number>(30);
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Volume Mode: 'total' or 'bottles'
  const [volumeMode, setVolumeMode] = useState<"total" | "bottles">("total");
  const [totalVolumeMl, setTotalVolumeMl] = useState<number>(50);
  const [bottleCount, setBottleCount] = useState<number>(6);
  const [bottleSizeMl, setBottleSizeMl] = useState<number>(50);
  const [copiedFormula, setCopiedFormula] = useState<boolean>(false);

  // Active Percentage
  const activePercentage = useMemo(() => {
    if (isCustom) return customPercentage;
    const preset = CONCENTRATION_PRESETS.find((p) => p.id === selectedPresetId);
    return preset ? preset.percentage : 30;
  }, [isCustom, customPercentage, selectedPresetId]);

  // Effective Total Volume in ML
  const effectiveTotalMl = useMemo(() => {
    if (volumeMode === "bottles") {
      return bottleCount * bottleSizeMl;
    }
    return Math.max(1, totalVolumeMl);
  }, [volumeMode, totalVolumeMl, bottleCount, bottleSizeMl]);

  // Calculated Quantities
  const fragranceOilMl = useMemo(() => {
    return Number(((effectiveTotalMl * activePercentage) / 100).toFixed(2));
  }, [effectiveTotalMl, activePercentage]);

  const alcoholBaseMl = useMemo(() => {
    return Number((effectiveTotalMl - fragranceOilMl).toFixed(2));
  }, [effectiveTotalMl, fragranceOilMl]);

  const fragranceOilOz = useMemo(() => {
    return Number((fragranceOilMl / 29.5735).toFixed(2));
  }, [fragranceOilMl]);

  const alcoholBaseOz = useMemo(() => {
    return Number((alcoholBaseMl / 29.5735).toFixed(2));
  }, [alcoholBaseMl]);

  const activePreset = CONCENTRATION_PRESETS.find((p) => p.id === selectedPresetId);

  const handleCopyFormula = () => {
    const text = `Fórmula de Perfumería SCENTLABS:
Concentración: ${isCustom ? `${customPercentage}% (Personalizada)` : activePreset?.name} (${activePercentage}%)
Volumen Total: ${effectiveTotalMl} ml (${(effectiveTotalMl / 29.5735).toFixed(2)} oz)
${volumeMode === "bottles" ? `Presentación: ${bottleCount} botellas de ${bottleSizeMl} ml\n` : ""}
- Esencia Pura: ${fragranceOilMl} ml (~${fragranceOilOz} oz)
- Base Alcohólica: ${alcoholBaseMl} ml (~${alcoholBaseOz} oz)
Tiempo de Maceración Recomendado: 7 a 14 días.`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedFormula(true);
      setTimeout(() => setCopiedFormula(false), 2500);
    }
  };

  return (
    <div style={{ backgroundColor: "#FBFBFA", minHeight: "100vh", color: "#1A1A1A" }}>
      
      {/* ── Hero Header ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #07120D 0%, #0E1A14 60%, #172D23 100%)",
          color: "#ffffff",
          padding: "56px 24px 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 780 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(94, 171, 133, 0.15)",
                border: "1px solid rgba(94, 171, 133, 0.35)",
                padding: "6px 14px",
                borderRadius: 9999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#5EAB85",
                marginBottom: 20,
              }}
            >
              <FlaskConical size={14} />
              Academia Scentlabs · Guía Maestra & Calculadora
            </div>

            <h1
              style={{
                fontSize: "clamp(30px, 4.5vw, 50px)",
                fontWeight: 700,
                lineHeight: 1.15,
                margin: "0 0 18px",
                fontFamily: "var(--font-bodoni), Georgia, serif",
                letterSpacing: "-0.01em",
              }}
            >
              CÓMO HACER PERFUMES PROFESIONALES
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.8)", margin: "0 0 32px" }}>
              Domina la ciencia del compounding de fragancias: proporciones exactas de esencia y base alcohólica, técnicas de maceración en frío y cálculo de formulaciones para tu marca.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#calculadora"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#5EAB85",
                  color: "#0E1A14",
                  padding: "14px 26px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(94, 171, 133, 0.35)",
                  transition: "all 0.2s",
                }}
              >
                <Calculator size={17} />
                <span>Calculadora de Fórmulas</span>
              </a>

              <a
                href="#paso-a-paso"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  padding: "14px 22px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <BookOpen size={17} color="#5EAB85" />
                <span>Tutorial Paso a Paso</span>
              </a>

              <Link
                href="/kits"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "transparent",
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "14px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "underline",
                }}
              >
                Ver Kits para Emprendedores
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CALCULADORA INTERACTIVA ── */}
      <section id="calculadora" style={{ maxWidth: 1200, margin: "-30px auto 70px", padding: "0 24px", position: "relative", zIndex: 10 }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(43, 95, 74, 0.06)",
            border: "1px solid #E5E9E7",
            padding: "36px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2B5F4A", display: "block", marginBottom: 4 }}>
                HERRAMIENTA DE LABORATORIO
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: "#0E1A14", margin: 0, fontFamily: "var(--font-bodoni), Georgia, serif" }}>
                Calculadora de Concentración y Fórmulas
              </h2>
            </div>

            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, backgroundColor: "#F0F5F2", padding: "6px 14px", borderRadius: 9999, fontSize: 12, color: "#2B5F4A", fontWeight: 600 }}>
              <Sparkles size={14} />
              Cálculo de Proporciones en Tiempo Real
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 40 }} className="calc-grid">
            
            {/* Left Controls */}
            <div>
              {/* STEP 1: Choose Concentration */}
              <div style={{ marginBottom: 26 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333333", marginBottom: 12 }}>
                  1. Selecciona el Tipo de Perfume / Concentración:
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }} className="preset-grid">
                  {CONCENTRATION_PRESETS.map((preset) => {
                    const isSelected = !isCustom && selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setIsCustom(false);
                        }}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 10,
                          border: isSelected ? "2px solid #2B5F4A" : "1px solid #E0E0E0",
                          backgroundColor: isSelected ? "#F2F8F5" : "#ffffff",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          position: "relative",
                        }}
                      >
                        {preset.badge && (
                          <div
                            style={{
                              position: "absolute",
                              top: -8,
                              right: 8,
                              backgroundColor: "#2B5F4A",
                              color: "#ffffff",
                              fontSize: 8,
                              fontWeight: 800,
                              letterSpacing: "0.1em",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {preset.badge}
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0E1A14" }}>{preset.name}</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#2B5F4A" }}>{preset.percentage}%</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666666", lineHeight: 1.3 }}>
                          ⏱ Duración: {preset.duration}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Percentage Toggle */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: isCustom ? "2px solid #2B5F4A" : "1px solid #E0E0E0",
                    backgroundColor: isCustom ? "#F2F8F5" : "#FAFAFA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="radio"
                      id="custom_radio"
                      name="preset_radio"
                      checked={isCustom}
                      onChange={() => setIsCustom(true)}
                      style={{ cursor: "pointer", accentColor: "#2B5F4A" }}
                    />
                    <label htmlFor="custom_radio" style={{ fontSize: 12, fontWeight: 700, color: "#333333", cursor: "pointer" }}>
                      Porcentaje Personalizado (%):
                    </label>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={customPercentage}
                      disabled={!isCustom}
                      onChange={(e) => {
                        setIsCustom(true);
                        setCustomPercentage(Number(e.target.value));
                      }}
                      style={{ width: 140, cursor: isCustom ? "pointer" : "not-allowed", accentColor: "#2B5F4A" }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 800, color: isCustom ? "#2B5F4A" : "#888888", width: 40, textAlign: "right" }}>
                      {customPercentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* STEP 2: Volume Input */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333333" }}>
                    2. Cantidad que deseas preparar:
                  </label>

                  {/* Mode switcher */}
                  <div style={{ display: "flex", gap: 4, backgroundColor: "#EAEAEA", padding: 3, borderRadius: 6 }}>
                    <button
                      type="button"
                      onClick={() => setVolumeMode("total")}
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: volumeMode === "total" ? "#ffffff" : "transparent",
                        color: volumeMode === "total" ? "#0E1A14" : "#666666",
                        cursor: "pointer",
                      }}
                    >
                      Volumen Total
                    </button>
                    <button
                      type="button"
                      onClick={() => setVolumeMode("bottles")}
                      style={{
                        padding: "4px 10px",
                        fontSize: 11,
                        fontWeight: 600,
                        borderRadius: 4,
                        border: "none",
                        backgroundColor: volumeMode === "bottles" ? "#ffffff" : "transparent",
                        color: volumeMode === "bottles" ? "#0E1A14" : "#666666",
                        cursor: "pointer",
                      }}
                    >
                      Por Botellas (Kits)
                    </button>
                  </div>
                </div>

                {volumeMode === "total" ? (
                  <div>
                    {/* Quick Presets */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                      {[10, 30, 50, 100, 300, 500, 1000].map((ml) => (
                        <button
                          key={ml}
                          type="button"
                          onClick={() => setTotalVolumeMl(ml)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            border: totalVolumeMl === ml ? "1px solid #2B5F4A" : "1px solid #DDDDDD",
                            backgroundColor: totalVolumeMl === ml ? "#2B5F4A" : "#ffffff",
                            color: totalVolumeMl === ml ? "#ffffff" : "#444444",
                            cursor: "pointer",
                          }}
                        >
                          {ml === 1000 ? "1 Litro (1000 ml)" : `${ml} ml`}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="number"
                        min={1}
                        max={10000}
                        value={totalVolumeMl}
                        onChange={(e) => setTotalVolumeMl(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: 140,
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid #CCCCCC",
                          fontSize: 15,
                          fontWeight: 700,
                          outline: "none",
                        }}
                      />
                      <span style={{ fontSize: 13, color: "#666666" }}>
                        ml &nbsp;(~{(totalVolumeMl / 29.5735).toFixed(2)} fl oz)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#666666", marginBottom: 4 }}>Número de Botellas:</div>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        value={bottleCount}
                        onChange={(e) => setBottleCount(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: 110,
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid #CCCCCC",
                          fontSize: 14,
                          fontWeight: 700,
                          outline: "none",
                        }}
                      />
                    </div>

                    <div>
                      <div style={{ fontSize: 11, color: "#666666", marginBottom: 4 }}>Tamaño por Botella (ml):</div>
                      <select
                        value={bottleSizeMl}
                        onChange={(e) => setBottleSizeMl(Number(e.target.value))}
                        style={{
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: "1px solid #CCCCCC",
                          fontSize: 14,
                          fontWeight: 700,
                          backgroundColor: "#ffffff",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value={10}>10 ml (Roll-on / Travel)</option>
                        <option value={30}>30 ml (Spray Mediano)</option>
                        <option value={50}>50 ml (Estándar Oficial Scentlabs)</option>
                        <option value={100}>100 ml (Gran Formato)</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                      <div style={{ padding: "10px 14px", backgroundColor: "#F4F7F5", borderRadius: 8, fontSize: 12, color: "#2B5F4A", fontWeight: 700 }}>
                        Total: {effectiveTotalMl} ml (~{(effectiveTotalMl / 29.5735).toFixed(2)} oz)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Formula Results Display */}
            <div
              style={{
                backgroundColor: "#0E1A14",
                color: "#ffffff",
                borderRadius: 16,
                padding: "28px 26px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 12px 35px rgba(0,0,0,0.3)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#5EAB85" }}>
                    FÓRMULA EXACTA DE PRODUCCIÓN
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)" }}>
                    Base 100% Volumétrica
                  </span>
                </div>

                {/* Target Specs Summary */}
                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", marginBottom: 4 }}>
                    {isCustom ? `Fórmula Personalizada (${customPercentage}%)` : activePreset?.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.65)" }}>
                    Volumen Total: <strong style={{ color: "#ffffff" }}>{effectiveTotalMl} ml</strong> &nbsp;·&nbsp;
                    Concentración: <strong style={{ color: "#5EAB85" }}>{activePercentage}%</strong>
                  </div>
                </div>

                {/* Visual Ratio Bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255, 255, 255, 0.7)", marginBottom: 6 }}>
                    <span>🌸 Esencia Pura: <strong>{activePercentage}%</strong></span>
                    <span>🧪 Base Alcohólica: <strong>{100 - activePercentage}%</strong></span>
                  </div>
                  <div style={{ height: 10, width: "100%", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: 9999, overflow: "hidden", display: "flex" }}>
                    <div style={{ width: `${activePercentage}%`, backgroundColor: "#5EAB85", transition: "width 0.3s ease" }} />
                    <div style={{ width: `${100 - activePercentage}%`, backgroundColor: "#D4AF37", transition: "width 0.3s ease" }} />
                  </div>
                </div>

                {/* Ingredient Breakdown */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  
                  {/* Fragrance Oil Card */}
                  <div style={{ backgroundColor: "rgba(94, 171, 133, 0.12)", border: "1px solid rgba(94, 171, 133, 0.3)", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#5EAB85", fontWeight: 700, marginBottom: 4 }}>
                      🌸 Esencia Pura
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>
                      {fragranceOilMl} <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255, 255, 255, 0.6)" }}>ml</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", marginTop: 4 }}>
                      ~{fragranceOilOz} fl oz ({Math.round(fragranceOilMl * 20)} gotas aprox.)
                    </div>
                  </div>

                  {/* Alcohol Base Card */}
                  <div style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid rgba(212, 175, 55, 0.3)", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#E0B354", fontWeight: 700, marginBottom: 4 }}>
                      🧪 Base Alcohólica
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>
                      {alcoholBaseMl} <span style={{ fontSize: 13, fontWeight: 400, color: "rgba(255, 255, 255, 0.6)" }}>ml</span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.5)", marginTop: 4 }}>
                      ~{alcoholBaseOz} fl oz (SDA 40-B Scentlabs)
                    </div>
                  </div>

                </div>

                {/* Practical Instruction */}
                <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.5, padding: "12px 14px", backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 8, borderLeft: "3px solid #5EAB85" }}>
                  💡 <strong>Instrucción de Laboratorio:</strong> Mide con jeringa graduada <strong>{fragranceOilMl} ml</strong> de esencia pura y completa con <strong>{alcoholBaseMl} ml</strong> de base alcohólica en tu frasco.
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ marginTop: 22, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleCopyFormula}
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: copiedFormula ? "#1E4735" : "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {copiedFormula ? (
                    <>
                      <Check size={15} color="#5EAB85" />
                      <span>¡Fórmula Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copiar Fórmula</span>
                    </>
                  )}
                </button>

                <Link
                  href="/kits"
                  style={{
                    flex: 1,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "12px 16px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    backgroundColor: "#5EAB85",
                    color: "#0E1A14",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                >
                  <ShoppingBag size={15} />
                  <span>Comprar Kit Insumos</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── TUTORIAL MAESTRO PASO A PASO ── */}
      <section id="paso-a-paso" style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 24px" }}>
        
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 50px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2B5F4A", display: "block", marginBottom: 8 }}>
            GUÍA PRÁCTICA DE ELABORACIÓN
          </span>
          <h2
            style={{
              fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 700,
              color: "#0E1A14",
              margin: "0 0 16px",
              fontFamily: "var(--font-bodoni), Georgia, serif",
            }}
          >
            Paso a Paso: Cómo Crear tu Perfume
          </h2>
          <p style={{ fontSize: 15, color: "#666666", lineHeight: 1.6, margin: 0 }}>
            Sigue estos 5 pasos fundamentales recomendados por perfumistas para lograr una fragancia de alta duración, estela balanceada y acabado comercial.
          </p>
        </div>

        {/* Steps Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* STEP 1 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E9E7",
              borderRadius: 16,
              padding: "32px 36px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            }}
            className="step-row"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5F2", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#2B5F4A" }}>PASO</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#2B5F4A", lineHeight: 1 }}>01</span>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1A14", margin: "0 0 8px" }}>
                Prepara tu Área de Trabajo y Esteriliza los Frascos
              </h3>
              <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, margin: "0 0 14px" }}>
                Trabaja sobre una superficie limpia, seca y libre de corrientes de aire o polvo. Asegúrate de que las botellas de vidrio transparente estén totalmente secas en su interior antes de verter los líquidos para evitar turbidez en la solución.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "#2B5F4A", fontWeight: 600 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 size={14} /> Botellas de vidrio limpias
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 size={14} /> Jeringas y pipetas nuevas
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle2 size={14} /> Entorno ventilado
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E9E7",
              borderRadius: 16,
              padding: "32px 36px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            }}
            className="step-row"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5F2", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#2B5F4A" }}>PASO</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#2B5F4A", lineHeight: 1 }}>02</span>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1A14", margin: "0 0 8px" }}>
                Dosifica la Esencia Concentrada Primero (30% Recomendado)
              </h3>
              <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, margin: "0 0 14px" }}>
                Utiliza una jeringa de 5 ml o pipeta graduada para extraer la esencia de contratipo pura. Para una botella de <strong>50 ml a concentración del 30%</strong>, mide exactamente <strong>15 ml de esencia</strong> y viértela directamente en el frasco de vidrio.
              </p>
              <div style={{ backgroundColor: "#F9F9F8", borderLeft: "3px solid #2B5F4A", padding: "10px 14px", borderRadius: 6, fontSize: 12, color: "#444444" }}>
                <strong>Tip de Perfumista:</strong> Siempre vierte el aceite esencial en el frasco antes que el alcohol para asegurar una correcta solubilidad y evitar que el alcohol se evapore durante la medición.
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E9E7",
              borderRadius: 16,
              padding: "32px 36px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            }}
            className="step-row"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5F2", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#2B5F4A" }}>PASO</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#2B5F4A", lineHeight: 1 }}>03</span>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1A14", margin: "0 0 8px" }}>
                Agrega la Base Alcohólica de Perfumería (SDA 40-B)
              </h3>
              <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, margin: "0 0 14px" }}>
                Rellena el frasco con la base alcohólica oficial Scentlabs (para los 50 ml totales, agrega <strong>35 ml de base alcohólica</strong>). La base formulada ya contiene el equilibrio químico para fijación y apertura olfativa óptima.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#C05621", backgroundColor: "#FFF8F0", padding: "8px 12px", borderRadius: 6 }}>
                <AlertTriangle size={15} />
                <span>Nunca utilices alcohol isopropílico o de farmacia al 70%; arruinan el perfil olfativo y resecan la piel.</span>
              </div>
            </div>
          </div>

          {/* STEP 4 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E9E7",
              borderRadius: 16,
              padding: "32px 36px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
            }}
            className="step-row"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5F2", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#2B5F4A" }}>PASO</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#2B5F4A", lineHeight: 1 }}>04</span>
            </div>
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1A14", margin: "0 0 8px" }}>
                Cierra Herméticamente y Homogeneiza la Mezcla
              </h3>
              <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, margin: "0 0 14px" }}>
                Coloca la bomba atomizadora o spray dorado y enrosca o presiona firmemente. Realiza suaves movimientos en forma de ocho (8) o rotación suave durante 30 a 60 segundos para permitir que las moléculas aromáticas se dispersen uniformemente en el etanol.
              </p>
              <div style={{ fontSize: 12, color: "#666666" }}>
                ⚠️ Evita agitar violentamente para no atrapar microburbujas de aire excesivas que aceleren la oxidación inicial.
              </div>
            </div>
          </div>

          {/* STEP 5 */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #2B5F4A",
              borderRadius: 16,
              padding: "32px 36px",
              display: "grid",
              gridTemplateColumns: "100px 1fr",
              gap: 28,
              boxShadow: "0 8px 30px rgba(43, 95, 74, 0.08)",
            }}
            className="step-row"
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#2B5F4A", color: "#ffffff", borderRadius: 12, padding: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#A8D5BA" }}>PASO</span>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#ffffff", lineHeight: 1 }}>05</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0E1A14", margin: 0 }}>
                  El Secreto Maestro: Maceración en Frío (7 a 14 Días)
                </h3>
                <span style={{ fontSize: 10, fontWeight: 800, backgroundColor: "#E6F3ED", color: "#2B5F4A", padding: "3px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                  Paso Crítico
                </span>
              </div>
              <p style={{ fontSize: 14, color: "#555555", lineHeight: 1.6, margin: "0 0 14px" }}>
                Guarda tu perfume en un lugar <strong>fresco, seco y totalmente oscuro</strong> (como un armario o caja) a una temperatura constante de 16°C a 20°C durante <strong>mínimo 7 a 14 días</strong>.
              </p>
              <div style={{ backgroundColor: "#F0F5F2", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#2B5F4A", lineHeight: 1.5 }}>
                <strong>¿Qué sucede durante la maceración?</strong> El alcohol pierde su nota penetrante inicial, los enlaces químicos de las notas de fondo (ámbar, maderas, vainilla, almizcle) maduran y la fragancia adquiere su verdadera estela, redondez y fijación duradera de 12+ horas.
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ── FAQ Y CONSEJOS PRO ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 80px", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#0E1A14", color: "#ffffff", borderRadius: 20, padding: "48px 40px" }}>
          <div style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 40px" }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#5EAB85", display: "block", marginBottom: 6 }}>
              PREGUNTAS FRECUENTES
            </span>
            <h3 style={{ fontSize: 28, fontWeight: 700, margin: 0, fontFamily: "var(--font-bodoni), Georgia, serif" }}>
              Secretos y Preguntas de Perfumistas
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="faq-grid">
            
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 12, padding: 22, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#5EAB85", margin: "0 0 8px" }}>
                ¿Por qué mi perfume huele a alcohol en el primer spray?
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, margin: 0 }}>
                Las fragancias recién preparadas no han tenido tiempo de que el alcohol se ensamble con el aceite. Con 48 a 72 horas de reposo la nota de alcohol disminuye drásticamente, y tras 14 días desaparece por completo al atomizar.
              </p>
            </div>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 12, padding: 22, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#5EAB85", margin: "0 0 8px" }}>
                ¿Por qué usamos el 30% en los Kits Emprendedor?
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, margin: 0 }}>
                El 30% corresponde a la categoría <strong>Extrait de Parfum</strong>. Garantiza una duración superior a 10-12 horas en piel y ropa, lo que genera que tus clientes queden fascinados con la calidad y recomienden tu marca de inmediato.
              </p>
            </div>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 12, padding: 22, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#5EAB85", margin: "0 0 8px" }}>
                ¿Puedo usar botellas de plástico para guardar mis perfumes?
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, margin: 0 }}>
                Para maceración en taller se usa plástico HDPE de grado laboratorio, pero para el producto final siempre se debe usar <strong>vidrio</strong>. El vidrio no reacciona químicamente, conserva los aceites esenciales y ofrece una presentación premium.
              </p>
            </div>

            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.04)", borderRadius: 12, padding: 22, border: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: "#5EAB85", margin: "0 0 8px" }}>
                ¿Qué hago si quiero empezar a vender ya?
              </h4>
              <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)", lineHeight: 1.6, margin: 0 }}>
                El <strong>Kit Emprendedor de 6 Perfumes ($49.99)</strong> incluye todo lo necesario medido con precisión (botellas de 50ml, 2 esencias de 2 oz a elección, base alcohólica, jeringas y etiquetas).
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA TO KITS ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto 100px", padding: "0 24px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #183327 0%, #2B5F4A 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: "48px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 24,
            boxShadow: "0 15px 40px rgba(43, 95, 74, 0.25)",
          }}
        >
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#A8D5BA", display: "block", marginBottom: 6 }}>
              TODO LISTO PARA EMPEZAR
            </span>
            <h3 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px", fontFamily: "var(--font-bodoni), Georgia, serif" }}>
              Adquiere tu Kit Emprendedor por solo $49.99
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.85)", margin: 0, maxWidth: 540 }}>
              Recibe 6 botellas oficiales de 50 ml, tus 2 esencias favoritas de 2 oz, base alcohólica y herramientas para crear tus primeros 300 ml de perfume.
            </p>
          </div>

          <Link
            href="/kits"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              backgroundColor: "#ffffff",
              color: "#183327",
              padding: "16px 32px",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              textDecoration: "none",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s",
            }}
          >
            <ShoppingBag size={18} color="#183327" />
            <span>Ver Kits Emprendedor</span>
            <ArrowRight size={18} color="#183327" />
          </Link>
        </div>
      </section>

      {/* Responsive Styles */}
      <style jsx global>{`
        @media (max-width: 900px) {
          .calc-grid {
            grid-template-columns: 1fr !important;
          }
          .step-row {
            grid-template-columns: 1fr !important;
            padding: 24px !important;
          }
          .faq-grid {
            grid-template-columns: 1fr !important;
          }
          .preset-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
