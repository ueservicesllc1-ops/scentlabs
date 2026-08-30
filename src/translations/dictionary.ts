export type Language = "es" | "en";

export interface Translations {
  common: {
    announcement: string;
    announcementFacility: string;
    announcementLocation: string;
    search: string;
    searchPlaceholder: string;
    account: string;
    myAccount: string;
    cart: string;
    close: string;
    adminPin: string;
    language: string;
    spanish: string;
    english: string;
  };
  nav: {
    kits: string;
    fragrances: string;
    perfumes: string;
    bottles: string;
    packaging: string;
    labels: string;
    tutorial: string;
    catalog: string;
    wholesalePortal: string;
  };
  bottomBar: {
    home: string;
    catalog: string;
    kits: string;
    fragrances: string;
    cart: string;
    promoBadge: string;
  };
  hero: {
    eyebrow: string;
    mobileTitle: string;
    mobileSubtitle: string;
    desktopSubtitle: string;
    shopFragrances: string;
    kitsPromo: string;
    allCategories: string;
    badgeReferences: string;
    viewCatalog: string;
  };
  stats: {
    referencesCount: string;
    referencesLabel: string;
    gradeA: string;
    gradeALabel: string;
    sizes: string;
    sizesLabel: string;
    sameDay: string;
    sameDayLabel: string;
  };
  categories: {
    sectionTitle: string;
    sectionSubtitle: string;
    viewAll: string;
    rawOilsTitle: string;
    rawOilsDesc: string;
    bottlesTitle: string;
    bottlesDesc: string;
    packagingTitle: string;
    packagingDesc: string;
    labelsTitle: string;
    labelsDesc: string;
    perfumesTitle: string;
    perfumesDesc: string;
    kitsTitle: string;
    kitsDesc: string;
    kitsBadge: string;
  };
  trending: {
    eyebrow: string;
    title: string;
    viewCatalog: string;
    stockReady: string;
    fromPrice: string;
    viewDetails: string;
    loading: string;
  };
  cta: {
    badge: string;
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    brandTagline: string;
    catalogCol: string;
    packagingCol: string;
    supportCol: string;
    companyCol: string;
    allFragrances: string;
    perfumeOils: string;
    finishedPerfumes: string;
    kitsTitle: string;
    glassBottles: string;
    rollOnBottles: string;
    customBoxes: string;
    customLabels: string;
    contactSupport: string;
    shippingInfo: string;
    tutorialTitle: string;
    termsConditions: string;
    privacyPolicy: string;
    wholesaleNotice: string;
    allRightsReserved: string;
    builtForMakers: string;
  };
  cartDrawer: {
    title: string;
    units: string;
    wholesaleBatch: string;
    freeShippingUnlocked: string;
    freeShippingRemaining: string;
    emptyTitle: string;
    emptySubtitle: string;
    browseCatalog: string;
    subtotal: string;
    discounts: string;
    freightNotice: string;
    totalDue: string;
    viewFullCart: string;
    proceedCheckout: string;
  };
}

