import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "SCENTLAB — Professional Fragrance Supplies & Custom Labels",
  description:
    "Everything you need to create, package and sell your own fragrances. High-grade perfume bases, roll-on bottles, atomizers, custom foil labels, pipettes, and wholesale fractioning.",
  keywords: [
    "fragrance supplies",
    "perfume bottles",
    "custom perfume labels",
    "roll on bottles 10ml",
    "perfume base",
    "blotter strips",
    "perfume packaging",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
