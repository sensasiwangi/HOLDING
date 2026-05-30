import type { Metadata } from "next";
import { LangProvider } from "@/lib/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PT Sensasi Wangi Indonesia",
  description: "Holding parfum Indonesia — SWI Store, Fragrantions, Brand Parfum, Marketplace sensasiwangi.id",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="antialiased bg-[#080c0a] text-white">
        <LangProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
