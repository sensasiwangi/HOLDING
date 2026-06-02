"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, FlaskConical, ShoppingBag, MessageCircle,
  Instagram, Youtube, Mail, ChevronDown, ChevronUp,
  Star, Download, ExternalLink, Sparkles, Award,
  CheckCircle2, X, Send,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// LINK DATA
// ═══════════════════════════════════════════════════════════════

const LINKS = [
  { id: "ebook-bundle", title: "📚 Bundle 3 Ebook Parfum", subtitle: "Lengkap: Teknis + Bisnis + AI | Rp 97.000", url: "#", icon: "📚", badge: "BEST SELLER", highlight: true, type: "product" },
  { id: "ebook-1", title: "Panduan Membangun Parfum dari Nol", subtitle: "8 bab | Formula, bahan, QC, 5 resep | Rp 47.000", url: "#", icon: "📗", type: "product" },
  { id: "ebook-2", title: "Bisnis Parfum: Formula ke Brand", subtitle: "8 bab | Pricing, marketing, legal | Rp 47.000", url: "#", icon: "📙", type: "product" },
  { id: "ebook-3", title: "AI + Parfum: Modern Perfumery", subtitle: "10 bab | GPT-4o, automation | Rp 47.000", url: "#", icon: "📘", type: "product" },
  { id: "buy-custom", title: "🧪 Custom Parfum Studio", subtitle: "Buat parfum personal | Mulai Rp 35.000", url: "#", icon: "🧪", type: "product" },
  { id: "workshop", title: "🎓 Kelas Perfumery", subtitle: "Belajar bikin parfum | Online & Offline", url: "#", icon: "🎓", type: "product" },
  { id: "wa",    title: "💬 Chat WhatsApp",  subtitle: "Konsultasi gratis 24/7", url: "https://wa.me/6281234567890", icon: "💬", external: true },
  { id: "ig",    title: "📸 Instagram",      subtitle: "@sensasiwangi",            url: "https://instagram.com/sensasiwangi", icon: "📸", external: true },
  { id: "yt",    title: "🎬 YouTube",         subtitle: "Tutorial perfumery",        url: "https://youtube.com/@sensasiwangi", icon: "🎬", external: true },
  { id: "email", title: "✉ Email",            subtitle: "hello@sensasiwangi.id",     url: "mailto:hello@sensasiwangi.id", icon: "✉", external: true },
];

