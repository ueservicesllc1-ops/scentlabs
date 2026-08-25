"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Package,
  TrendingUp,
  HelpCircle,
  MessageCircle,
  ShoppingBag,
  Search,
  X,
  ChevronRight,
  Info,
  Droplets,
  Award,
  Layers,
  ArrowRight,
  Check
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { INITIAL_FRAGRANCES } from "@/data/fragrances";
import { FragranceOil } from "@/types/fragrance";
import { Product } from "@/types/product";

export default function EntrepreneurKitsPage() {
  const { addItem } = useCart();

  // Fragrance selector state
  const [selectedFragrance1, setSelectedFragrance1] = useState<FragranceOil | null>(null);
  const [selectedFragrance2, setSelectedFragrance2] = useState<FragranceOil | null>(null);
  const [modalSlot, setModalSlot] = useState<1 | 2 | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>("all");
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>("all");
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Default fragrance pre-selection for a seamless starting experience
  useEffect(() => {
    if (INITIAL_FRAGRANCES && INITIAL_FRAGRANCES.length >= 2) {
      if (!selectedFragrance1) {
        // Look for popular ones like Sauvage or Aventus or first available
        const sauv = INITIAL_FRAGRANCES.find((f) => f.name?.toLowerCase().includes("sauvage")) || INITIAL_FRAGRANCES[0];
        setSelectedFragrance1(sauv);
      }
      if (!selectedFragrance2) {
        const bacc = INITIAL_FRAGRANCES.find((f) => f.name?.toLowerCase().includes("baccarat") || f.name?.toLowerCase().includes("rouge")) || INITIAL_FRAGRANCES[1];
        setSelectedFragrance2(bacc);
      }
    }
  }, []);

  // Filtered fragrances for modal selection
  const filteredFragrances = (INITIAL_FRAGRANCES || []).filter((frag) => {
    if (!frag || !frag.name) return false;
    const matchSearch =
      searchQuery.trim() === "" ||
      frag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (frag.fragranceReference && frag.fragranceReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (frag.scentFamily && frag.scentFamily.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchGender =
      selectedGenderFilter === "all" ||
      (frag.gender && frag.gender.toLowerCase() === selectedGenderFilter.toLowerCase());

    const matchFamily =
      selectedFamilyFilter === "all" ||
      (frag.scentFamily && frag.scentFamily.toLowerCase() === selectedFamilyFilter.toLowerCase());

    return matchSearch && matchGender && matchFamily;
  });

  const scentFamilies = ["all", "Woody", "Floral", "Fresh", "Citrus", "Amber", "Gourmand", "Oriental"];

  const handleSelectFragrance = (frag: FragranceOil) => {
    if (modalSlot === 1) {
      setSelectedFragrance1(frag);
    } else if (modalSlot === 2) {
      setSelectedFragrance2(frag);
    }
    setModalSlot(null);
    setSearchQuery("");
  };

  const handleAddKit6ToCart = () => {
    if (!selectedFragrance1 || !selectedFragrance2) {
      alert("Por favor selecciona las 2 fragancias de 2 oz para tu kit antes de añadir al carrito.");
      return;
    }

    const kitPkg = {
      id: "pkg_kit_6",
      quantity: 1,
      price: 49.99,
      unitPrice: 49.99,
      isDefault: true,
    };

    const kitProduct: Product = {
      id: "prod_kit_emprendedor_6",
      name: "Kit Emprendedor — 6 Perfumes de 50 ml",
      slug: "kit-emprendedor-6-perfumes",
      description: "Kit completo para preparar 6 perfumes de 50 ml con botellas de vidrio, 2 esencias de 2 oz a elección, base alcohólica y herramientas.",
      shortDescription: "Todo lo necesario para preparar tus primeros 6 perfumes de 50 ml.",
      categoryId: "cat_kits",
      category: "kits",
      basePrice: 49.99,
      currency: "USD",
      packageOptions: [kitPkg],
      sku: "KIT-EMP-06P-50ML",
      unit: "kit",
      status: "active",
      tags: ["kit", "emprendedor", "perfumes", "50ml"],
      inventory: {
        quantityInStock: 50,
        reservedQuantity: 0,
        availableQuantity: 50,
        lowStockThreshold: 5,
        reorderPoint: 10,
        status: "in_stock",
      },
      media: [
        {
          id: "med_kit_6",
          url: "/heromodal.png",
          altText: "Kit Emprendedor — 6 Perfumes de 50 ml",
          isPrimary: true,
          sortOrder: 1,
          b2Key: "",
        },
      ],
      hasVariants: false,
      attributes: {
        capacity: "6 Perfumes × 50 ml (300 ml total)",
        fragrance1: `${selectedFragrance1.name} (2 oz)`,
        fragrance2: `${selectedFragrance2.name} (2 oz)`,
        alcoholBase: "8 oz Base Alcohólica Oficial Scentlabs Supply",
        bottles: "6 × Botellas transparentes rectangulares 50ml con tapa dorada",
        tools: "1 × Jeringa 5ml, 2 × Pipetas 5ml, 6 × Etiquetas identificadoras",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addItem(
      kitProduct,
      kitPkg,
      1,
      {
        isCustomItem: true,
        selectedVariant: {
          id: `var_kit6_${selectedFragrance1.id}_${selectedFragrance2.id}`,
          name: `Kit 6 Perfumes [1: ${selectedFragrance1.name} (2 oz) | 2: ${selectedFragrance2.name} (2 oz)]`,
          sku: `KIT-6P-${selectedFragrance1.id.slice(0, 5)}-${selectedFragrance2.id.slice(0, 5)}`,
        },
      }
    );

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
  };

  const whatsappMessage = encodeURIComponent(
    "¡Hola SCENTLABS! Quiero asesoría para elegir las fragancias de mi Kit Emprendedor y comenzar mi negocio de perfumes."
  );
  const whatsappUrl = `https://wa.me/19393166822?text=${whatsappMessage}`;

  return (
    <div style={{ backgroundColor: "#FBFBFA", minHeight: "100vh", color: "#1A1A1A" }}>
      {/* ── Top Hero Banner ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #09130E 0%, #0E1A14 60%, #15271F 100%)",
          color: "#ffffff",
          padding: "60px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(94, 171, 133, 0.18) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 48, alignItems: "center" }} className="hero-grid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "rgba(94, 171, 133, 0.15)",
                  border: "1px solid rgba(94, 171, 133, 0.4)",
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
                <Sparkles size={14} />
                Lanzamiento Exclusivo · Scentlabs Supply
              </div>

              <h1
                style={{
                  fontSize: "clamp(32px, 5vw, 54px)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                  margin: "0 0 20px",
                  fontFamily: "var(--font-bodoni), Georgia, serif",
                  letterSpacing: "-0.01em",
                }}
              >
                EMPIEZA TU NEGOCIO DE PERFUMERÍA
              </h1>

              <p
                style={{
                  fontSize: "17px",
                  lineHeight: 1.6,
                  color: "rgba(255, 255, 255, 0.8)",
                  margin: "0 0 28px",
                  maxWidth: 580,
                }}
              >
                Compra tu primer kit, prepara tus perfumes y comienza a vender.
                <br />
                <strong style={{ color: "#5EAB85" }}>Empieza pequeño. Vende. Crece.</strong>
              </p>

              {/* Pillars */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 36,
                  fontSize: 13,
                  color: "rgba(255, 255, 255, 0.75)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#5EAB85" />
                  <span>Botellas oficiales 50ml con tapa dorada</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#5EAB85" />
                  <span>Concentración al 30% de esencia</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={16} color="#5EAB85" />
                  <span>Herramientas y etiquetas incluidas</span>
                </div>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <a
                  href="#kit-6"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    backgroundColor: "#5EAB85",
                    color: "#0E1A14",
                    padding: "16px 32px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    boxShadow: "0 8px 24px rgba(94, 171, 133, 0.35)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>Comprar Kit Emprendedor</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#ffffff",
                    padding: "16px 26px",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <MessageCircle size={18} color="#5EAB85" />
                  <span>Necesito Asesoría</span>
                </a>
              </div>
            </div>

            {/* Hero Graphic / Photo */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid rgba(94, 171, 133, 0.3)",
                  boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
                  backgroundColor: "#060D09",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/heromodal.png"
                  alt="Kits para Emprendedores Scentlabs Supply"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Catalog / Pricing Comparison ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px 100px" }}>
        
        {/* Section Heading */}
        <div style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 50px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#2B5F4A", display: "block", marginBottom: 8 }}>
            ELIGE TU NIVEL DE INICIO
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
            Kits Oficiales para Emprendedores
          </h2>
          <p style={{ fontSize: 15, color: "#666666", lineHeight: 1.6, margin: 0 }}>
            Todo lo necesario para comenzar tu negocio de perfumería utilizando los mismos componentes de grado clínico y esencias puras que respaldan a Scentlabs Supply.
          </p>
        </div>

        {/* ── 3 Kits Cards Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, alignItems: "stretch", marginBottom: 60 }} className="kits-grid">
          
          {/* ════════════════════════════════════════════════════════════════════
              KIT 1: 🟢 KIT EMPRENDEDOR — 6 PERFUMES ($49.99)
              ════════════════════════════════════════════════════════════════════ */}
          <div
            id="kit-6"
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #2B5F4A",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 12px 40px rgba(43, 95, 74, 0.12)",
              position: "relative",
            }}
          >
            {/* Top Badge */}
            <div
              style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#2B5F4A",
                color: "#ffffff",
                padding: "4px 16px",
                borderRadius: 9999,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              ⭐ MÁS POPULAR / RECOMENDADO
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2B5F4A" }}>
                KIT EMPRENDEDOR
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0E1A14", margin: "4px 0 8px", fontFamily: "var(--font-bodoni), Georgia, serif" }}>
                6 Perfumes de 50 ml
              </h3>
              <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.5, margin: 0 }}>
                Todo lo necesario para preparar tus primeros 6 perfumes y comenzar a vender hoy mismo.
              </p>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #EEEEEE" }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: "#0E1A14" }}>$49.99</span>
              <span style={{ fontSize: 13, color: "#888888" }}>USD / Kit Completo</span>
            </div>

            {/* Included Items */}
            <div style={{ flex: 1, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333333", marginBottom: 12 }}>
                Qué incluye este kit:
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#444444" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#2B5F4A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>6 × Botellas vacías de 50 ml</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Vidrio transparente rectangular, tapa dorada oficial. Sin etiquetas pegadas.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#2B5F4A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>2 × Esencias de perfume de 2 oz</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>4 oz de esencia en total. Puedes escoger 2 fragancias diferentes del catálogo.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#2B5F4A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>1 × Base alcohólica de 8 oz</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Botella y etiqueta oficial de Scentlabs Supply formulada para fijación premium.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#2B5F4A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Herramientas de Dosificación</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>1 × Jeringa de 5 ml + 2 × Pipetas plásticas de 5 ml.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#2B5F4A" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>6 × Etiquetas Identificadoras</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Entregadas por separado para identificar cada uno de tus 6 perfumes.</div>
                  </div>
                </li>
              </ul>

              {/* Formula explanation */}
              <div style={{ backgroundColor: "#F4F7F5", border: "1px solid #D5E4DC", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#2B5F4A", lineHeight: 1.5 }}>
                <strong>🔬 Producción a Concentración de Referencia del 30%:</strong>
                <div style={{ marginTop: 4, color: "#44554C" }}>
                  6 perfumes × 50 ml = 300 ml terminados (90 ml de esencia + 210 ml base alcohólica).
                </div>
              </div>
            </div>

            {/* Interactive Fragrance Selector Card */}
            <div style={{ backgroundColor: "#F9F9F8", border: "1px solid #E5E5E3", borderRadius: 12, padding: 18, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0E1A14" }}>
                  🌸 Escoge tus 2 Fragancias
                </span>
                <span style={{ fontSize: 10, color: "#777777" }}>2 oz cada una</span>
              </div>

              {/* Fragrance Slot 1 */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "#666666", marginBottom: 4, fontWeight: 600 }}>Fragancia #1:</div>
                <button
                  type="button"
                  onClick={() => setModalSlot(1)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #CCCCCC",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFragrance1 ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0E1A14" }}>{selectedFragrance1.name}</div>
                        <div style={{ fontSize: 10, color: "#666666" }}>
                          {selectedFragrance1.fragranceReference || `${selectedFragrance1.gender || "Unisex"} · ${selectedFragrance1.scentFamily || "Concentrado"}`}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#888888" }}>Seleccionar Fragancia #1...</span>
                    )}
                  </div>
                  <ChevronRight size={16} color="#888888" />
                </button>
              </div>

              {/* Fragrance Slot 2 */}
              <div>
                <div style={{ fontSize: 11, color: "#666666", marginBottom: 4, fontWeight: 600 }}>Fragancia #2:</div>
                <button
                  type="button"
                  onClick={() => setModalSlot(2)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #CCCCCC",
                    borderRadius: 8,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                >
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFragrance2 ? (
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0E1A14" }}>{selectedFragrance2.name}</div>
                        <div style={{ fontSize: 10, color: "#666666" }}>
                          {selectedFragrance2.fragranceReference || `${selectedFragrance2.gender || "Unisex"} · ${selectedFragrance2.scentFamily || "Concentrado"}`}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "#888888" }}>Seleccionar Fragancia #2...</span>
                    )}
                  </div>
                  <ChevronRight size={16} color="#888888" />
                </button>
              </div>
            </div>

            {/* Potential Sales Block */}
            <div
              style={{
                backgroundColor: "#FFFBF0",
                border: "1px solid #EEDBB2",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "#976A13", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
                💰 ¿Cuánto podrías vender?
              </div>
              <div style={{ fontSize: 13, color: "#333333", lineHeight: 1.4 }}>
                Si vendes: <strong>6 perfumes × $20 = $120 en ventas potenciales</strong>
              </div>
              <div style={{ fontSize: 12, color: "#666666", marginTop: 2 }}>
                El kit cuesta: <strong style={{ color: "#2B5F4A" }}>$49.99</strong>
              </div>
              <div style={{ fontSize: 10, color: "#888888", marginTop: 6, fontStyle: "italic", lineHeight: 1.3 }}>
                * Ejemplo de ventas. Los resultados pueden variar según precio de venta, costos y demanda. No representa garantía de ganancia; son $120 en ventas potenciales.
              </div>
            </div>

            {/* Asesoría Link */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", backgroundColor: "#F0F4F2", borderRadius: 8, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#2B5F4A" }}>
                ¿No sabes qué fragancias elegir?
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#2B5F4A",
                  textDecoration: "underline",
                }}
              >
                Quiero Asesoría
              </a>
            </div>

            {/* Add To Cart CTA Button */}
            <button
              type="button"
              onClick={handleAddKit6ToCart}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                backgroundColor: addedSuccess ? "#1E4735" : "#2B5F4A",
                color: "#ffffff",
                padding: "16px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 6px 18px rgba(43, 95, 74, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              {addedSuccess ? (
                <>
                  <Check size={18} />
                  <span>¡Kit Añadido al Carrito!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>Comprar Kit ($49.99)</span>
                </>
              )}
            </button>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              KIT 2: 🔵 KIT EMPRENDEDOR — 12 PERFUMES (Precio Próximamente)
              ════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4A6E8C" }}>
                KIT ESCALABILIDAD
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0E1A14", margin: "4px 0 8px", fontFamily: "var(--font-bodoni), Georgia, serif" }}>
                12 Perfumes de 50 ml
              </h3>
              <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.5, margin: 0 }}>
                Para emprendedores que quieren comenzar con mayor volumen y catálogo expandido.
              </p>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #EEEEEE" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#4A6E8C" }}>Próximamente</span>
              <span style={{ fontSize: 12, color: "#888888" }}>Precio mayorista en cálculo</span>
            </div>

            {/* Included Items */}
            <div style={{ flex: 1, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333333", marginBottom: 12 }}>
                Qué incluye este kit:
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#444444" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#4A6E8C" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>12 × Botellas vacías de 50 ml</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Vidrio transparente con tapa dorada oficial.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#4A6E8C" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>2 × 4 oz de Esencia Concentrada</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Suficiente esencia para 12 perfumes a concentración del 30% (180 ml / ~6.1 oz).</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#4A6E8C" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>16 oz Base Alcohólica Oficial</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>420 ml necesarios (~14.2 oz) con etiqueta Scentlabs Supply.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#4A6E8C" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>12 × Etiquetas Identificadoras</strong>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#4A6E8C" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Herramientas completas (Jeringas + Pipetas)</strong>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#F0F4F8",
                border: "1px solid #CBDCE8",
                color: "#2C4E6D",
                padding: "16px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <MessageCircle size={16} />
              <span>Solicitar Asesoría</span>
            </a>
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              KIT 3: 🟣 KIT EMPRENDEDOR — 24 PERFUMES (Revendedores)
              ════════════════════════════════════════════════════════════════════ */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #E5E5E5",
              borderRadius: 16,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#7B4B94" }}>
                KIT REVENDEDORES / MAYORISTA
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 700, color: "#0E1A14", margin: "4px 0 8px", fontFamily: "var(--font-bodoni), Georgia, serif" }}>
                24 Perfumes de 50 ml
              </h3>
              <p style={{ fontSize: 13, color: "#666666", lineHeight: 1.5, margin: 0 }}>
                La opción de máxima rentabilidad para distribución, boutiques y revendedores activos.
              </p>
            </div>

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #EEEEEE" }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "#7B4B94" }}>Consultar</span>
              <span style={{ fontSize: 12, color: "#888888" }}>Precios por volumen B2B</span>
            </div>

            {/* Included Items */}
            <div style={{ flex: 1, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#333333", marginBottom: 12 }}>
                Qué incluye este kit:
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10, fontSize: 13, color: "#444444" }}>
                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#7B4B94" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>24 × Botellas vacías de 50 ml</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Vidrio transparente con tapa dorada oficial Scentlabs.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#7B4B94" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Esencias para 1,200 ml totales</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>A 30%: 360 ml de esencia (~12.2 oz) con selección de fragancias.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#7B4B94" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Base Alcohólica (840 ml / ~28.4 oz)</strong>
                    <div style={{ fontSize: 11, color: "#777777" }}>Presentación comercial conveniente.</div>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#7B4B94" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>24 × Etiquetas + Instrucciones Básicas</strong>
                  </div>
                </li>

                <li style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Check size={16} color="#7B4B94" style={{ marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <strong>Herramientas completas (Jeringas + Pipetas)</strong>
                  </div>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                backgroundColor: "#F7F2FA",
                border: "1px solid #E1D2EB",
                color: "#5C2B75",
                padding: "16px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                textDecoration: "none",
                textAlign: "center",
                transition: "all 0.2s ease",
              }}
            >
              <MessageCircle size={16} />
              <span>Consultar Precio Mayorista</span>
            </a>
          </div>

        </div>

        {/* ── Guidance & Step-by-Step Production Guide ── */}
        <div
          style={{
            backgroundColor: "#0E1A14",
            color: "#ffffff",
            borderRadius: 16,
            padding: "48px 40px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
          }}
          className="steps-grid"
        >
          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#5EAB85", marginBottom: 12 }}>01</div>
            <h4 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Recibe tu Kit Completo</h4>
            <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6, margin: 0 }}>
              Recibirás en tu puerta las botellas oficiales de 50 ml, las esencias puras seleccionadas, la base alcohólica y todas las herramientas de medición.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#5EAB85", marginBottom: 12 }}>02</div>
            <h4 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Formula y Envasa</h4>
            <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6, margin: 0 }}>
              Con las jeringas y pipetas incluidas, dosifica 15 ml de esencia y 35 ml de base alcohólica por cada botella para lograr una concentración profesional del 30%.
            </p>
          </div>

          <div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#5EAB85", marginBottom: 12 }}>03</div>
            <h4 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px" }}>Etiqueta y Vende</h4>
            <p style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6, margin: 0 }}>
              Coloca las etiquetas identificadoras en cada botella y comienza a comercializar tus perfumes con tu propia marca o catálogo entre tus clientes.
            </p>
          </div>
        </div>

      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FRAGRANCE SELECTION MODAL
          ════════════════════════════════════════════════════════════════════ */}
      {modalSlot !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setModalSlot(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              width: "100%",
              maxWidth: 720,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #EEEEEE", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#2B5F4A" }}>
                  Catálogo Scentlabs Supply
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: "2px 0 0", color: "#0E1A14" }}>
                  Escoge tu Fragancia #{modalSlot} (2 oz)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalSlot(null)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid #DDDDDD",
                  backgroundColor: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search & Filters */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #EEEEEE", backgroundColor: "#FAFAFA" }}>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <Search size={16} color="#888888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, diseñador (Sauvage, Baccarat, Creed...) o notas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 38px",
                    borderRadius: 8,
                    border: "1px solid #D0D0D0",
                    fontSize: 13,
                    outline: "none",
                  }}
                  autoFocus
                />
              </div>

              {/* Filter Pills */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#666666" }}>Género:</div>
                {["all", "masculine", "feminine", "unisex"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGenderFilter(g)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 9999,
                      fontSize: 11,
                      border: selectedGenderFilter === g ? "1px solid #2B5F4A" : "1px solid #DDDDDD",
                      backgroundColor: selectedGenderFilter === g ? "#2B5F4A" : "#ffffff",
                      color: selectedGenderFilter === g ? "#ffffff" : "#666666",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {g === "all" ? "Todos" : g === "masculine" ? "Masculino" : g === "feminine" ? "Femenino" : "Unisex"}
                  </button>
                ))}
              </div>
            </div>

            {/* Fragrance List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }}>
              <div style={{ fontSize: 11, color: "#888888", marginBottom: 12 }}>
                Mostrando {filteredFragrances.length} fragancias disponibles
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="frag-select-grid">
                {filteredFragrances.slice(0, 80).map((frag) => {
                  const isSelected =
                    (modalSlot === 1 && selectedFragrance1?.id === frag.id) ||
                    (modalSlot === 2 && selectedFragrance2?.id === frag.id);

                  return (
                    <div
                      key={frag.id}
                      onClick={() => handleSelectFragrance(frag)}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: isSelected ? "2px solid #2B5F4A" : "1px solid #E0E0E0",
                        backgroundColor: isSelected ? "#F2F7F4" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor: "#EEEEEE",
                              color: "#555555",
                            }}
                          >
                            {frag.gender === "masculine" ? "Masculino (M)" : frag.gender === "feminine" ? "Femenino (F)" : "Unisex (U)"}
                          </span>

                          <span style={{ fontSize: 10, color: "#888888" }}>
                            {frag.scentFamily || "Esencia Pura"}
                          </span>
                        </div>

                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0E1A14", marginBottom: 2 }}>
                          {frag.name}
                        </div>

                        {frag.fragranceReference && (
                          <div style={{ fontSize: 11, color: "#2B5F4A", fontStyle: "italic", marginBottom: 4 }}>
                            {frag.fragranceReference}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginTop: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: isSelected ? "#2B5F4A" : "#888888",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          {isSelected ? (
                            <>
                              <Check size={14} />
                              Seleccionada
                            </>
                          ) : (
                            "Elegir"
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid #EEEEEE", backgroundColor: "#FAFAFA", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setModalSlot(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 6,
                  border: "1px solid #CCCCCC",
                  backgroundColor: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Style adjustments */}
      <style jsx global>{`
        @media (max-width: 960px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .kits-grid {
            grid-template-columns: 1fr !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 24px !important;
          }
          .frag-select-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
