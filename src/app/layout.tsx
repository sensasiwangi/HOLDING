import type { Metadata, Viewport } from "next";
import { LangProvider } from "@/lib/LangContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080c0a",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://holding-amber.vercel.app"),
  title: {
    default: "PT Sensasi Wangi Indonesia — Holding Parfum & Lifestyle Indonesia",
    template: "%s | PT Sensasi Wangi Indonesia",
  },
  description:
    "Holding company parfum & lifestyle Indonesia. SWI Store, Fragrantions Festival, L'Arc~en~Scent, Nuscentza, Pixel Potion. Marketplace sensasiwangi.id",
  keywords: [
    "parfum Indonesia",
    "Sensasi Wangi Indonesia",
    "SWI",
    "Fragrantions",
    "L'Arc en Scent",
    "Nuscentza",
    "Pixel Potion",
    "parfum Jakarta",
    "holding company parfum",
    "sukuk musyarakah",
    "Taman Ismail Marzuki",
  ],
  authors: [{ name: "PT Sensasi Wangi Indonesia", url: "https://holding-amber.vercel.app" }],
  creator: "PT Sensasi Wangi Indonesia",
  publisher: "PT Sensasi Wangi Indonesia",
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
  openGraph: {
    type: "website",
    locale: "id_ID",
    alternateLocale: "en_US",
    url: "https://holding-amber.vercel.app",
    siteName: "PT Sensasi Wangi Indonesia",
    title: "PT Sensasi Wangi Indonesia — Holding Parfum & Lifestyle Indonesia",
    description:
      "Holding company parfum & lifestyle Indonesia. SWI Store, Fragrantions Festival, L'Arc~en~Scent, Nuscentza, Pixel Potion.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "PT Sensasi Wangi Indonesia" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Sensasi Wangi Indonesia",
    description: "Holding company parfum & lifestyle Indonesia",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://holding-amber.vercel.app",
    languages: { id: "https://holding-amber.vercel.app", en: "https://holding-amber.vercel.app?lang=en" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
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
