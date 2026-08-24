import type { Metadata } from "next";
import { Inter, Bodoni_Moda, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ScentSommelierChat } from "@/components/ai/ScentSommelierChat";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SCENTLAB | Wholesale Fragrance & Packaging",
  description:
    "Premium fragrance oils, clinical-grade packaging, and custom foil labels for creators, perfumers and growing fragrance brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${inter.variable} ${bodoni.variable} ${cormorant.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;600;700&family=Marcellus&family=Montserrat:wght@400;600;700&family=Oswald:wght@400;600&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400..700;1,400..700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface text-on-surface font-body-md antialiased flex flex-col selection:bg-primary selection:text-on-primary">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <ScentSommelierChat />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
