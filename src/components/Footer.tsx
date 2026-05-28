"use client";

import { useLang } from "@/lib/LangContext";
import { dict } from "@/lib/dictionary";

export default function Footer() {
  const { lang } = useLang();

  function tr(key: string): string {
    const keys = key.split(".");
    let val: any = dict;
    for (const k of keys) {
      val = val?.[k];
      if (!val) return key;
    }
    if (typeof val === "object" && val[lang]) return val[lang];
    return val;
  }

  return (
    <footer className="no-print bg-[var(--ink)] text-[#d8e8e1] mt-10">
      {/* Print header */}
      <div className="print-only p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--brand)]">PT Sensasi Wangi Indonesia</h1>
        <p className="text-[var(--muted)] mt-2">Fragrance Commerce, Experience & Ecosystem</p>
        <p className="text-xs mt-4 text-[var(--muted)]">sensasiwangi.id</p>
      </div>
      <div className="max-w-[1240px] mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="text-[var(--brand)] font-extrabold text-lg mb-3">PT SWI</div>
          <p className="text-[#a8c4b8]">{tr("footer.copyright")}</p>
          <p className="mt-2 text-[#a8c4b8]">{tr("footer.address")}</p>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-white">{tr("footer.social")}</h4>
          <div className="space-y-2">
            <a href="https://www.instagram.com/fragrantions" target="_blank" rel="noopener noreferrer" className="block text-[#a8c4b8] hover:text-white">
              Instagram: @fragrantions
            </a>
            <a href="#" className="block text-[#a8c4b8] hover:text-white">
              WhatsApp Channel
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3 text-white">{tr("nav.contact")}</h4>
          <p className="text-[#a8c4b8]">Taman Mini Indonesia Indah</p>
          <p className="text-[#a8c4b8]">Jakarta, Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
