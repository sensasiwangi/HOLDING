"use client";

import { useLang } from "@/lib/LangContext";

export default function LanguagePDF() {
  const { lang } = useLang();

  return (
    <div className="hidden print:block print-header">
      <div style={{ borderBottom: "3px solid #0f7b63", paddingBottom: "12px", marginBottom: "16px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0f7b63", margin: 0 }}>
          PT Sensasi Wangi Indonesia
        </h1>
        <p style={{ fontSize: "13px", color: "#555", margin: "4px 0 0" }}>
          {lang === "id"
            ? "Holding Parfum Indonesia — Produk, Pengalaman, Event & Marketplace"
            : "Indonesian Fragrance Holding — Products, Experiences, Events & Marketplace"}
        </p>
        <p style={{ fontSize: "11px", color: "#888", margin: "4px 0 0" }}>
          sensasiwangi.id | info@sensasiwangi.id | TIM, Jakarta
        </p>
      </div>
    </div>
  );
}