const PRODUCTS: Record<string, any> = {
  "ebook-bundle": {
    title: "Bundle 3 Ebook Parfum Lengkap", price: "Rp 97.000", original: "Rp 141.000",
    desc: "26 bab, 25.000+ kata. Semua yang butuh untuk jadi perfumer profesional.",
    features: ["26 bab lengkap", "50+ material sheets", "5 formula parfum", "Business plan template", "AI prompt engineering", "Lifetime access"],
    includes: ["Book 1: Teknis Parfum", "Book 2: Bisnis Parfum", "Book 3: AI + Parfum"],
  },
  "ebook-1": {
    title: "Panduan Membangun Parfum dari Nol", price: "Rp 47.000", original: "Rp 69.000",
    desc: "Dari nol jadi bisa bikin parfum EDP 30ml sendiri. Step-by-step.",
    features: ["Anatomi parfum", "50+ material wajib tahu", "Formula & takaran detail", "Mixing step-by-step", "QC & IFRA compliance", "5 formula lengkap"],
    includes: ["PDF 150+ halaman", "Checklist mixing", "Template formula card"],
  },
  "ebook-2": {
    title: "Bisnis Parfum: Formula ke Brand", price: "Rp 47.000", original: "Rp 69.000",
    desc: "Mulai bisnis parfum dari nol. Legal, marketing, scaling.",
    features: ["7 business model", "HPP & pricing calculator", "Legal & BPOM guide", "Instagram & marketplace strategy", "Financial planning template", "3 studi kasus"],
    includes: ["PDF 120+ halaman", "P&L template", "Marketing calendar"],
  },
  "ebook-3": {
    title: "AI + Parfum: Modern Perfumery", price: "Rp 47.000", original: "Rp 69.000",
    desc: "Gunakan AI untuk formula generation, compliance check, automation.",
    features: ["Setup GPT-4o untuk parfum", "Prompt engineering master", "Text/Image-to-Scent pipeline", "AI compliance checker", "Data science untuk perfumer", "Future trends"],
    includes: ["PDF 100+ halaman", "10+ prompt templates", "API integration guide"],
  },
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function LinksPage() {
  const [expandProduct, setExpandProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", product: "" });
  const [formStep, setFormStep] = useState<"select" | "details" | "success">("select");
  const [stats, setStats] = useState({ clicks: 0, visitors: 0 });

  // Track page view
  useEffect(() => {
    const s = { clicks: Math.floor(Math.random() * 200) + 50, visitors: Math.floor(Math.random() * 500) + 100 };
    setStats(s);
  }, []);

  const openProduct = (id: string) => {
    setExpandProduct(id);
    setFormData((f) => ({ ...f, product: PRODUCTS[id]?.title || id }));
    setFormStep("details");
  };

  const handlePurchase = async () => {
    if (!formData.name || !formData.email || !formData.phone) return;
    setFormStep("success");
    // In production: POST to /api/order
    console.log("Order:", formData);
  };

  return (
    <div className="min-h-screen bg-[#080c0a] text-white">
      <div className="max-w-md mx-auto px-5 py-8">
        {/* ──  Header ── */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 via-emerald-500 to-teal-600 mx-auto mb-4 flex items-center justify-center shadow-xl shadow-teal-500/20 ring-4 ring-teal-500/10">
            <FlaskConical size={36} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-white mb-1">Sensasi Wangi Indonesia</h1>
          <p className="text-xs text-[#6b9e8f] mb-3">Parfum Edukasi • Custom Perfume • Digital Products</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-[#4a6a5a]">
            <span>👁 {stats.visitors} visitors</span>
            <span>🔗 {stats.clicks} clicks</span>
          </div>
        </div>

        {/* ──  Hero CTA ── */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-teal-500/15 via-teal-500/5 to-transparent border border-teal-500/20 text-center">
          <div className="text-[10px] text-teal-400 font-bold uppercase tracking-wider mb-1">🔥 Penawaran Spesial</div>
          <div className="text-sm font-black text-white mb-1">Bundle 3 Ebook Parfum Lengkap</div>
          <div className="text-xs text-[#6b9e8f] mb-2">Teknis + Bisnis + AI | Save 31%</div>
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="text-lg font-black text-teal-400">Rp 97.000</span>
            <span className="text-xs text-[#4a6a5a] line-through">Rp 141.000</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-bold">HEMAT 31%</span>
          </div>
          <button onClick={() => openProduct("ebook-bundle")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-all active:scale-[0.98]">
            🛒 Beli Sekarang
          </button>
        </div>

        {/* ──  Link List ── */}
        <div className="space-y-2.5 mb-8">
          {LINKS.map((link) => (
            <div key={link.id}>
              {link.type === "product" ? (
                /* Product card with expand */
                <div>
                  <button onClick={() => setExpandProduct(expandProduct === link.id ? null : link.id)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left ${
                      link.highlight
                        ? "bg-teal-500/10 border-teal-500/25 hover:border-teal-500/40"
                        : expandProduct === link.id
                          ? "bg-white/[0.06] border-white/15"
                          : "bg-white/[0.03] border-white/[0.07] hover:border-white/15 hover:bg-white/[0.05]"
                    }`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                      link.highlight ? "bg-teal-500/20" : "bg-white/[0.08]"
                    }`}>{link.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {link.title}
                        {link.badge && <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-500/15 text-orange-400">{link.badge}</span>}
                      </div>
                      <div className="text-[10px] text-[#4a6a5a] truncate">{link.subtitle}</div>
                    </div>
                    <div className="text-[#4a6a5a]">{expandProduct === link.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                  </button>

                  {/* Expanded product detail */}
                  {expandProduct === link.id && PRODUCTS[link.id] && (
                    <div className="mt-1.5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] animate-fade-up">
                      <div className="text-xs font-bold text-white mb-1">{PRODUCTS[link.id].title}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-black text-teal-400">{PRODUCTS[link.id].price}</span>
                        <span className="text-[10px] text-[#4a6a5a] line-through">{PRODUCTS[link.id].original}</span>
                      </div>
                      <p className="text-[11px] text-[#6b9e8f] mb-3">{PRODUCTS[link.id].desc}</p>
                      <div className="grid grid-cols-1 gap-1 mb-3">
                        {PRODUCTS[link.id].features.map((f: string, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[10px] text-[#6b9e8f]">
                            <CheckCircle2 size={10} className="text-teal-400 flex-shrink-0" />{f}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => openProduct(link.id)}
                        className="w-full py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-xs hover:shadow-lg transition-all">
                        🛒 Beli {PRODUCTS[link.id].price}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Regular external link */
                <a href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.05] transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.08] flex items-center justify-center text-lg">{link.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white">{link.title}</div>
                    <div className="text-[10px] text-[#4a6a5a] truncate">{link.subtitle}</div>
                  </div>
                  <ExternalLink size={12} className="text-[#4a6a5a] group-hover:text-white transition-colors" />
                </a>
              )}
            </div>
          ))}
        </div>

        {/* ──  Purchase Form Modal ── */}
        {expandProduct !== null && formStep !== "select" && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setExpandProduct(null); setFormStep("select"); }}>
            <div className="w-full max-w-md bg-[#0d1117] rounded-t-2xl sm:rounded-2xl border border-white/[0.08] p-5 max-h-[85vh] overflow-y-auto animate-slide-up"
              onClick={(e) => e.stopPropagation()}>

              {formStep === "details" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold text-white">Form Pembelian</div>
                    <button onClick={() => { setExpandProduct(null); setFormStep("select"); }} className="p-1 rounded-lg hover:bg-white/5"><X size={16} /></button>
                  </div>
                  {PRODUCTS[expandProduct] && (
                    <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/15 mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-white">{PRODUCTS[expandProduct].title}</span>
                        <span className="text-xs font-black text-teal-400">{PRODUCTS[expandProduct].price}</span>
                      </div>
                      <div className="text-[9px] text-[#4a6a5a]">Digital download • Lifetime access</div>
                    </div>
                  )}
                  <div className="space-y-3 mb-4">
                    <div><label className="block text-[10px] font-semibold text-[#6b9e8f] mb-1 uppercase">Nama</label>
                      <input className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/50" placeholder="Nama lengkap" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div><label className="block text-[10px] font-semibold text-[#6b9e8f] mb-1 uppercase">Email</label>
                      <input type="email" className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/50" placeholder="email@contoh.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                    <div><label className="block text-[10px] font-semibold text-[#6b9e8f] mb-1 uppercase">WhatsApp</label>
                      <input className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-teal-500/50" placeholder="0812..." value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                  </div>

                  {/* Payment info */}
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-4">
                    <div className="text-[10px] font-bold text-white mb-2">💳 Metode Pembayaran</div>
                    <div className="space-y-2 text-[10px] text-[#6b9e8f]">
                      <div className="flex items-center gap-2"><span>🏦</span> Transfer Bank: BCA 123-456-789 (a/n SWI)</div>
                      <div className="flex items-center gap-2"><span>📱</span> QRIS (scan di WhatsApp setelah order)</div>
                      <div className="flex items-center gap-2"><span>🅿️</span> OVO/GoPay/Dana: 0812-345-6789</div>
                    </div>
                  </div>

                  <button onClick={handlePurchase}
                    disabled={!formData.name || !formData.email || !formData.phone}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <Send size={14} /> Kirim Pesanan
                  </button>
                  <p className="text-[9px] text-[#4a6a5a] text-center mt-2">Setelah bayar, link download dikirim via Email & WhatsApp</p>
                </>
              )}

              {formStep === "success" && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} className="text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white mb-2">Pesanan Terkirim! 🎉</div>
                  <p className="text-[11px] text-[#6b9e8f] mb-4">
                    Terima kasih {formData.name}! Pesanan <b>{PRODUCTS[expandProduct]?.title}</b> sudah diterima.
                    <br /><br />
                    Silakan konfirmasi pembayaran via WhatsApp. Link download akan dikirim setelah pembayaran dikonfirmasi.
                  </p>
                  <a href="https://wa.me/6281234567890?text=Halo%20SWI%20saya%20sudah%20order%20ebook" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition-all">
                    <MessageCircle size={14} /> Konfirmasi via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──  Footer ── */}
        <div className="text-center pt-6 border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[#4a6a5a] mb-2">
            <Sparkles size={10} className="text-teal-400" />
            Powered by OWL AI Agent
            <Sparkles size={10} className="text-teal-400" />
          </div>
          <p className="text-[9px] text-[#3d5048]">© 2026 Sensasi Wangi Indonesia | All rights reserved</p>
        </div>
      </div>
    </div>
  );
}