export const translations: Record<Language, Translations> = {
  es: {
    common: {
      announcement: "Envío gratis en órdenes superiores a $250 · Suministros y Mezcla de Perfumería al Por Mayor",
      announcementFacility: "Laboratorio Directo",
      announcementLocation: "Miami, FL",
      search: "Buscar",
      searchPlaceholder: "Buscar fragancias, frascos, insumos...",
      account: "Cuenta",
      myAccount: "Mi Cuenta / Portal Mayorista",
      cart: "Carrito",
      close: "Cerrar",
      adminPin: "Panel de Administración (PIN 1619)",
      language: "Idioma",
      spanish: "Español",
      english: "English",
    },
    nav: {
      kits: "Kits",
      fragrances: "Esencias",
      perfumes: "Perfumes",
      bottles: "Frascos",
      packaging: "Empaques",
      labels: "Etiquetas",
      tutorial: "Tutorial",
      catalog: "Catálogo",
      wholesalePortal: "Portal Mayorista",
    },
    bottomBar: {
      home: "Inicio",
      catalog: "Catálogo",
      kits: "Kits",
      fragrances: "Esencias",
      cart: "Carrito",
      promoBadge: "PROMO",
    },
    hero: {
      eyebrow: "Suministros Mayoristas de Perfumería",
      mobileTitle: "Todo para Formular Perfumes de Lujo",
      mobileSubtitle: "Esencias puras Grado A, frascos clínicos, cajas y etiquetas personalizadas para emprendedores y marcas.",
      desktopSubtitle: "Esencias puras, frascos clínicos, cajas y etiquetas personalizadas para marcas y perfumistas.",
      shopFragrances: "Ver Esencias",
      kitsPromo: "Kits $49.99",
      allCategories: "Ver Catálogo",
      badgeReferences: "1,600+ Concentrados Grado A",
      viewCatalog: "Ver Catálogo →",
    },
    stats: {
      referencesCount: "1,600+",
      referencesLabel: "Referencias de Fragancia",
      gradeA: "Grado-A",
      gradeALabel: "Concentrados Puros",
      sizes: "6 Tamaños",
      sizesLabel: "Por Fragancia",
      sameDay: "Mismo Día",
      sameDayLabel: "Despacho Directo en EE. UU.",
    },
    categories: {
      sectionTitle: "Suministros para la Creación de Perfumes",
      sectionSubtitle: "Materia prima formulada a granel para casas de fragancia, marcas independientes y perfumistas.",
      viewAll: "Ver Todas las Categorías →",
      rawOilsTitle: "Aceites de Fragancia",
      rawOilsDesc: "1,600+ concentrados puros Grado A",
      bottlesTitle: "Frascos de Vidrio",
      bottlesDesc: "Vidrio clínico, atomizadores finos y roll-ons",
      packagingTitle: "Cajas y Empaques",
      packagingDesc: "Cajas rígidas, cajas plegables y tubos",
      labelsTitle: "Etiquetas Personalizadas",
      labelsDesc: "Foil metálico con acabado impermeable",
      perfumesTitle: "Perfumes Terminados",
      perfumesDesc: "Listos para retail y distribución",
      kitsTitle: "Kits para Emprender",
      kitsDesc: "Todo incluido para iniciar tu marca",
      kitsBadge: "OFERTA",
    },
    trending: {
      eyebrow: "Materias Primas Esenciales",
      title: "Lo Más Solicitado",
      viewCatalog: "Ver Catálogo Completo →",
      stockReady: "En Stock · Despacho Hoy",
      fromPrice: "Desde",
      viewDetails: "Ver Detalles →",
      loading: "Cargando esenciales...",
    },
    cta: {
      badge: "Formulación a Granel y Personalización",
      title: "¿Creando tu propia marca de perfumes?",
      subtitle: "Asesoramos a más de 400 marcas independientes con aceites concentrados, botellas exclusivas y foil labels personalizados.",
      button: "Comenzar con un Asesor",
    },
    footer: {
      brandTagline: "Suministros mayoristas directos de laboratorio para perfumistas, marcas de autor e industrias aromáticas. Miami, Florida.",
      catalogCol: "Catálogo",
      packagingCol: "Empaque y Marca",
      supportCol: "Soporte",
      companyCol: "Empresa",
      allFragrances: "Todas las Esencias",
      perfumeOils: "Aceites Grado-A",
      finishedPerfumes: "Perfumes Listos",
      kitsTitle: "Kits de Inicio",
      glassBottles: "Frascos de Vidrio",
      rollOnBottles: "Roll-ons y Sprays",
      customBoxes: "Cajas Rígidas",
      customLabels: "Etiquetas con Foil",
      contactSupport: "Contacto y Ayuda",
      shippingInfo: "Política de Envíos",
      tutorialTitle: "Guía de Formulación",
      termsConditions: "Términos y Condiciones",
      privacyPolicy: "Política de Privacidad",
      wholesaleNotice: "Ventas al por mayor y suministros para emprendedores.",
      allRightsReserved: "Todos los derechos reservados.",
      builtForMakers: "Hecho para formuladores de fragancia.",
    },
    cartDrawer: {
      title: "Tu Selección",
      units: "Unidades",
      wholesaleBatch: "Lote mayorista en formulación",
      freeShippingUnlocked: "¡Calificas para Envío Gratis!",
      freeShippingRemaining: "para Envío Gratis",
      emptyTitle: "Tu carrito está vacío",
      emptySubtitle: "Explora nuestro catálogo de esencias puras, frascos clínicos y etiquetas.",
      browseCatalog: "Explorar Catálogo",
      subtotal: "Subtotal",
      discounts: "Descuentos por Volumen",
      freightNotice: "Calculado al finalizar compra",
      totalDue: "Total a Pagar",
      viewFullCart: "Ver Carrito Completo",
      proceedCheckout: "Continuar al Pago",
    },
  },
  en: {
    common: {
      announcement: "Free shipping on orders over $250 · Wholesale Perfume Compounding & Supplies",
      announcementFacility: "Direct Compounding Facility",
      announcementLocation: "Miami, FL",
      search: "Search",
      searchPlaceholder: "Search fragrances, bottles, supplies...",
      account: "Account",
      myAccount: "My Account / Wholesale Portal",
      cart: "Cart",
      close: "Close",
      adminPin: "Admin Dashboard (PIN 1619)",
      language: "Language",
      spanish: "Español",
      english: "English",
    },
    nav: {
      kits: "Kits",
      fragrances: "Fragrances",
      perfumes: "Perfumes",
      bottles: "Bottles",
      packaging: "Packaging",
      labels: "Labels",
      tutorial: "Tutorial",
      catalog: "Catalog",
      wholesalePortal: "Wholesale Portal",
    },
    bottomBar: {
      home: "Home",
      catalog: "Catalog",
      kits: "Kits",
      fragrances: "Fragrances",
      cart: "Cart",
      promoBadge: "PROMO",
    },
    hero: {
      eyebrow: "Wholesale Perfume Supplies · EST. 2024",
      mobileTitle: "Everything to Craft Luxury Perfumes",
      mobileSubtitle: "Pure Grade-A fragrance oils, clinical bottles, custom boxes and labels for creators and brands.",
      desktopSubtitle: "Fragrance oils, bottles, custom labels & packaging for perfume makers.",
      shopFragrances: "Shop Fragrances",
      kitsPromo: "Kits $49.99",
      allCategories: "All Categories",
      badgeReferences: "1,600+ Grade-A Concentrates",
      viewCatalog: "View Catalog →",
    },
    stats: {
      referencesCount: "1,600+",
      referencesLabel: "Fragrance References",
      gradeA: "Grade-A",
      gradeALabel: "Pure Uncut Concentrates",
      sizes: "6 Sizes",
      sizesLabel: "Per Fragrance",
      sameDay: "Same-Day",
      sameDayLabel: "Direct US Dispatch",
    },
    categories: {
      sectionTitle: "Perfume Manufacturing Supplies",
      sectionSubtitle: "Bulk compounding raw materials for fragrance houses, indie brands, and formulators.",
      viewAll: "View All Categories →",
      rawOilsTitle: "Fragrance Oils",
      rawOilsDesc: "1,600+ pure Grade-A concentrates",
      bottlesTitle: "Glass Bottles",
      bottlesDesc: "Clinical glassware, fine mist atomizers & roll-ons",
      packagingTitle: "Boxes & Packaging",
      packagingDesc: "Rigid boxes, folding cartons & tubes",
      labelsTitle: "Custom Labels",
      labelsDesc: "Metallic foil with waterproof coating",
      perfumesTitle: "Finished Perfumes",
      perfumesDesc: "Ready for retail distribution",
      kitsTitle: "Starter Kits",
      kitsDesc: "Everything included to launch your brand",
      kitsBadge: "SALE",
    },
    trending: {
      eyebrow: "Core Raw Materials",
      title: "Trending Essentials",
      viewCatalog: "View Full Catalog →",
      stockReady: "In Stock · Dispatched Today",
      fromPrice: "From",
      viewDetails: "View Details →",
      loading: "Loading essentials...",
    },
    cta: {
      badge: "Bulk Compounding & Private Label",
      title: "Building your own perfume brand?",
      subtitle: "We partner with over 400 indie brands providing concentrated oils, exclusive bottles, and custom metallic foil labels.",
      button: "Talk to a Perfume Specialist",
    },
    footer: {
      brandTagline: "Direct lab compounding supplies for perfumers, artisanal brands and scent designers. Miami, Florida.",
      catalogCol: "Catalog",
      packagingCol: "Packaging & Branding",
      supportCol: "Support",
      companyCol: "Company",
      allFragrances: "All Fragrances",
      perfumeOils: "Grade-A Oils",
      finishedPerfumes: "Ready Perfumes",
      kitsTitle: "Starter Kits",
      glassBottles: "Glass Bottles",
      rollOnBottles: "Roll-ons & Sprays",
      customBoxes: "Rigid Boxes",
      customLabels: "Foil Labels",
      contactSupport: "Contact & Help",
      shippingInfo: "Shipping Policy",
      tutorialTitle: "Formulation Guide",
      termsConditions: "Terms & Conditions",
      privacyPolicy: "Privacy Policy",
      wholesaleNotice: "Wholesale supplies for entrepreneurs and fragrance formulators.",
      allRightsReserved: "All rights reserved.",
      builtForMakers: "Crafted for fragrance creators.",
    },
    cartDrawer: {
      title: "Order Selection",
      units: "Units",
      wholesaleBatch: "Wholesale compounding batch",
      freeShippingUnlocked: "You qualify for Free Shipping!",
      freeShippingRemaining: "away from Free Shipping",
      emptyTitle: "Your bag is empty",
      emptySubtitle: "Explore our catalog of raw fragrance oils, clinical bottles, and labels.",
      browseCatalog: "Browse Catalog",
      subtotal: "Subtotal",
      discounts: "Volume Tier Discounts",
      freightNotice: "Calculated at checkout",
      totalDue: "Total Due",
      viewFullCart: "View Full Cart",
      proceedCheckout: "Proceed to Checkout",
    },
  },
};
