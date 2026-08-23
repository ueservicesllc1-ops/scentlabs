export const siteConfig = {
  name: "SCENTLAB",
  tagline: "Professional Fragrance Supplies & Packaging",
  description: "Everything you need to create, package and sell your own fragrances.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://scentlab.pro",
  ogImage: "https://scentlab.pro/og.jpg",
  links: {
    shop: "/shop",
    fragrance: "/fragrance",
    bottles: "/bottles",
    packaging: "/packaging",
    tools: "/tools",
    testing: "/testing",
    custom: "/custom",
    kits: "/kits",
    wholesale: "/wholesale",
    account: "/account",
    cart: "/cart",
    admin: "/admin",
  },
  contact: {
    email: "support@scentlab.pro",
    phone: "+1 (800) 555-SCENT",
    address: "SCENTLAB Distro Center, Industrial Supply Zone, USA",
  },
  businessRules: {
    defaultMinimumMargin: 0.25, // 25% minimum margin guard
    volumeDiscountRate: 0.20, // 20% OFF for 3+ packages
    volumeDiscountMinPackages: 3,
  },
};

export type SiteConfig = typeof siteConfig;
