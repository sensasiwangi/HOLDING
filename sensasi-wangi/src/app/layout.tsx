import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sensasi Wangi Indonesia",
  description: "AI Perfume Composer — Your Story, Your Scent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen" style={{ backgroundColor: "#FFF8F0" }}>
        {children}
      </body>
    </html>
  );
}
